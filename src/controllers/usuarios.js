require('dotenv').config();

const Usuario = require("../models/usuarios");
const UsuariosRoot = require("../models/RootWorking/usuariosRootWorking");
const Cursos = require("../models/curso");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const moment = require("moment");
const {
    OUTLOOK_EMAIL,
    OUTLOOK_PASSWORD,
    user_SendGrid,
    apikey,
} = process.env;

/*
Administrador

Funcion para registrar un nuevo ususario (Sugerencia de uso: un formulario)
Manda un email al correo del usuario con los datos con los que fue registrado
*/

async function crearUsuario(req, res, modelo) {
    const {
        correo,
        nombre,
        apellido_paterno,
        apellido_materno,
        area,
        imagen,
        rol,
    } = req.body;

    if (!correo) res.status(400).send({ msg: "Correo es requerido" });
    if (!nombre) res.status(400).send({ msg: "Nombre es requerido" });
    if (!apellido_paterno) res.status(400).send({ msg: "Apellido paterno es requerido" });
    if (!apellido_materno) res.status(400).send({ msg: "Apellido materno es requerido" });
    if (!area) res.status(400).send({ msg: "Area es requerido" });
    if (!rol) res.status(400).send({ msg: "Rol es requerido" });

    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";

    for (let i = 0; i < 17; i++) {
        let index = Math.floor(Math.random() * caracteres.length);
        password += caracteres.charAt(index);
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    // Determinar qué modelo de usuario utilizar
    if (modelo === 'rootWorking') {
        modelo = UsuariosRoot;
    } else {
        modelo = Usuario;
    }

    const usuario = new modelo({
        correo,
        nombre,
        apellido_paterno,
        apellido_materno,
        area,
        rol,
        password: hashPassword,
        /*imagen: {
            data: Buffer.from(imagen.data, 'base64'),
            contentType: imagen.contentType
        }*/
    });

    let areaNombre = "";
    let rolNombre = "";

    switch (area) {
        case "A":
            areaNombre = "Administración";
            break;
        case "C":
            areaNombre = "Contaduría";
            break;
    }

    switch (rol) {
        case "A":
            rolNombre = "Administrador";
            break;
        case "AP":
            rolNombre = "Administrador de apoyo";
            break;
        case "D":
            rolNombre = "Docente";
            break;
    }

    try {
        // Guardar el usuario
        const userStorage = await usuario.save();

        // Envío del correo
        const transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false,
            auth: {
                user: user_SendGrid,
                pass: apikey,
            },
        });

        const opcionesCorreo = {
            from: OUTLOOK_EMAIL,
            to: correo,
            subject: "Creación de cuenta en la aplicación de encuestas QUICK POLLS",
            text: `Nos complace informarle que se ha creado una cuenta para usted en nuestra aplicación de encuestas con los siguientes datos:\n\n\nNombre: ${nombre}\nApellido paterno: ${apellido_paterno}\nApellido materno: ${apellido_materno}\nCorreo: ${correo}\nÁrea: ${areaNombre}\nRol: ${rolNombre}\nContraseña: ${password}\n\n\nDiríjase al siguiente enlace para iniciar sesión: https://rlgjvn6n-3000.usw3.devtunnels.ms/ Esta designación le otorga privilegios adicionales para colaborar en la gestión y supervisión de encuestas en nuestra plataforma.`,
        };

        const infoCorreo = await transporter.sendMail(opcionesCorreo);
        //console.log("Correo enviado", infoCorreo);

        res.status(200).send({
            msg: "Usuario registrado, se ha enviado un email a su correo",
        });
    } catch (error) {
        console.error(error);
        res.status(400).send({ msg: "Error al crear el usuario" });
    }
}

