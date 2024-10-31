const Clase = require("../models/clase");
const Curso = require("../models/curso");
const fs = require('fs');
const path = require('path');

async function crearClase(req, res) {
    const {
        nombre,
        docente,
        curso,
        fecha,
        tema
    } = req.body;

    // Validaciones
    if (!nombre) return res.status(400).send({ msg: "El nombre es requerido" });
    if (!docente) return res.status(400).send({ msg: "El docente es requerido" });
    if (!curso) return res.status(400).send({ msg: "El curso es requerido" });
    if (!fecha) return res.status(400).send({ msg: "La fecha es requerida" });
    if (!tema) return res.status(400).send({ msg: "El tema es requerido" });

    // Verificar si hay un archivo de video
    const videoPath = req.file ? req.file.path : null;

    // Crear la clase con los datos
    const clase = new Clase({
        nombre,
        docente,
        curso,
        fecha,
        tema,
        video: videoPath
    });

    try {
        const claseGuardar = await clase.save();
        res.status(200).send({ msg: "Clase creada correctamente", clase: claseGuardar });
    } catch (error) {
        console.error("Error al crear la clase:", error);
        res.status(400).send({ msg: "Error al crear la clase", error });
    }
}

async function editarClase(req, res) {
    const {
        nombreOriginal,
        nombreCambio,
        docente,
        curso,
        fecha,
        tema,
    } = req.body;

    let nombre = "";

    if (nombreCambio) {
        nombre = nombreCambio;
    } else {
        nombre = nombreOriginal;
    }
    //Verificar si el nombre de la oficina cambio
    if (nombreOriginal !== nombre) {
        const directorioAntiguo = path.join(__dirname, '../uploads', nombreOriginal);
        const nuevoDirectorio = path.join(__dirname, '../uploads', nombre);

        if (fs.existsSync(directorioAntiguo)) {
            fs.renameSync(directorioAntiguo, nuevoDirectorio);
        }
    }

    const claseEditada = await Clase.findOneAndUpdate(
        { nombre: nombreOriginal },
        {
            $set: {
                nombre,
                docente,
                curso,
                fecha,
                tema,
            },
        },
        { new: true }
    );

    //Actualizar la referencia en el modelo de curso si el nombre ha cambiadao
    if (nombreOriginal !== nombre) {
        const resultado = await Curso.updateMany(
            { clase: nombreOriginal },
            { $set: { 'clase.$[elem]': nombre } },
            { arrayFilters: [{ 'elem': nombreOriginal }] }
        );
    }

    if (!claseEditada) {
        res.status(400).send({ msg: "Error al actualizar la clase" });
    } else {
        res.status(200).send(claseEditada);
    }
}

async function eliminarClase(req, res) {
    const { nombre } = req.body;

    if (!nombre) return res.status(400).send({ msg: "El nombre es requerido" });

    try {
        //Eliminar el directorio asociado al curso 
        const directorio = path.join(__dirname, '../uploads', nombre);
        console.log("Ruta del directorio a eliminar:", directorio);

        if (fs.existsSync(directorio)) {
            console.log("El directorio existe y se eliminará");
            try {
                fs.rmSync(directorio, { recursive: true, force: true });
                console.log("Directorio eliminado correctamente");
            } catch (error) {
                console.error("Error al eliminar el directodio:", error);
                return res.status(500).send({ msg: "Error al eliminar los archivos asociados" })
            }
        } else {
            console.log("El directorio no existe");
        }

        const claseEliminada = await Clase.findOneAndDelete({ nombre });

        if (!claseEliminada) {
            return res.status(400).send({ msg: "Error al eliminar la clase, no se encontró" });
        }

        res.status(200).send({ msg: "Clase eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la clase:", error);  // Muestra más detalles del error
        res.status(500).send({ msg: "Error interno del servidor" });
    }
}


async function obtenerClase(req, res) {
    const respuesta = await Clase.find();

    if (!respuesta) {
        res.status(400).send({ msg: "Error al obtener las clases" });
    } else {
        res.status(200).send(respuesta);
    }
}

async function obtenerUnicaClase(req, res) {
    const { nombre } = req.body;

    try {
        const respuesta = await Clase.findOne({ nombre });

        if (!respuesta) {
            return res.status(400).send({ msg: "Error al obtener la clase" });
        }

        const claseDir = path.join(__dirname, '../uploads/', respuesta.nombre);
        let video = '';

        if (fs.existsSync(claseDir)) {
            const archivos = fs.readdirSync(claseDir);

            // Lista de extensiones válidas para archivos de video
            const extensionesValidas = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];

            // Buscar un archivo que tenga una de las extensiones válidas
            const archivoVideo = archivos.find(file => {
                return extensionesValidas.some(ext => file.endsWith(ext));
            });

            if (archivoVideo) {
                video = `http://localhost:4000/API/v1/uploads/${respuesta.nombre}/${archivoVideo}`;
            }
        }

        const claseConVideo = {
            ...respuesta.toObject(),
            video
        };

        res.status(200).send(claseConVideo);
    } catch (error) {
        res.status(500).send({ msg: "Error en el servidor", error });
    }
}

module.exports = {
    crearClase,
    editarClase,
    eliminarClase,
    obtenerClase,
    obtenerUnicaClase
}