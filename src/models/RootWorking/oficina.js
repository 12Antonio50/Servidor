const mongoose = require("mongoose");

const oficinasRootWorkingSchema = new mongoose.Schema({
    nombre: {
        unique: true,
        type: String
    },
    costo: Number,
    metrosCuadrados: Number,
    descripcion: String,
    disponible: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("OficinaRootWorking", oficinasRootWorkingSchema);
