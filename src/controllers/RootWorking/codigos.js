require('dotenv').config();

const Codigos = require("../../models/RootWorking/codigos");
const Oficinas = require("../../models/RootWorking/oficina");
const {
    OUTLOOK_EMAIL,
    user_SendGrid,
    apikey,
} = process.env;
const nodemailer = require("nodemailer");

// Función para verificar solapamientos de tiempo
const verificarSolapamiento = async (diasRenta, horaInicio, horaFin) => {
    for (const dia of diasRenta) {
        // Convertir las horas de inicio y fin a objetos Date con la fecha del día específico
        const inicioReserva = new Date(`${dia}T${horaInicio}:00`);
        const finReserva = new Date(`${dia}T${horaFin}:00`);

        // Convertir la hora de inicio y fin a UTC para la comparación correcta
        const inicioReservaUTC = inicioReserva.toISOString();
        const finReservaUTC = finReserva.toISOString();

        // Buscar rentas que se solapen en el mismo día
        const rentasExistentes = await Codigos.find({
            diasRenta: new Date(dia), // Coincidencia exacta del día
            $or: [
                {
                    $and: [
                        { "horaInicio": { $lt: horaFin } },  // Inicio de la reserva en DB es antes de la hora de fin de la nueva reserva
                        { "horaFin": { $gt: horaInicio } }   // Fin de la reserva en DB es después de la hora de inicio de la nueva reserva
                    ]
                }
            ]
        });

        if (rentasExistentes.length > 0) {
            console.log("Solapamiento encontrado:\n", rentasExistentes);
            return true; // Se encontró un solapamiento
        }
    }
    return false;
};

async function crearRenta(req, res) {
    const {
        codigo,
        precio,
        numeroIntegrantes,
        paquete,
        horaInicio,
        horaFin,
        diasRenta,
        nombreArrendatario,
        precioTotal
    } = req.body;

    console.log("Solicitud recibida para crear renta:", req.body);

    // Validación de los campos requeridos
    if (!codigo || !precio || !numeroIntegrantes || !paquete || !horaInicio || !horaFin || !diasRenta || !nombreArrendatario || !precioTotal) {
        console.log("Validación fallida: Todos los campos son requeridos");
        return res.status(400).send({ msg: "Todos los campos son requeridos" });
    }

    try {
        // Definir el rango permitido: 9 am a 6 pm
        const horaInicioPermitida = new Date();
        horaInicioPermitida.setHours(9, 0, 0); // 9:00 am

        const horaFinPermitida = new Date();
        horaFinPermitida.setHours(18, 0, 0); // 6:00 pm

        // Crear objetos Date para horaInicio y horaFin
        const [inicioHora, inicioMinutos] = horaInicio.split(':').map(Number);
        const [finHora, finMinutos] = horaFin.split(':').map(Number);

        const horaInicioReserva = new Date();
        horaInicioReserva.setHours(inicioHora, inicioMinutos, 0);

        const horaFinReserva = new Date();
        horaFinReserva.setHours(finHora, finMinutos, 0);

        // Validar que las horas estén dentro del rango permitido
        if (horaInicioReserva < horaInicioPermitida || horaFinReserva > horaFinPermitida || horaInicioReserva >= horaFinReserva) {
            console.log("Validación fallida: Horario fuera del rango permitido (9 am - 6 pm) o hora de fin es antes o igual a la de inicio");
            return res.status(403).send({ msg: "Las horas de inicio y fin deben estar entre las 9 am y las 6 pm y la hora de fin debe ser posterior a la de inicio" });
        }

        // Verificar si ya existe una reserva que se solape con la nueva
        const solapamiento = await verificarSolapamiento(diasRenta, horaInicio, horaFin);

        if (solapamiento) {
            return res.status(409).send({ msg: "La reserva solapa con una ya existente" });
        }

        // Crear el nuevo objeto de renta 
        const nuevaRenta = new Codigos({
            codigo,
            fechaGeneracion: new Date(),
            estado: false,
            precio,
            numeroIntegrantes,
            paquete,
            horaInicio,
            horaFin,
            diasRenta: diasRenta.map(dia => new Date(dia)),
            nombreArrendatario,
            precioTotal
        });

        // Guardar en la base de datos
        await nuevaRenta.save();

        res.status(200).send(nuevaRenta);
    } catch (error) {
        console.error("Error al crear la renta:", error);
        res.status(500).send({ msg: "Error al crear la renta", error });
    }
}

