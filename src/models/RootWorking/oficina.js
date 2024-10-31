const mongoose = require("mongoose");

const oficinasRootWorkingSchema = new mongoose.Schema({
    nombre: {
        unique: true,
        type: String
    },
    tipoEspacio: String,
    costoBasico: Number,
    numeroMaximoIntegrantes: Number,
    costoIntermedio: Number,
    costoPremium: Number,
    metrosCuadrados: Number,
    descripcion: String,
    disponible: {
        type: Boolean,
        default: true,
    },
    deshabilitar: {
        type: Boolean,
        default: false,
    },
    caracteristicas: [],
    servicios: [],
    ubicacion: String,
    imagen: [],
    codigos: []
});

module.exports = mongoose.model("OficinaRootWorking", oficinasRootWorkingSchema);
