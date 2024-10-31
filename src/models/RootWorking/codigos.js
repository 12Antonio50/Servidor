const mongoose = require("mongoose");

const codigoSchema = new mongoose.Schema({
    codigo: {
        unique: true,
        type: String,
        required: true // Añadir required para asegurar que siempre se proporcione un código único
    },
    fechaGeneracion: {
        type: Date,
        default: Date.now // Establece la fecha de generación por defecto como la fecha actual
    },
    estado: {
        type: Boolean,
        default: false
    },
    precio: {
        type: Number,
        required: true // Precio de la renta, en una unidad monetaria especificada
    },
    numeroIntegrantes: {
        type: Number,
        required: true // Número de personas que usan el espacio
    },
    paquete: {
        type: String,
        required: true // Descripción del paquete o plan de renta
    },
    horaInicio: {
        type: String,
        required: true // Fecha y hora de inicio de la renta
    },
    horaFin: {
        type: String,
        required: true // Fecha y hora de fin de la renta
    },
    diasRenta: {
        type: [Date], // Array de fechas específicas de renta
        required: true // Especifica los días de la renta
    },
    nombreArrendatario: {
        type: String,
        required: true // Nombre de la persona que está rentando el espacio
    },
    precioTotal: {
        type: Number,
        required: true
    }
});

const Codigo = mongoose.model("Codigo", codigoSchema);

module.exports = Codigo;