async function eliminarCodigo(req, res) {
    const { codigo, oficina } = req.body;

    try {
        const codigoElimanado = await Codigos.findOneAndDelete({ codigo });

        if (!codigoElimanado) {
            res.status(400).send({ msg: "Error al eliminar el código" });
        } else {
            const oficinaActualizada = await Oficinas.findOneAndUpdate(
                { nombre: oficina },
                { $pull: { codigos: codigo } },
            );

            res.status(200).send({ msg: "Código eliminado" });
        }
    } catch (error) {
        throw error;
    }
}

async function editarCodigo(req, res) {
    const {
        codigo,
        estado,
        precio,
        numeroIntegrantes,
        paquete,
        nombreArrendatario,
        precioTotal
    } = req.body;

    console.log("Valores del body", req.body);

    // Convertir el estado a booleano si está presente en el cuerpo de la solicitud
    let estadoBooleano;
    if (estado !== undefined) {
        estadoBooleano = (estado === 'true' || estado === true) ? true : (estado === 'false' || estado === false) ? false : undefined;
        console.log("Estado convertido a booleano:", estadoBooleano);
    }

    // Construir el objeto de actualización, solo incluye los campos que tienen valores definidos
    const camposActualizados = {};

    if (estadoBooleano !== undefined) camposActualizados.estado = estadoBooleano;
    if (precio !== undefined) camposActualizados.precio = precio;
    if (numeroIntegrantes !== undefined) camposActualizados.numeroIntegrantes = numeroIntegrantes;
    if (paquete !== undefined) camposActualizados.paquete = paquete;
    if (nombreArrendatario !== undefined) camposActualizados.nombreArrendatario = nombreArrendatario;
    if (precioTotal !== undefined) camposActualizados.precioTotal = precioTotal;

    console.log("Campos para actualizar:", camposActualizados);

    // Actualizar el documento en la base de datos
    try {
        const codigoActualizado = await Codigos.findOneAndUpdate(
            { codigo: codigo },
            { $set: camposActualizados },
            { new: true }
        );

        if (!codigoActualizado) {
            return res.status(400).send({ msg: "No se pudo encontrar el código para actualizar" });
        } else {
            res.status(200).send(codigoActualizado);
        }
    } catch (error) {
        console.error("Error al actualizar el código:", error);
        res.status(500).send({ msg: "Error interno al actualizar el código" });
    }
}

async function obtenerCodigos(req, res) {
    try {
        const respuesta = await Codigos.find();
        if (!respuesta) {
            res.status(400).send({ msg: "Error al buscar los códigos" });
        } else {
            res.status(200).send(respuesta);
        }
    } catch (error) {
        res.status(500).send({ msg: "Error interno del servidor" });
    }
}

async function obtenerCodigosPagados(req, res) {
    try {
        const respuesta = await Codigos.find({ estado: true });
        if (!respuesta) {
            res.status(400).send({ msg: "Error al buscar los códigos pagados" });
        } else {
            res.status(200).send(respuesta);
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ msg: "Error interno del servidor" });
    }
}

async function obtenerCodigosPendientes(req, res) {
    try {
        const respuesta = await Codigos.find({ estado: false });
        if (!respuesta) {
            res.status(400).send({ msg: "Error al buscar los códigos pendientes" });
        } else {
            res.status(200).send(respuesta);
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ msg: "Error interno del servidor" });
    }
}

async function obtenerCodigoUnico(req, res) {
    const { codigo } = req.body;
    console.log(codigo)
    try {
        const respuesta = await Codigos.findOne({ codigo: codigo });
        if (!respuesta) {
            res.status(400).send({ msg: "Error al buscar los espacios" });
        } else {
            res.status(200).send(respuesta);
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ msg: "Error interno del servidor" });
    }
}

