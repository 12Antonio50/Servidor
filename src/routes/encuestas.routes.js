const express = require("express");
const { authAdminAP, authAdmin } = require("../middleware/auth");
const encuestasController = require("../controllers/encuestas");

const api = express.Router();

api.post(
    "/encuestas/buscar/encuesta",
    encuestasController.obteberUnicaEncuesta,
);

api.get(
    "/encuestas/obtener/encuetas",
    [authAdminAP],
    encuestasController.obtenerTodasEncuestas,
)

api.delete(
    "/encuestas/eliminar/encuesta",
    [authAdmin],
    encuestasController.eliminarEncuesta,
);

api.post(
    "/encuestas/crear/encuesta",
    [authAdminAP],
    encuestasController.crearEncuesta,
);

api.patch(
    "/encuestas/actualizar/encuesta",
    [authAdminAP],
    encuestasController.actualizarEncuesta,
);

api.patch(
    "/encuestas/enviar/encuesta",
    [authAdminAP],
    encuestasController.enviarEncuesta
);

api.post(
    "/encuestas/respuetas",
    encuestasController.crearRespuestas
);

api.get(
    "/encuesta/obtener/respuestas/unica",
    [authAdminAP],
    encuestasController.obtenerTodasEncuestas,
);

api.get(
    "/encuesta/obtener/respuestas/todas",
    [authAdminAP],
    encuestasController.obtenerTodasLasRespuestas,
);

api.post (
    "/encuesta/obtener/porcentaje/creacion",
    [authAdminAP],
    encuestasController.obtenerEncuestascreadas,
)

api.post(
    "/encuesta/obtener/porcentaje/respuestas",
    [authAdminAP],
    encuestasController.obtenerEncuestaMasContestadaPorMes,
)

module.exports = api;