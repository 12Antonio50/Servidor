const mongoose = require("mongoose");

const usuarioRootWorkingSchema = new mongoose.Schema({
    correo: {
        unique: true,
        type: String
    },
    nombre: String,
    apellido_paterno: String,
    apellido_materno: String,
    area: String,
    password: String,
    rol: String,
    /*imagen: {
       data: Buffer, // Almacena los datos binarios de la imagen
       contentType: String // Tipo de contenido de la imagen (image/jpeg)
    },*/
});

module.exports = mongoose.model("usuarioRootWorking", usuarioRootWorkingSchema);