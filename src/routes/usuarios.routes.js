const express = require("express");
const { authAdmin, authAdminAP } = require("../middleware/auth");
const usuariosController = require("../controllers/usuarios");

const api = express.Router();

// Ruta para crear un usuario en el modelo de usuarios SCQuick
api.post(
    "/usuario/crear-scquick",
    (req, res) => {
        usuariosController.crearUsuario(req, res, 'Usuario');
    }
);

// Ruta para crear un usuario en el modelo de usuarios SCQuick
api.post(
    "/usuario/crear/lista-scquick",
    (req, res) =>{
        usuariosController.crearListaUsuario(req, res, 'Usuario');
    }
);

// Ruta para crear un usuario en el modelo de usuarios de RootWorking
api.post(
    "/usuario/crear/lista-root",
    (req, res) =>{
        usuariosController.crearListaUsuario(req, res, 'rootWorking');
    }
);

// Ruta para crear un usuario en el modelo de usuarios de RootWorking
api.post(
    "/usuario/crear-root",
    (req, res) => {
        usuariosController.crearUsuario(req, res, 'rootWorking');
    }
);

// Ruta para eliminar usuario en el modelo de usuarios SCQuick
api.delete("/usuario/eliminar-scquick",
    [authAdminAP],
    (req, res) => {
        usuariosController.borrarUsuario(req, res, 'Usuario');
    });

// Ruta para eliminar usuario en la aplicación RootWorking
api.delete("/usuario/eliminar-root",
    [authAdminAP],
    (req, res) => {
        usuariosController.borrarUsuario(req, res, 'rootWorking');
    });

// Ruta para actualizar usuario  en el modelo de usuarios SCQuick
api.patch("/usuario/actualizar-scquick",
    [authAdminAP],
    (req, res) => {
        usuariosController.actualizarUsuario(req, res, 'Usuario');
    });

// Ruta para actualizar usuario en la aplicación RootWorking
api.patch("/usuario/actualizar-root",
    [authAdminAP],
    (req, res) => {
        usuariosController.actualizarUsuario(req, res, 'rootWorking');
    });

// Ruta para actualizar usuario en el modelo de usuarios SCQuick
api.get("/usuario/buscar/administrador-apoyo-scquick",
    [authAdminAP],
    (req, res) => {
        usuariosController.obtenerAdministradoresApoyo(req, res, 'Usuario');
    });

// Ruta para buscar administradores de apoyo en la aplicación RootWorking
api.get("/usuario/buscar/administrador-apoyo-root",
    [authAdminAP],
    (req, res) => {
        usuariosController.obtenerAdministradoresApoyo(req, res, 'rootWorking');
    });

// Ruta para actualizar usuario en el modelo de usuarios SCQuick
api.get("/usuario/buscar/administrador-scquick",
    [authAdminAP],
    (req, res) => {
        usuariosController.obtenerAdministrador(req, res, 'Usuario');
    });

// Ruta para buscar el administrador en la aplicación RootWorking
api.get("/usuario/buscar/administrador-root",
    [authAdminAP],
    (req, res) => {
        usuariosController.obtenerAdministrador(req, res, 'rootWorking');
    });


api.get(
    "/usuario/buscar/docente",
    [authAdminAP],
    usuariosController.obtenerDocente
);

// Ruta para actualizar usuario en el modelo de usuarios SCQuick
api.post("/usuario/buscar-scquick",
    [authAdminAP],
    (req, res) => {
        usuariosController.obtenerUnicoUsuario(req, res, 'Usuario');
    });

// Ruta para buscar un usuario en la aplicación RootWorking
api.post("/usuario/buscar-root",
    [authAdminAP],
    (req, res) => {
        usuariosController.obtenerUnicoUsuario(req, res, 'rootWorking');
    });

// Ruta para actualizar usuario en el modelo de usuarios SCQuick
api.patch(
    "/usuario/reenviar/correo-scquick",
    (req, res) => {
        usuariosController.reenviarCorreo(req, res, 'Usuario');
    }
);

// Ruta para reenviar correo en la aplicación RootWorking
api.patch(
    "/usuario/reenviar/correo-root",
    (req, res) => {
        usuariosController.reenviarCorreo(req, res, 'rootWorking');
    }
);

// Ruta para actualizar usuario en el modelo de usuarios SCQuick
api.post(
    "/usuario/obtenerUnico/SCQuick",
    (req, res) => {
        usuariosController.obtenerUnicoUsuario(req, res, 'Usuario');
    }
);

// Ruta para actualizar usuario en el modelo de usuarios RootWorking
api.post(
    "/usuario/obtenerUnico/rootWorking",
    (req, res) => {
        usuariosController.obtenerUnicoUsuario(req, res, 'rootWorking');
    }
);

api.patch(
    "/usuario/agregar-curso",
    [authAdminAP],
    usuariosController.agregarCurso
);

api.patch(
    "/usuario/quitar-curso",
    [authAdminAP],
    usuariosController.quitarCursos,
);

module.exports = api;