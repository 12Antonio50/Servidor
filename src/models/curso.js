const mongoose = require("mongoose");

const cursoSchema = new mongoose.Schema({
    curso: {
        unique: true,
        type: String
    },
    area: String,
    creador: String,
    duracion: String,
    inicio: String,
    fin: String,
    /*imagen: {
        data: Buffer, // Almacena los datos binarios de la imagen
        contentType: String // Tipo de contenido de la imagen (image/jpeg)
    },*/
    disponible: {
        type: Boolean,
        default: true,
    },
    encuestas: {
        type: [String],
        default: []
    },
    publico: {
        type: [String],
        default: [],
    },
    clase: {
        type: [String],
        default: [],
    }
});

module.exports = mongoose.model("curso", cursoSchema);