// Función para enviar el correo
const enviarCodigo = async (req, res) => {
    const {
        correo,
        codigo,
        nombreEspacio,
        horaInicio,
        horaFin,
        numeroIntegrantes,
        paquete,
        nombreArrendatario,
        precioTotal,
        diasRenta
    } = req.body;

    try {
        // Crear el transporte de nodemailer
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.user_SendGrid,
                pass: process.env.apikey,
            },
        });

        const logoURL = 'https://rootworking.mx/wp-content/uploads/2023/02/WhatsApp-Image-2023-02-14-at-17.26.23-1-e1676573595151.jpeg';

        // Función para formatear la fecha manualmente
        const formatearFecha = (fechaISO) => {
            // Extraer año, mes y día directamente de la cadena ISO
            const [anio, mes, dia] = fechaISO.split('T')[0].split('-');

            // Convertir el mes de número a nombre en español
            const meses = [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ];

            return `${dia} de ${meses[parseInt(mes, 10) - 1]} de ${anio}`;
        };

        // Generar la lista de días seleccionados
        const diasSeleccionadosHTML = diasRenta.map(dia => `
            <li style="margin-left: 20px;">${formatearFecha(dia)}</li>
        `).join('');

        // Plantilla de correo con logotipo y nombre de la empresa
        const opcionCorreo = {
            from: process.env.OUTLOOK_EMAIL,
            to: correo,
            subject: "Código de Acceso para su Espacio Rentado",
            html: `
                <div style="background-color: #F5C618; padding: 20px; border-radius: 10px; font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
                        <!-- Contenedor para el logotipo y nombre de la empresa -->
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src=${logoURL} alt="Root Working Logo" style="max-width: 150px; height: auto;"/>
                        </div>
                        
                        <h2 style="color: #007BFF;">Estimado/a ${nombreArrendatario},</h2>
                        <p>Gracias por elegir nuestros servicios para rentar el espacio <strong>${nombreEspacio}</strong>. Nos complace informarle que su reserva ha sido confirmada. A continuación, encontrará su código de acceso y la información relevante para su uso:</p>
                        <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
                            <strong>Código de Pago:</strong> <span style="color: #28a745;">${codigo}</span>
                        </p>
                        <h3>Detalles de la Reserva:</h3>
                        <ul style="list-style-type: none; padding: 0;">
                            <li><strong>Espacio Rentado:</strong> ${nombreEspacio}</li>
                            <li><strong>Hora de Inicio:</strong> ${horaInicio}</li>
                            <li><strong>Hora de Fin:</strong> ${horaFin}</li>
                            <li><strong>Número de Integrantes:</strong> ${numeroIntegrantes}</li>
                            <li><strong>Paquete Seleccionado:</strong> ${paquete}</li>
                            <li><strong>Precio total:</strong> $${precioTotal} pesos</li>
                            <li><strong>Días Seleccionados:</strong></li>
                            ${diasSeleccionadosHTML}
                        </ul>
                        <h3>Instrucciones:</h3>
                        <ol>
                            <li>Presentar este código de pago y una identificación oficial en la recepción al momento de su llegada.</li>
                            <li>Asegúrese de llegar a tiempo según los horarios indicados anteriormente.</li>
                            <li>Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos a través de este correo o llamando a <a href="tel:5549109289" style="color: #007BFF; text-decoration: none;">5549109289</a>.</li>
                        </ol>
                        <p>Le recordamos que es importante guardar este código y los detalles de su reserva en un lugar seguro.</p>
                        <p>Esperamos que disfrute de su tiempo en nuestro espacio. Gracias por confiar en nosotros.</p>
                        <br>
                        <p>Atentamente,</p>
                        <p>
                            <strong>Root Working</strong><br>
                            📞 <a href="tel:5549109289" style="color: #007BFF; text-decoration: none;">5549109289</a><br>
                            ✉️ <a href="mailto:contacto@rootworking.mx" style="color: #007BFF; text-decoration: none;">contacto@rootworking.mx</a><br>
                            🖇️ <a href="https://rootworking.mx/" style="color: #007BFF; text-decoration: none;">https://rootworking.mx/</a>
                        </p>
                    </div>
                </div>
            `
        };

        // Enviar el correo
        transporter.sendMail(opcionCorreo, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo:", error);
                res.status(400).send({ msg: "Error al enviar el correo al cliente" });
            } else {
                console.log("Correo enviado:", info.response);
                res.status(200).send({ msg: "Se ha enviado el correo al cliente" });
            }
        });
    } catch (error) {
        console.error("Error al procesar el envío del correo:", error);
        res.status(500).send({ msg: "Error al enviar el correo al cliente" });
    }
};

