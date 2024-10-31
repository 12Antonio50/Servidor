require('dotenv').config();

const Encuestas = require("../models/encuestas");
const {
    OUTLOOK_EMAIL,
    user_SendGrid,
    apikey,
} = process.env;
const nodemailer = require("nodemailer");

/**
 * Administrador 
 * Función para crear una nueva encuesta (Formulario)
 */
async function crearEncuesta(req, res) {
    // Desestructuración de los datos desde el cuerpo de la solicitud
    const {
        titulo,
        descripcion,
        fecha,
        creador,
        //docente,
        preguntas,
        respuestas,
        clase
    } = req.body;

    // Validación de los campos requeridos
    if (!titulo) res.status(400).send({ msg: "Titulo es requerido" });
    if (!descripcion) res.status(400).send({ msg: "Descripcion es requerida" });
    if (!fecha) res.status(400).send({ msg: "Fecha es requirda" });
    if (!creador) res.status(400).send({ msg: "Creador es requirido" });
    //if (!docente) res.status(400).send({ msg: "Docente es requirido" });
    if (!preguntas) res.status(400).send({ msg: "Preguntas son requeridas" });

    // Crear una nueva instancia de la encuesta
    const encuesta = new Encuestas({
        titulo,
        descripcion,
        fecha,
        creador,
        //docente,
        preguntas,
        respuestas,
        clase
    });

    // Guardar la encuesta en la base de datos
    try {
        const surveyStorage = await encuesta.save();
        res.status(200).send(surveyStorage);
    } catch (error) {
        res.status(400).send({ msg: "Error al cargar los datos" });
        throw error;
    }
}

/**
 * Admonistrador y administrador de apoyo
 * El unico que puede actualizar la fecha y creador es el admonistrador principal
 */

