const Publico = require("../models/publico");

async function crearPublicoIndidual(req, res) {
    const {
        nombre,
        correo,
        correoOpcional,
        telefono,
        celular,
        fecha
    } = req.body;

    if (!nombre) res.status(400).send({ msg: "Nombre es requerido" });
    if (!correo) res.status(400).send({ msg: "Correo es requerido" });
    if (!fecha) res.status(400).send({ msg: "Fecha es requerido" });

    const publicoExiste = await Publico.findOne({ correo: correo });

    if (publicoExiste) {
        return res.status(400).send({ msg: "El alumno que esta intentando crear ya existe" })
    }

    // Crear una nueva instancia del publico
    const publico = new Publico({
        nombre,
        correo,
        correoOpcional,
        telefono,
        celular,
        fecha
    });

    // Guardar el publico en la base de datos 
    try {
        const userStorage = await publico.save();

        res.status(200).send({ msg: "Usuario registrado" });

    } catch (error) {
        res.status(400).send({ msg: "Error al registar" })
    }
}

async function crearListaPublico(req, res) {
    const publicoArray = req.body;

    try {
        const publicoCreado = await Publico.insertMany(publicoArray);

        res
            .status(200)
            .send({ msg: "Exito al cargar la lista de publico ", publicoCreado });
    } catch (error) {
        res.status(400).send({ msg: "Error al cargar la lista" });
        throw error;
    }
}

async function eliminarPublico(req, res) {
    const { correo } = req.body;

    try {
        const publicoEliminado = await Publico.findOneAndDelete({ correo });

        if (!publicoEliminado) {
            res.status(400).send({ msg: "Error, no se pudo eliminar el usuario" });
        } else {
            res.status(200).send({ msg: "Usuario eliminado" });
        }
    } catch (error) {
        throw error;
    }
}

async function actualizarPublico(req, res) {
    const {
        correoOriginal,
        correoCambio,
        nombre,
        correoOpcional,
        telefono,
        celular,
        fecha
    } = req.body;

    let correo = "";

    if (correoCambio) {
        correo = correoCambio;
    } else {
        correo = correoOriginal;
    }

    try {
        const publicoActualizado = await Publico.findOneAndUpdate(
            { correo: correoOriginal },
            {
                $set: {
                    correo,
                    nombre,
                    correoOpcional,
                    telefono,
                    celular,
                    fecha
                },
            },
            { new: true }
        );

        if (!publicoActualizado) {
            res.status(400).send({ msg: "Error al actualizar los datos" });
        } else {
            res.status(200).send({ msg: "Datos actualizados correctamente" });
        }
    } catch (error) {
        console.error("Error durante la actualización:", error);
        res.status(500).send({ msg: "Error interno del servidor" });
    }
}

async function obtenerTodoPublico(req, res) {
    const response = await Publico.find();

    if (!response) {
        res.status(400).send({ msg: "Error, no se pudo obtener los datos" });
    } else {
        res.status(200).send(response);
    }
}

async function obtenerUnicoPublico(req, res) {
    const { correo } = req.body;

    const response = await Publico.find({ correo });

    if (!response) {
        res.status(400).send({ msg: "Error, no se pudo obtener los datos" });
    } else {
        res.status(200).send(response);
    }
}

async function obtenerPublicocreados(req, res) {
    try {
        const { anio } = req.body;

        const publicos = await Publico.find();

        const publicosPorMes = {};

        publicos.forEach(publico => {
            const fecha = new Date(publico.fecha);
            const mes = fecha.getMonth() + 1;
            const ano = fecha.getFullYear();

            if (ano === parseInt(anio)) {
                if (!publicosPorMes[mes]) {
                    publicosPorMes[mes] = { total: 0, porcentaje: 0, nombres: [] };
                }
                publicosPorMes[mes].total++;
                publicosPorMes[mes].nombres.push(publico.nombre); // Asumiendo que `publico.nombre` es el campo que contiene el nombre
            }
        });

        const totalPublicosAnio = Object.values(publicosPorMes).reduce((total, mes) => total + mes.total, 0);

        // Calcular el porcentaje de publicos por mes
        for (const mes in publicosPorMes) {
            const publicosMes = publicosPorMes[mes].total;
            publicosPorMes[mes].porcentaje = (publicosMes / totalPublicosAnio) * 100;
        }

        // Enviar el resultado como respuesta
        res.status(200).send(publicosPorMes);
    } catch (error) {
        console.error("Error al procesar la solicitud:", error.message);
        res.status(500).send({ msg: "Error al procesar la solicitud" });
    }
}

module.exports = {
    crearPublicoIndidual,
    crearListaPublico,
    eliminarPublico,
    actualizarPublico,
    obtenerTodoPublico,
    obtenerUnicoPublico,
    obtenerPublicocreados
};
