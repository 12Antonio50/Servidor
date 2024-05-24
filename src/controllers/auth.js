const Usuarios = require("../models/usuarios");
const UsuariosRoot = require("../models/RootWorking/usuariosRootWorking");
const bcrypt = require("bcrypt");
const jwt = require("../util/jwt");

async function login(req, res) {
    const { correo, password, modelo } = req.body;

    if (!correo) res.status(400).send({ msg: "El correo es obligatorio" });
    if (!password) res.status(400).send({ msg: "La contraseña es obligatoria" });

    let existenciaUsuario;

    // Determinar qué modelo utilizar según el parámetro 'modelo'
    if (modelo === 'usuarios') {
        existenciaUsuario = await Usuarios.findOne({ correo });
    } else if (modelo === 'usuariosRoot') {
        existenciaUsuario = await UsuariosRoot.findOne({ correo });
    } else {
        res.status(400).send({ msg: "Modelo de usuario no válido" });
        return;
    }

    if (!existenciaUsuario) {
        res.status(400).send({ msg: "No se existe ningún usuario con esas credenciales" });
    } else {
        bcrypt.compare(password, existenciaUsuario.password, (bcryptError, check) => {
            if (bcryptError) {
                res.status(500).send({ msg: "Error del servidor" });
                //console.log(bcryptError);
            } else if (!check) {
                res.status(400).send({ msg: "Error en la comparación del usuario" });
            } else {
                existenciaUsuario.password = undefined;
                
                res.status(200).send({
                    access: jwt.crearAccessToken(existenciaUsuario),
                    existenciaUsuario,
                });
            }
        });
    }
}

module.exports = {
    login,
};
