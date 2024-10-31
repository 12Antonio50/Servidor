const express = require("express");
const claseController = require("../controllers/clase");
const { authAdmin, authAdminAP } = require("../middleware/auth");
const upload = require("../controllers/multer");

const api = express.Router();

api.post(
    "/clase/buscar/clase",
    [authAdmin, authAdminAP],
    claseController.obtenerUnicaClase,
);

api.post(
    "/clase/crear/clase",
    [authAdmin, authAdminAP, upload.single('video')],
    claseController.crearClase,
);

api.delete(
    "/clase/eliminar/clase",
    [authAdmin],
    claseController.eliminarClase,
);

api.post(
    "/clase/obtener/clase-unica",
    [authAdmin, authAdminAP],
    claseController.obtenerUnicaClase
);

api.get(
    "/clase/obtener/clases",
    [authAdmin, authAdminAP],
    claseController.obtenerClase
)

api.patch(
    "/clase/editar/clase",
    [authAdmin, authAdminAP, upload.single('video')],
    claseController.editarClase,
);

module.exports = api;