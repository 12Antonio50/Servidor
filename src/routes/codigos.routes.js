const express = require("express");
const { authAdminAP, authAdminRecepcionista} = require("../middleware/auth");
const codigosController = require("../controllers/codigos");

const api = express.Router();

api.post(
    "/codigo/crear/renta",
    codigosController.crearRenta,
);

api.patch(
    "/codigo/enviar/codigo",
    codigosController.enviarCodigo
);

api.get(
    "/codigo/obtener",
    [authAdminRecepcionista],
    codigosController.obtenerCodigos
);

api.get(
    "/codigo/obtener/pagados",
    [authAdminAP],
    codigosController.obtenerCodigosPagados
);

api.get(
    "/codigo/obtener/pendientes",
    [authAdminAP],
    codigosController.obtenerCodigosPendientes
);

api.post(
    "/codigo/obtener/unico",
    [authAdminRecepcionista],
    codigosController.obtenerCodigoUnico
);

api.delete(
    "/codigo/eliminar",
    [authAdminRecepcionista],
    codigosController.eliminarCodigo
);

api.patch(
    "/codigo/actualizar",
    [authAdminRecepcionista],
    codigosController.editarCodigo
);

api.get(
    "/codigo/ingresos",
    [authAdminAP],
    codigosController.obtenerIngresosEsteAno
);

api.get(
    "/codigo/porcentaje/mes",
    codigosController.obtenerCodigosPorMes
);

module.exports = api;