async function actualizarEncuesta(req, res) {
    const {
        tituloOriginal,
        tituloCambio,
        descripcion,
        fecha,
        creador,
        preguntas,
        clase
    } = req.body

    let titulo = "";

    if (tituloCambio) {
        titulo = tituloCambio;
    } else {
        titulo = tituloOriginal;
    }

    try {
        const encuestaActualizada = await Encuestas.findOneAndUpdate(
            { titulo: tituloOriginal },
            {
                $set: {
                    titulo,
                    descripcion,
                    fecha,
                    creador,
                    preguntas,
                    clase
                },
            },
            { new: true }
        );

        if (!encuestaActualizada) {
            res.status(400).send({ msg: "Error al actualizar los datos de la encuesta" });
        } else {
            res.status(200).send({ msg: "Datos actualizados de la encuesta" });
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Administrador
 * El unico usuario que puede eliminar las encuestas son los que tengan el rol de administrador 
 * para evitar la perdida de informacion por aprte de otros usuarios
 */

async function eliminarEncuesta(req, res) {
    const { titulo } = req.body;

    try {
        const encuestaEliminada = await Encuestas.findOneAndDelete({ titulo });

        if (!encuestaEliminada) {
            res.status(400).send({ msg: "Error, no se pudo eleminar la encuenta" });
        } else {
            res.status(200).send({ msg: "Encuesta eliminada correctamente" });
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Administrador y administrador de apoyo
 * Fincion para buscar un unica encuesta, recomendado(input que se actualize la tabla por cada letra que ingrese)
 */

async function obteberUnicaEncuesta(req, res) {
    const { titulo } = req.body;

    const response = await Encuestas.findOne({ titulo });

    if (!response) {
        res.status(400).send({ msg: "Error al obtener los datos de la encuesta" });
    } else {
        res.status(200).send(response);
    }
}

async function obtenerTodasEncuestas(req, res) {
    const response = await Encuestas.find();

    if (!response) {
        res.status(400).send({ msg: "Error, no se pudo obtener las encuestas" });
    } else {
        res.status(200).send(response);
    }
}

async function crearRespuestas(req, res) {
    const { titulo, respuestas } = req.body;

    try {
        const encuesta = await Encuestas.findOne({ titulo });

        if (!encuesta) {
            return res.status(400).send({ msg: "Encuesta no encontrada" });
        }

        const nuevasRespuestas = respuestas.map(({ preguntaId, tipo, valor }) => {
            const pregunta = encuesta.preguntas.find(p => p._id.toString() === preguntaId);

            if (!pregunta) {
                return res.status(400).send({ msg: `Pregunta con ID ${preguntaId} no encontrada en la encuesta` });
            }

            const respuesta = {
                preguntas: pregunta,
            };

            switch (tipo) {
                case 'respuestaAbierta':
                    respuesta.respuestaTexto = Array.isArray(valor) ? valor[0] : valor;
                    break;
                case 'seleccionDeRango':
                    respuesta.rangoSeleccionado = valor;
                    break;
                case 'escalaNumerica':
                    respuesta.escalaNumerica = valor;
                    break;
                case 'opcionMultiple':
                    respuesta.opcionesSeleccionadas = Array.isArray(valor) ? valor.filter(v => v !== null) : [valor];
                    respuesta.respuestaTexto = respuesta.opcionesSeleccionadas[0];
                    break;
                default:
                    break;
            }

            return respuesta;
        });

        // Crear un nuevo objeto en el array de respuestas
        encuesta.respuestas.push({ respuestasArray: nuevasRespuestas });
        await encuesta.save();

        // Enviar una única respuesta al cliente al final
        res.status(200).send({ msg: "Respuestas guardadas correctamente" });

    } catch (error) {
        console.error(error);
        // Enviar una única respuesta al cliente en caso de error
        res.status(500).send({ msg: "Error al procesar la solicitud" });
    }
}

async function obtenerRespuestas(req, res) {
    const { titulo } = req.body;

    try {
        const encuesta = await Encuestas.findOne({ titulo });

        if (!encuesta) {
            return res.status(400).send({ msg: "Encuesta no encontrada" });
        }

        const arraysDeRespuestas = encuesta.respuestas.map(item => item.respuestasArray);

        res.status(200).send({ arraysDeRespuestas });
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "Error al procesar la solicitud" });
    }
}

async function obtenerTodasLasRespuestas(req, res) {
    try {
        const encuestas = await Encuestas.find();

        if (!encuestas || encuestas.length === 0) {
            return res.status(400).send({ msg: "No se encontraron encuestas" });
        }

        const todasLasRespuestas = [];

        encuestas.forEach(encuesta => {
            encuesta.respuestas.forEach(item => {
                todasLasRespuestas.push(item.respuestasArray);
            });
        });

        res.status(200).send({ todasLasRespuestas });

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: "Error al procesar la solicitud" });
    }
}

async function enviarEncuesta(req, res) {
    const { url, correo } = req.body;

    //console.log(url);
    //console.log(correo);

    if (!Array.isArray(correo)) {
        return res.status(400).send({ msg: "El campo de correos electrónicos debe ser un array" });
    }

    try {

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: user_SendGrid,
                pass: apikey,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const opcionesCorreo = {
            from: OUTLOOK_EMAIL,
            to: correo,
            subject: "Participación en la encuesta",
            text: `Estimado usuario,\n\nTe invitamos a participar en una encuesta. Haz clic en el siguiente enlace para acceder:\n\n${url}\n\nGracias por tu participación.`,
        };

        transporter.sendMail(opcionesCorreo, (error, info) => {
            if (error) {
                //console.log("Error al enviar el correo", error);
                res.status(400).send({ msg: "Error al reenviar el correo al usuario" });
            } else {
                //console.log("Correo enviado", info);
                res.status(200).send({ msg: "Se ha reenviado el correo al usuario" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "Error al reenviar el correo al usuario" });
    }
}

async function obtenerEncuestascreadas(req, res) {
    try {
        const { anio } = req.body; // Obtener el año especificado en la solicitud

        const encuestas = await Encuestas.find();

        // Objeto para almacenar la cantidad de encuestas por mes, el porcentaje correspondiente y los nombres de las encuestas
        const encuestasPorMes = {};

        // Iterar sobre todas las encuestas para contar las encuestas por mes en el año especificado
        encuestas.forEach(encuesta => {
            const fecha = new Date(encuesta.fecha);
            const mes = fecha.getMonth() + 1; // Se suma 1 porque los meses van de 0 a 11
            const ano = fecha.getFullYear();

            if (ano === parseInt(anio)) { // Verificar si la encuesta es del año especificado
                // Verificar si ya existe una entrada para este mes
                if (!encuestasPorMes[mes]) {
                    encuestasPorMes[mes] = { total: 0, porcentaje: 0, nombres: [] };
                }
                // Incrementar el contador de encuestas para este mes
                encuestasPorMes[mes].total++;
                // Agregar el nombre de la encuesta a la lista de nombres
                encuestasPorMes[mes].nombres.push(encuesta.titulo);
            }
        });

        // Calcular el total de encuestas para el año especificado
        const totalEncuestasAnio = Object.values(encuestasPorMes).reduce((total, mes) => total + mes.total, 0);

        // Calcular el porcentaje de encuestas por mes
        for (const mes in encuestasPorMes) {
            const encuestasMes = encuestasPorMes[mes].total;
            encuestasPorMes[mes].porcentaje = (encuestasMes / totalEncuestasAnio) * 100;
        }

        // Enviar el resultado como respuesta
        res.status(200).send(encuestasPorMes);
    } catch (error) {
        console.error("Error al procesar la solicitud:", error.message);
        res.status(500).send({ msg: "Error al procesar la solicitud" });
    }
}


async function obtenerEncuestaMasContestadaPorMes(req, res) {
    try {
        const { anio, mes } = req.body; 

        const encuestas = await Encuestas.find();;

        // Objeto para almacenar la cantidad de respuestas por encuesta
        const respuestasPorEncuesta = {};

        // Iterar sobre todas las encuestas para contar las respuestas por encuesta en el mes y año seleccionados
        encuestas.forEach(encuesta => {
            const fecha = new Date(encuesta.fecha);
            const mesEncuesta = fecha.getMonth() + 1; // Se suma 1 porque los meses van de 0 a 11
            const anioEncuesta = fecha.getFullYear();

            if (mesEncuesta === parseInt(mes) && anioEncuesta === parseInt(anio)) { // Comparar tanto el mes como el año
                const numRespuestas = encuesta.respuestas.reduce((total, respuesta) => {
                    return total + respuesta.respuestasArray.length;
                }, 0);

                respuestasPorEncuesta[encuesta.titulo] = numRespuestas;
            }
        });

        // Convertir el objeto en una lista de objetos [{ encuesta: "titulo", respuestas: numRespuestas }, ...]
        const listaEncuestasRespuestas = Object.entries(respuestasPorEncuesta).map(([titulo, respuestas]) => ({
            encuesta: titulo,
            respuestas: respuestas
        }));

        // Ordenar la lista de encuestas por la cantidad de respuestas de menor a mayor
        const encuestasOrdenadas = listaEncuestasRespuestas.sort((a, b) => a.respuestas - b.respuestas);

        // Enviar el resultado como respuesta
        res.status(200).send(encuestasOrdenadas);
    } catch (error) {
        console.error("Error al procesar la solicitud:", error.message);
        res.status(500).send({ msg: "Error al procesar la solicitud" });
    }
}


module.exports = {
    crearEncuesta,
    actualizarEncuesta,
    eliminarEncuesta,
    obteberUnicaEncuesta,
    obtenerTodasEncuestas,
    crearRespuestas,
    obtenerRespuestas,
    obtenerTodasLasRespuestas,
    enviarEncuesta,
    obtenerEncuestascreadas,
    obtenerEncuestaMasContestadaPorMes
};