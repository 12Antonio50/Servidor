const mongoose = require("mongoose");

const opcionesSchema = new mongoose.Schema({
    texto: String,
});

const preguntasSchema = new mongoose.Schema({
    texto: String,
    tipo: String,
    opciones: [opcionesSchema],
});

const respuestasSchema = new mongoose.Schema({
    preguntas: {
        type: preguntasSchema,
    },
    respuestaTexto: String,
    opcionSeleccionada: {
        type: opcionesSchema,
    },
    rangoSeleccionado: Number,
    escalaNumerica: Number,
});

const encuestasSchema = new mongoose.Schema({
    titulo: {
        type: String,
        unique: true,
    },
    descripcion: String,
    fecha: String,
    creador: String,
    //docente: String,
    preguntas: [preguntasSchema],
    respuestas: [
        {
            respuestasArray: [respuestasSchema],
        },
    ],
    disponible: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("encuestas", encuestasSchema);
