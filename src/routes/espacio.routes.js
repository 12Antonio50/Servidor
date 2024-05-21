const express = require("express");
const espacioController = require("../controllers/RootWorking/inmueble");

const api = express.Router()

api.post(
    "/espacio/crear",
    espacioController.crearInmueble,
);

api.get(
    "/espacio/buscar",
    espacioController.obtenerEspacio,
);

api.patch(
    "/espacio/actualizar",
    espacioController.editarInmueble,
);

api.delete(
    "/espacio/eliminar",
    espacioController.eliminarInmueble,
);

api.patch(
    "/espacio/agregarOficina",
    espacioController.agregarOficina,
);

module.exports = api;