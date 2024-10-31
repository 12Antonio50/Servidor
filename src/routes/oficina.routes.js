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

api.get(
    "/oficina/buscar/deshabilitadas",
    oficinaController.obtenerOficinaDeshabilitada
);

api.patch(
    "/oficina/deshabilitar",
    oficinaController.deshabilitarEspacio
);

api.patch(
    "/oficina/habilitar",
    oficinaController.habilitarEspacio
);

api.get(
    "/oficina/buscar/unica",
    oficinaController.obtenerOficinaUnica
);

api.patch(
    "/oficina/actualizar",
    oficinaController.editarOficina,
);

api.delete(
    "/oficina/eliminar",
    oficinaController.eliminarOficina,
);

api.patch(
    "/oficina/agregar/codigo",
    oficinaController.agregarCodigo
);

api.patch(
    "/oficina/quitar/codigo",
    oficinaController.quitarCodigo
);

module.exports = api;