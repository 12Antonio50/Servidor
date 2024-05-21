const mongoose = require("mongoose");

const codigoSchema = new mongoose.Schema({
    codigo: {
        unique: true,
        type: String
    },
    fecha_generacion: String,
    estado: {
        type: Boolean,
        default: false,
    },
    espacio: { type: mongoose.Schema.Types.ObjectId, ref: 'Espacio' } // Referencia al espacio de renta asociado
});

const Codigo = mongoose.model("Codigo", codigoSchema);

module.exports = Codigo;