// Función para obtener los ingresos de este año
async function obtenerIngresosEsteAno(req, res) {
    try {
        const anoActual = new Date().getFullYear();
        const primerDiaAno = new Date(anoActual, 0, 1).toISOString();
        const primerDiaAnoSiguiente = new Date(anoActual + 1, 0, 1).toISOString();

        const ingresosEsteAno = await Codigos.aggregate([
            {
                $match: {
                    estado: true, // Filtra solo los códigos con estado true
                    fechaGeneracion: {
                        $gte: new Date(primerDiaAno),
                        $lt: new Date(primerDiaAnoSiguiente)
                    }
                }
            },
            {
                $unwind: "$diasRenta" // Descompone el array para manejar cada día de renta por separado
            },
            {
                $addFields: {
                    primerDiaMes: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: "$diasRenta"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$primerDiaMes",
                    total: { $sum: "$precioTotal" },
                    detalles: {
                        $push: {
                            codigo: "$codigo",
                            paquete: "$paquete",
                            precio: "$precioTotal",
                            precioTotal: "$precioTotal",
                            diasRenta: "$diasRenta",
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        console.log(ingresosEsteAno)
        res.status(200).send({
            ingresosEsteAno
        });
    } catch (error) {
        console.error("Error al obtener ingresos de este año:", error);
        res.status(500).send({ msg: "Error interno del servidor", error });
    }
}

async function obtenerCodigosPorMes(req, res) {
    try {
        // Obtener el año actual
        const añoActual = new Date().getFullYear();

        // Obtener el total de códigos generados en el año actual
        const totalCodigos = await Codigos.countDocuments({
            fechaGeneracion: {
                $gte: new Date(añoActual, 0, 1),
                $lt: new Date(añoActual + 1, 0, 1)
            }
        });

        // Obtener el número de códigos por mes y año
        const codigosPorMes = await Codigos.aggregate([
            {
                $match: {
                    fechaGeneracion: {
                        $gte: new Date(añoActual, 0, 1),
                        $lt: new Date(añoActual + 1, 0, 1)
                    }
                }
            },
            {
                $project: {
                    mesAño: {
                        $dateToString: { format: "%Y-%m", date: "$fechaGeneracion" }
                    },
                    codigo: 1,
                    fechaGeneracion: 1,
                    diasRenta: 1,
                    horaInicio: 1,
                    horaFin: 1,
                    integrantes: 1,
                    estado: 1
                }
            },
            {
                $group: {
                    _id: "$mesAño",
                    cantidad: { $sum: 1 },
                    detalles: { $push: { 
                        codigo: "$codigo",
                        fechaGeneracion: "$fechaGeneracion",
                        diasRenta: "$diasRenta",
                        horaInicio: "$horaInicio",
                        horaFin: "$horaFin",
                        integrantes: "$integrantes",
                        estado: "$estado"
                    }}
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Log de los detalles
        console.log("Detalles de códigos por mes:", JSON.stringify(codigosPorMes, null, 2));

        // Calcular el porcentaje de códigos por mes
        const codigosPorMesConPorcentaje = codigosPorMes.map(codigo => ({
            ...codigo,
            porcentaje: ((codigo.cantidad / totalCodigos) * 100).toFixed(2)
        }));

        res.status(200).send({
            codigosPorMes,
            codigosPorMesConPorcentaje
        });
    } catch (error) {
        console.error("Error al obtener códigos por mes:", error);
        res.status(500).send({ msg: "Error interno del servidor", error });
    }
}


module.exports = {
    crearRenta,
    enviarCodigo,
    obtenerCodigos,
    eliminarCodigo,
    editarCodigo,
    obtenerCodigosPagados,
    obtenerCodigosPendientes,
    obtenerCodigoUnico,
    obtenerIngresosEsteAno,
    obtenerCodigosPorMes
}