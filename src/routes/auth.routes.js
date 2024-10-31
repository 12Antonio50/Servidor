const express = require("express");
const authController = require("../controllers/auth");

const api = express.Router();

// Ruta para el modelo de usuarios estándar
api.post("/auth/login-scquick", (req, res) => {
    req.body.modelo = 'usuarios';
    authController.login(req, res);
});

// Ruta para el modelo de usuarios de RootWorking
api.post("/auth/login-root", (req, res) => {
    req.body.modelo = 'usuariosRoot';
    authController.login(req, res);
});

// Rutas para confirmar el inicio de sesión
api.get("/confirmar-inicio-sesion-scquick", (req, res) => {
    req.body.modelo = "usuarios";
    authController.confirmarInicioSesion(req, res);
});

api.get("/confirmar-inicio-sesion-root", (req, res) => {
    req.body.modelo = "usuariosRoot";
    authController.confirmarInicioSesion(req, res);
});

module.exports = api;