async function crearListaUsuario(req, res, modelo) {
    let usuariosArray = req.body;
    let passwordArray = [];
    let password = "";
    let caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let salt = "";
    let hashPassword = "";

    // Envío del correo
    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
            user: user_SendGrid,
            pass: apikey,
        },
    });

    // Creando password para cada usuario en el array
    for (let i = 0; i < usuariosArray.length; i++) {
        // Creación de passwords
        for (let j = 0; j < 17; j++) {
            let index = Math.floor(Math.random() * caracteres.length);
            password += caracteres.charAt(index);
        }

        passwordArray.push(password);

        // Hasheo de password
        salt = bcrypt.genSaltSync(10);
        hashPassword = bcrypt.hashSync(password, salt);
        usuariosArray[i].password = hashPassword;

        // Resetear variables
        password = "";
        hashPassword = "";
    }

    try {
        // Determinar qué modelo de usuario utilizar
        if (modelo === 'rootWorking') {
            modelo = UsuariosRoot;
        } else {
            modelo = Usuario;
        }
        const usuariosCreados = await modelo.insertMany(usuariosArray);

        // Función para enviar correos electrónicos con control de tasa de envío
        async function enviarCorreos() {
            for (let k = 0; k < usuariosArray.length; k++) {
                const { correo, nombre, apellido_paterno, apellido_materno, area, rol } = usuariosArray[k];

                let areaNombre = area === 'A' ? 'Administración' : 'Contaduría';
                let rolNombre = rol === 'A' ? 'Administrador' : rol === 'AP' ? 'Administrador de apoyo' : 'Docente';

                let opcionesCorreo = {
                    from: OUTLOOK_EMAIL,
                    to: correo,
                    subject: "Creación de cuenta en la aplicación de encuestas QUICK POLLS",
                    text: `Nos complace informarle que se ha creado una cuenta para usted en nuestra aplicación de encuestas con los siguientes datos:\n\n\nNombre: ${nombre}\nApellido paterno: ${apellido_paterno}\nApellido materno: ${apellido_materno}\nCorreo: ${correo}\nÁrea: ${areaNombre}\nRol: ${rolNombre}\nContraseña: ${passwordArray[k]}\n\n\nDiríjase al siguiente enlace para iniciar sesión: https://rlgjvn6n-3000.usw3.devtunnels.ms/ Esta designación le otorga privilegios adicionales para colaborar en la gestión y supervisión de encuestas en nuestra plataforma.`,
                };

                // Enviar correo con control de tasa
                try {
                    await transporter.sendMail(opcionesCorreo);
                    //(`Correo enviado a ${correo}`);
                } catch (error) {
                    console.error(`Error al enviar el correo a ${correo}:`, error);
                }

                // Esperar 1 segundo antes de enviar el siguiente correo para evitar exceder el límite de conexiones
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        // Llamar a la función para enviar los correos
        await enviarCorreos();

        res.status(200).send({
            msg: "Se ha registrado la lista de usuarios, se les ha enviado un email al correo de cada usuario",
        });
    } catch (error) {
        console.error(error);
        res.status(400).send({ msg: "Error al cargar la lista de usuarios" });
    }
}


/*
Administrador 
Función para buscar y eliminar un usuario
*/
async function borrarUsuario(req, res, UsuarioModelo) {
    const { correo } = req.body;

    try {
        UsuarioModelo = (UsuarioModelo === 'rootWorking') ? UsuariosRoot : Usuario;
        const usuarioEliminado = await UsuarioModelo.findOneAndDelete({ correo });

        if (!usuarioEliminado) {
            res.status(400).send({ msg: "Error, no se pudo eliminar el usuario" });
        } else {
            res.status(200).send({ msg: "Usuario eliminado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "Error del servidor" });
    }
}

//Administradores y administradores de apoyo 
/*
EL adminstrador puede editar editar la información de los
administradores de apoyo, pero los AP solo pueden modificar
su información menos el área  
*/
async function actualizarUsuario(req, res, UsuarioModelo) {

    const {
        correoOriginal,
        correoCambio,
        nombre,
        apellido_paterno,
        apellido_materno,
        area,
        rol,
        password
    } = req.body;

    //hasheo de password
    let hashPassword = ""

    if (password) {
        const salt = bcrypt.genSaltSync(10)

        hashPassword = bcrypt.hashSync(password, salt);

    } else {
        hashPassword = undefined;
    }

    let correo = "";

    if (correoCambio) {
        correo = correoCambio;
    } else {
        correo = correoOriginal;
    }

    try {
        // Determinar qué modelo de usuario utilizar
        UsuarioModelo = (UsuarioModelo === 'rootWorking') ? UsuariosRoot : Usuario;
        const usuarioActualizado = await UsuarioModelo.findOneAndUpdate(
            { correo: correoOriginal },
            {
                $set: {
                    correo,
                    nombre,
                    apellido_paterno,
                    apellido_materno,
                    area,
                    rol,
                    password: hashPassword,
                },
            },
            { new: true }
        );

        if (!usuarioActualizado) {
            res.status(400).send({ msg: "Error al actualizar los datos del usuario" });
        } else {
            res.status(200).send({ msg: "Datos del usuario actualizado" });
        }
    } catch (error) {
        throw error;
    }
}

/*
Administrador 
Función para obteber a todos los administradores de apoyo
*/
async function obtenerAdministradoresApoyo(req, res, UsuarioModelo) {
    // Determinar qué modelo de usuario utilizar
    if (UsuarioModelo === 'rootWorking') {
        UsuarioModelo = UsuariosRoot;
    } else {
        UsuarioModelo = Usuario;
    }
    try {
        const response = await UsuarioModelo.find({ rol: "AP" });

        // Eliminar la contraseña de la respuesta para no enviarla al cliente
        for (let i = 0; i < response.length; i++) {
            response[i].password = undefined;
        }

        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "Error del servidor" });
    }
}


/*
Adminstrador
Obtener los datos del unico adminstrador que debe de existir
*/
async function obtenerAdministrador(req, res, UsuarioModelo) {
    const response = await UsuarioModelo.find({ rol: "A" });

    response.password = undefined;

    if (!response) {
        res.status(400).send({ msg: "Error al obtener los usuarios" });
    } else {
        res.status(200).send(response);
    }
}

async function obtenerDocente(req, res) {
    const response = await Usuario.find({ rol: "D" });

    response.password = undefined;

    if (!response) {
        res.status(400).send({ msg: "Error al obtener los usuarios" });
    } else {
        res.status(200).send(response);
    }
}

/*
Administrador
Obtener los datos de un usuario para ver sus datos o hacer ciertas acciones como 
obtener su correo para actualizazrlo o eliminarlo
*/
async function obtenerUnicoUsuario(req, res, modelo) {
    const { correo } = req.body;

    // Determinar qué modelo de usuario utilizar
    modelo = (modelo === 'rootWorking') ? UsuariosRoot : Usuario;

    try {
        const response = await modelo.findOne({ correo });
        if (!response) {
            return res.status(400).send({ msg: "Error al obtener los datos del usuario" });
        }

        // Eliminar la contraseña de la respuesta
        response.password = undefined;
        return res.status(200).send(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ msg: "Error del servidor" });
    }
}


//Función para volver a enviar correo de registro donde viene la password generada automaticamente para poder iniciar sesión
async function reenviarCorreo(req, res, UsuarioModelo) {
    const { correo } = req.body;

    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

    let password = "";

    for (let i = 0; i < 17; i++) {
        let index = Math.floor(Math.random() * caracteres.length);
        password += caracteres.charAt(index);
    }
    // Hasheo de password
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    // Determinar qué modelo de usuario utilizar
    if (UsuarioModelo === 'rootWorking') {
        UsuarioModelo = UsuariosRoot;
    } else {
        UsuarioModelo = Usuario;
    }

    try {
        // Buscar el usuario en el modelo correspondiente
        const usuarioResponse = await UsuarioModelo.findOne({ correo });

        if (!usuarioResponse) {
            res.status(400).send({ msg: "No se encontró ningún usuario con ese correo" });
            return;
        }

        // Función para convertir el código del área y rol al nombre del área y el rol
        let areaNombre = "";
        let rolNombre = "";

        switch (usuarioResponse.area) {
            case "A":
                areaNombre = "Administración";
                break;
            case "C":
                areaNombre = "Contaduría";
                break;
        }

        switch (usuarioResponse.rol) {
            case "A":
                rolNombre = "Administrador";
                break;
            case "AP":
                rolNombre = "Administrador de apoyo";
                break;
            case "D":
                rolNombre = "Docente";
                break;
        }

        // Envío de correo al usuario con la contraseña actualizada
        const transporter = nodemailer.createTransport({
            host: "smtp.office365.com", // Cambiar al host de Outlook si es diferente
            port: 587,
            secure: false, // Iniciar con false para iniciar una conexión no segura
            auth: {
                user: user_SendGrid,
                pass: apikey,
            },
        });

        // Contenido del correo electrónico
        const opcionesCorreo = {
            from: OUTLOOK_EMAIL,
            to: usuarioResponse.correo,
            subject: "Actualización de cuenta de la aplicación de encuestas QUICK POLLS",
            text: `Nos complace informarle que se ha actualiado su cuenta en la aplicación de encuestas con los siguientes datos:\n\n\nNombre: ${usuarioResponse.nombre}\nApellido paterno: ${usuarioResponse.apellido_paterno}\nApellido materno: ${usuarioResponse.apellido_materno}\nCorreo: ${usuarioResponse.correo}\nÁrea: ${areaNombre} \nRol: ${rolNombre}\nContraseña: ${password}\n\n\nEsta designación le otorga privilegios en la plataforma.`,
        };

        // Actualizar la contraseña en la base de datos
        await UsuarioModelo.findOneAndUpdate(
            { correo },
            { $set: { password: hashPassword } },
            { new: true }
        );

        // Enviar el correo
        transporter.sendMail(opcionesCorreo, (error, info) => {
            if (error) {
                console.log("Error al enviar el correo", error);
                res.status(400).send({ msg: "Error al reenviar el correo al usuario" });
            } else {
                //console.log("Correo enviado", info);
                res.status(200).send({ msg: "Se ha reenviado el correo al usuario" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "Error al reenviar el correo al usuario" });
    }
}

/**
 * Administrador y administrador de apoyo
 * Funcion para agregar cursos y establecer la disponibillidad del curso para qque no se pueda seleccionar
 */

async function agregarCurso(req, res) {
    const { correo, curso } = req.body;

    try {
        const cursoExistente = await Cursos.findOne({ curso });

        if (!cursoExistente) {
            return res.status(400).send({ msg: "El curso especificado no existe." });
        }

        if (!cursoExistente.disponible) {
            return res.status(400).send({ msg: "El curso no está disponible para ser agregado." });
        }

        // Obtener la fecha actual
        const fechaActual = moment();

        // Verificar si la fecha de finalización del curso ya ha pasado
        if (moment(cursoExistente.fin).isBefore(fechaActual)) {
            return res.status(400).send({ msg: "La fecha de finalización del curso ya ha pasado. No se puede agregar el curso." });
        }

        // Establecer la disponibilidad del curso como falso
        cursoExistente.disponible = false;
        await cursoExistente.save();

        const cursosActualizado = await Usuario.findOneAndUpdate(
            { correo },
            { $push: { cursos: curso } },
            { new: true }
        );

        if (!cursosActualizado) {
            return res.status(400).send({ msg: "Error al agregar curso" });
        }

        res.status(200).send({ msg: "Cursos del docente actualizado" });
    } catch (error) {
        console.error("Error al agregar curso:", error);
        res.status(500).send({ msg: "Error interno del servidor al agregar curso" });
    }
}

/**
 * Administrador y adminitrador de apoyo 
 * Funcion para quitar los cursos ahb los docentes y sirve para cuando acabe el curso y pone la disponibildad en true 
 */

async function quitarCursos(req, res) {
    const { correo, curso } = req.body;

    const cursosActualizado = await Usuario.findOneAndUpdate(
        { correo },
        { $pull: { cursos: curso } },
        { new: true }
    );

    const cursoActualizado = await Cursos.findOneAndUpdate(
        { curso },
        { disponible: true },
        { new: true }
    );

    if (!cursosActualizado) {
        res.status(400).send({ msg: "Error al quitar el curso" });
    } else {
        res.status(200).send({ msg: "Cursos del docente actualizados" });
    }
}

module.exports = {
    crearUsuario,
    borrarUsuario,
    actualizarUsuario,
    obtenerAdministradoresApoyo,
    obtenerAdministrador,
    obtenerDocente,
    obtenerUnicoUsuario,
    reenviarCorreo,
    agregarCurso,
    quitarCursos,
    crearListaUsuario
}