const mongoose = require("mongoose");

const fechasSchema = new mongoose.Schema({
    fecha: {
        type: String,
        unique: true,
    },
});

module.exports = mongoose.model("fechas", fechasSchema);