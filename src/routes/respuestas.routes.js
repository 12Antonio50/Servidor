const express = require("express");
const respuestaPorcentajeController = require("../controllers/respuestas");
const { authAdminAP, authAdmin } = require("../middleware/auth");

const api = express.Router();

api.post(
    "/obtener/respuestas/tipo/opcion",
    [authAdminAP],
    respuestaPorcentajeController.obtenerPorcentajesGenerales,
);

api.post(
    "/obtener/respuestas/tipo/escala",
    [authAdminAP],
    respuestaPorcentajeController.obtenerPorcentajesEscalaNumerica,
);

module.exports = api;