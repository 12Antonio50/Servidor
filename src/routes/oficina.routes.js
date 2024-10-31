const express = require("express");
const multer = require("multer");
const { authAdmin, authAdminAP, authAdminRecepcionista } = require("../middleware/auth");
const oficinaController = require("../controllers/oficina");
const upload = require("../controllers/multer");

const api = express.Router();

api.post(
    "/oficina/crear",
    [authAdminAP, upload.array('imagenes', 10),],
    oficinaController.crearOficina
);

api.get(
    "/oficina/buscar/todas",
    oficinaController.obtenerTodasOficinas
);

api.get(
    "/oficina/buscar/habilitadas",
    oficinaController.obtenerOficina
);

api.get(
    "/oficina/buscar/desahabilitadas",
    [authAdminAP],
    oficinaController.obtenerOficinaDeshabilitada
);

api.get(
    "/oficina/buscar/unica",
    oficinaController.obtenerOficinaUnica
);

api.patch(
    "/oficina/actualizar",
    [authAdminAP, upload.array('imagenes', 10),],
    oficinaController.editarOficina
);

api.patch(
    "/oficina/deshabilitar",
    [authAdminAP],
    oficinaController.deshabilitarEspacio
);

api.patch(
    "/oficina/habilitar",
    [authAdminAP],
    oficinaController.habilitarEspacio
);

api.delete(
    "/oficina/eliminar",
    [authAdmin],
    oficinaController.eliminarOficina
);

api.patch(
    "/oficina/agregar/codigo",
    oficinaController.agregarCodigo
);

api.get(
    "/oficina/porcentaje/codigos",
    oficinaController.obtenerOficinasConCodigos
)

module.exports = api;
