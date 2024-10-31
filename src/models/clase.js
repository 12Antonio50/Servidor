const mongoose = require("mongoose");

const claseSchema = new mongoose.Schema({
    nombre: {
        unique: true,
        type: String
    },
    docente: String,
    curso: String,
    fecha: String,
    tema: String,
    video: [],
    disponible: {
        type: Boolean,
        default: true,
    }
});

module.exports = mongoose.model("clase", claseSchema);