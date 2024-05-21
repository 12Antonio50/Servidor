const express = require("express");
const { authAdminAP, authAdmin } = require("../middleware/auth");
const fechaController = require("../controllers/fecha");

const api = express.Router()

api.post(
    "/fecha/crear",
    [authAdminAP],
    fechaController.crearFecha,
);

api.get(
    "/fecha/buscar",
    [authAdminAP],
    fechaController.obtnerFechasUnica,
);

api.get(
    "/fecha/buscar/todas",
    [authAdminAP],
    fechaController.obtnerFechas,
);

api.delete(
    "/fecha/eliminar",
    [authAdmin],
    fechaController.eliminarFechas,
);

module.exports = api;