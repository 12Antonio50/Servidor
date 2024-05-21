const express = require("express");
const cursosController = require("../controllers/curso");
const {authAdmin, authAdminAP} = require("../middleware/auth");

const api = express.Router();

api.post(
    "/curso/buscar/curso",
    [authAdminAP],
    cursosController.obtenerUnicoCurso,
);

api.post(
    "/cursos/crear/cursos",
    [authAdminAP],
    cursosController.crearCurso,
);

api.delete(
    "/cursos/eliminar/curso",
    [authAdmin],
    cursosController.eliminarCurso
);

api.get(
    "/cursos/buscar",
    cursosController.obtenerCursos
);

api.post(
    "/cursos/buscar/activos",
    [authAdminAP],
    cursosController.cursosActivos
);

api.get(
    "/cursos/buscar/activos/todos",
    [authAdminAP],
    cursosController.cursosActivosTodos
);

api.patch(
    "/cursos/editar/curso",
    [authAdmin],
    cursosController.editarCurso,
);

api.patch(
    "/cursos/agregar-encuesta",
    [authAdminAP],
    cursosController.agregarEncuesta
);

api.patch(
    "/cursos/quitar-encueta",
    [authAdminAP],
    cursosController.quitarEncuesta,
);

api.patch(
    "/cursos/agregar-alumno",
    [authAdminAP],
    cursosController.agregarEstudiante,
);

api.patch(
    "/cursos/quitar-alumno",
    [authAdminAP],
    cursosController.quitarEstudiante,
);

api.post(
    "/cursos/porcentaje/publico",
    [authAdminAP],
    cursosController.cursosInactivosConNumeroPublico
)

module.exports = api;