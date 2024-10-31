const express = require("express");
const espacioController = require("../../controllers/RootWorking/inmueble");
const {authAdmin, authAdminAP } = require("../../middleware/auth");

const api = express.Router();

api.post(
    "/espacio/crear",
    [authAdminAP],
    espacioController.crearInmueble,
);

api.get(
    "/espacio/buscar",
    espacioController.obtenerEspacio,
);

api.patch(
    "/espacio/actualizar",
    [authAdminAP],
    espacioController.editarInmueble,
);

api.delete(
    "/espacio/eliminar",
    [authAdmin],
    espacioController.eliminarInmueble,
);

api.delete(
    "/espacio/oficina/eliminar",
    [authAdmin],
    espacioController.eliminarOficina,
);

api.patch(
    "/espacio/agregarOficina",
    [authAdminAP],
    espacioController.agregarOficina,
);

api.get(
    "/espacio/porcentaje/mes",
    [authAdminAP],
    espacioController.obtenerInmuebleConMasRentas
);

module.exports = api;