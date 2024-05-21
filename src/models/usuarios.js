const mongoose = require("mongoose");

const usuariosSchema = new mongoose.Schema({
    correo: {
        unique: true,
        type: String,
    },
    nombre: String,
    apellido_paterno: String,
    apellido_materno: String,
    area: String,
    password: String,
    rol: String,
    /*imagen: {
        data: Buffer,
        contentType: String
    },*/
    cursos: [],
});

module.exports = mongoose.model("usuarios", usuariosSchema);