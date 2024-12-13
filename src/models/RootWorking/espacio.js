    const mongoose = require("mongoose");

    const espacioSchema = new mongoose.Schema({
        nombre: {
            unique: true,
            type: String
        },
        metrosCuadrados: String,
        descripcion: String,
        direccion: String,
        oficina: [String],
    });

    module.exports = mongoose.model("EspacioRootWorking", espacioSchema);
