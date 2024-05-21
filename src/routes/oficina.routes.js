const express = require("express");
const oficinaController = require("../controllers/RootWorking/Oficina");

const api = express.Router()

api.post(
    "/oficina/crear",
    oficinaController.crearOficina,
);

api.get(
    "/oficina/buscar",
    oficinaController.obtenerOficina,
);

api.patch(
    "/oficina/actualizar",
    oficinaController.editarOficina,
);

api.delete(
    "/oficina/eliminar",
    oficinaController.eliminarOficina,
);

module.exports = api;