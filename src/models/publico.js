const mongoose = require("mongoose");

const publicosSchema = new mongoose.Schema({
    nombre: String,
    correo: {
        unique: true,
        type: String
    },
    correoOpcional: String,
    celular: String,
    telefono: String,
    fecha: String
});

module.exports = mongoose.model("publicos", publicosSchema);