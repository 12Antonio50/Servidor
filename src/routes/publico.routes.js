const express = require("express");
const { authAdminAP, authAdmin } = require("../middleware/auth");
const publicoController = require("../controllers/publico");

const api = express.Router();

api.get(
    "/publico/obtenerInformacion",
    [authAdminAP],
    publicoController.obtenerTodoPublico,
);

api.get(
    "/publico/obtenerUnicaInformacion",
    [authAdminAP],
    publicoController.obtenerUnicoPublico,
);

api.delete(
    "/publico/eliminar",
    [authAdmin],
    publicoController.eliminarPublico,
);

api.patch(
    "/publico/actualizar",
    [authAdminAP],
    publicoController.actualizarPublico,
);

api.post(
    "/publico/crear",
    [authAdminAP],
    publicoController.crearPublicoIndidual,
);

api.post(
    "/publico/crear/lista",
    [authAdminAP],
    publicoController.crearListaPublico,
);

api.post(
    "/publico/obtener/porcentaje/respuestas",
    [authAdminAP],
    publicoController.obtenerPublicocreados,
)

module.exports = api;