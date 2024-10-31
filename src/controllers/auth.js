const Usuarios = require("../models/usuarios");
const UsuariosRoot = require("../models/RootWorking/usuariosRootWorking");
const bcrypt = require("bcrypt");
const jwtUtil = require("../util/jwt");
const nodemailer = require("nodemailer");
const { OUTLOOK_EMAIL, user_SendGrid, apikey } = process.env;

// Función para buscar usuario por correo y modelo/rol
async function buscarUsuarioPorCorreo(correo, modelo) {
    if (modelo === 'usuarios') {
        return await Usuarios.findOne({ correo });
    } else if (modelo === 'usuariosRoot') {
        return await UsuariosRoot.findOne({ correo });
    }
    return null; // Modelo de usuario no válido
}

// Función para iniciar sesión
async function login(req, res) {
    const { correo, password, modelo } = req.body;

    if (!correo || !password) {
        return res.status(400).send({ msg: "El correo y la contraseña son obligatorios" });
    }

    try {
        const existenciaUsuario = await buscarUsuarioPorCorreo(correo.toLowerCase(), modelo);
        console.log(existenciaUsuario);
        console.log(correo);
        console.log(modelo);
        
        if (!existenciaUsuario) {
            return res.status(400).send({ msg: "No existe ningún usuario con esas credenciales" });
        }

        bcrypt.compare(password, existenciaUsuario.password, async (bcryptError, check) => {
            if (bcryptError) {
                return res.status(500).send({ msg: "Error del servidor" });
            }

            if (!check) {
                return res.status(400).send({ msg: "Contraseña incorrecta" });
            }

            existenciaUsuario.password = undefined;

            const token = jwtUtil.crearAccessToken(existenciaUsuario);
            await enviarCorreoNotificacion(existenciaUsuario.correo, modelo);
            res.status(200).send({ 
                msg: "Inicio de sesión exitoso. Se ha enviado una notificación a tu correo.",
                access: token,
                existenciaUsuario: {
                    correo: existenciaUsuario.correo,
                    rol: existenciaUsuario.rol,
                    nombre: existenciaUsuario.nombre,
                    apellido_paterno: existenciaUsuario.apellido_paterno,
                }
            });
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).send({ msg: "Error del servidor" });
    }
}

// Función para enviar correo de notificación
async function enviarCorreoNotificacion(correoUsuario, modelo) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", 
        port: 587,
        secure: false,
        auth: {
            user: 'apikey',
            pass: apikey,
        },
    });

    const opcionesCorreo = {
        from: OUTLOOK_EMAIL,
        to: correoUsuario,
        subject: "Inicio de sesión detectado en tu cuenta",
        html: `
            <p>Hola,</p>
            <p>Recientemente se ha iniciado sesión en tu cuenta en nuestra aplicación.</p>
            <p>Si fuiste tú quien inició sesión, no es necesario realizar ninguna acción adicional.</p>
            <p>Si no fuiste tú, te recomendamos que cambies tu contraseña lo antes posible.</p>
            <p>Gracias por tu cooperación.</p>
        `
    };
    
    try {
        await transporter.sendMail(opcionesCorreo);
        console.log('Correo enviado correctamente');
    } catch (error) {
        console.error("Error al enviar el correo:", error);
    }
}

module.exports = {
    login,
    enviarCorreoNotificacion
};