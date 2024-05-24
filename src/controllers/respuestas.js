const Encuestas = require("../models/encuestas");

async function obtenerPorcentajesGenerales(req, res) {
    try {
        const { titulo } = req.body;

        // Verificar si se proporcionó el título de la encuesta
        if (!titulo) {
            return res.status(400).send({ msg: "Título de la encuesta no proporcionado" });
        }

        // Obtener la encuesta de la base de datos
        const encuestaEncontrada = await Encuestas.findOne({ titulo });

        // Verificar si se encontró la encuesta
        if (!encuestaEncontrada) {
            return res.status(404).send({ msg: "No se encontró una encuesta con el título proporcionado" });
        }

        const resultados = [];

        // Obtener las preguntas de tipo 'opcionMultiple'
        const preguntasOpcionMultiple = encuestaEncontrada.preguntas.filter(pregunta => pregunta.tipo === 'opcionMultiple');

        // Calcular el promedio de las respuestas de 'opcionMultiple'
        preguntasOpcionMultiple.forEach(pregunta => {
            const conteoRespuestas = {};
            let totalRespuestas = 0;

            // Inicializar el conteo de cada opción a cero
            pregunta.opciones.forEach(opcion => {
                conteoRespuestas[opcion.texto] = 0;
            });

            // Contar las respuestas
            encuestaEncontrada.respuestas.forEach(respuestaObj => {
                respuestaObj.respuestasArray.forEach(respuesta => {
                    if (respuesta.preguntas._id.toString() === pregunta._id.toString()) {
                        const respuestaTexto = respuesta.respuestaTexto;
                        if (conteoRespuestas[respuestaTexto] !== undefined) {
                            conteoRespuestas[respuestaTexto] += 1;
                            totalRespuestas += 1;
                        }
                    }
                });
            });

            // Calcular los porcentajes
            const porcentajesOpcionMultiple = {};
            Object.keys(conteoRespuestas).forEach(opcion => {
                porcentajesOpcionMultiple[opcion] = totalRespuestas > 0 ? (conteoRespuestas[opcion] / totalRespuestas) * 100 : 0;
            });

            resultados.push({
                pregunta: pregunta.texto,
                tipo: 'opcionMultiple',
                porcentajes: porcentajesOpcionMultiple,
            });
        });

        // Devolver los resultados
        res.status(200).send({ resultados });
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "Error al procesar la solicitud" });
    }
}

async function obtenerPorcentajesEscalaNumerica(req, res) {
    try {
        const { titulo } = req.body;

        // Verificar si se proporcionó el título de la encuesta
        if (!titulo) {
            return res.status(400).send({ msg: "Título de la encuesta no proporcionado" });
        }

        // Obtener la encuesta de la base de datos
        const encuestaEncontrada = await Encuestas.findOne({ titulo });

        // Verificar si se encontró la encuesta
        if (!encuestaEncontrada) {
            return res.status(404).send({ msg: "No se encontró una encuesta con el título proporcionado" });
        }

        const resultados = [];

        // Obtener las preguntas de tipo 'escalaNumerica'
        const preguntasEscalaNumerica = encuestaEncontrada.preguntas.filter(pregunta => pregunta.tipo === 'escalaNumerica');

        // Inicializar un objeto para contabilizar repeticiones
        const conteoRepeticiones = {};

        // Iterar sobre las preguntas de escala numérica
        preguntasEscalaNumerica.forEach(pregunta => {
            // Reiniciar el conteo para cada pregunta
            conteoRepeticiones[pregunta._id] = {};

            // Iterar sobre las respuestas de la encuesta
            encuestaEncontrada.respuestas.forEach(respuestaObj => {
                respuestaObj.respuestasArray.forEach(respuesta => {
                    // Verificar si la respuesta pertenece a la pregunta actual
                    if (respuesta.preguntas._id.toString() === pregunta._id.toString()) {
                        if ('escalaNumerica' in respuesta) {
                            const respuestaValor = parseInt(respuesta.escalaNumerica);
                            if (!isNaN(respuestaValor)) {
                                // Incrementar el conteo de repeticiones para este valor
                                conteoRepeticiones[pregunta._id][respuestaValor] = (conteoRepeticiones[pregunta._id][respuestaValor] || 0) + 1;
                            }
                        }
                    }
                });
            });

            // Agregar el conteo de repeticiones a los resultados
            resultados.push({
                pregunta: pregunta.texto,
                tipo: 'escalaNumerica',
                conteoRepeticiones: conteoRepeticiones[pregunta._id],
            });
        });

        // Imprimir los resultados en la consola para depuración
        console.log("Resultados finales:", resultados);

        // Devolver los resultados
        res.status(200).send({ resultados });
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "Error al procesar la solicitud" });
    }
}


module.exports = {
    obtenerPorcentajesGenerales,
    obtenerPorcentajesEscalaNumerica
};
