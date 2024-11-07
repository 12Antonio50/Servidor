const Curso = require("../models/curso");
const Encuestas = require("../models/encuestas");
const Usuario = require("../models/usuarios");
const Publico = require("../models/publico");
const Clase = require("../models/clase");
const moment = require("moment");

// Define una variable global para almacenar la última ejecución
let ultimaEjecucion = moment();

// Función para actualizar el estado de los cursos
async function actualizarEstadoCursos() {
    try {
        // Obtener la fecha actual
        const fechaActual = moment();

        // Buscar todos los cursos cuya fecha de finalización haya pasado
        const cursosVencidos = await Curso.find({
            fin: { $lt: fechaActual.toDate() } // Convertir a objeto Date
        });

        //console.log(cursosVencidos)

        // Actualizar cada curso encontrado
        for (const curso of cursosVencidos) {
            // Convertir la fecha de finalización de cadena de texto a objeto Moment
            const fechaFinalizacion = moment(curso.fin, 'YYYY-MM-DD');
            // Comparar las fechas utilizando objetos Moment
            if (fechaFinalizacion.isBefore(fechaActual)) { // Sin especificar 'day' para comparar horas exactas
                // Cambiar la disponibilidad a true
                curso.disponible = true;

                // Buscar todas las encuestas vinculadas al curso por título
                const encuestasVinculadas = await Encuestas.find({ titulo: { $in: curso.encuestas } });

                // Iterar sobre las encuestas y cambiar su disponibilidad a true
                for (const encuesta of encuestasVinculadas) {
                    encuesta.disponible = true;
                    await encuesta.save();
                }

                // Desvincular las encuestas del curso
                curso.encuestas = [];
                // Desvincular los usuarios
                curso.publico = [];
                await curso.save();

                // Buscar todos los usuarios que tienen este curso y eliminarlo de su lista de cursos
                const usuariosConCurso = await Usuario.find({ cursos: curso.curso });
                //console.log(usuariosConCurso)

                // Quitar el curso de cada usuario y guardar los cambios
                for (const usuario of usuariosConCurso) {
                    //console.log("Cursos del usuario antes de la eliminación:", usuario.cursos);
                    usuario.cursos = usuario.cursos.filter(c => c !== curso.curso);
                    //console.log("Cursos del usuario después de la eliminación:", usuario.cursos);
                    await usuario.save();
                }
            }
        }

        // Actualizar la variable de la última ejecución al final de la función
        ultimaEjecucion = fechaActual;

    } catch (error) {
        console.error("Error al actualizar el estado de los cursos:", error);
    }
}


// Programar la ejecución periódica de la función actualizarEstadoCursos
setInterval(actualizarEstadoCursos, 24 * 60 * 60 * 1000); // Ejecutar cada 24 horas (86400000 milisegundos)

// Ejecutar la función una vez al inicio para actualizar los cursos vencidos inmediatamente
actualizarEstadoCursos();

/**
 * Administrador y administrador de apoyo.
 * Son los únicos usuarios que deben tener el acceso a crear un curso.
 */
async function crearCurso(req, res) {
    const {
        curso,
        area,
        creador,
        duracion,
        inicio,
        fin,
        //imagen,
    } = req.body;

    // Validación de los campos requeridos
    if (!curso) res.status(400).send({ msg: "Curso es requerido" });
    if (!area) res.status(400).send({ msg: "Área es requerida" });
    if (!creador) res.status(400).send({ msg: "Creador es requerido" });
    if (!duracion) res.status(400).send({ msg: "Duración del curso es requerida" });
    if (!inicio) res.status(400).send({ msg: "Inicio es requerido" });
    if (!fin) res.status(400).send({ msg: "Fin es requerido" });
    //if (!imagen) res.status(400).send({ msg: "Imagen es requerida" });

    // Crear una nueva instancia del curso
    const cursos = new Curso({
        curso,
        area,
        creador,
        duracion,
        inicio,
        fin,
        //imagen,
    });

    // Guardar los datos en la BD
    try {
        const cursoGuardar = await cursos.save();
        res.status(200).send({ msg: "Curso creado correctamente" });
    } catch (error) {
        res.status(400).send({ msg: "Error al cargar los datos" });
        throw error;
    }
}

/**
 * Administrador.
 * Función para seleccionar y eliminar un curso.
 */
async function eliminarCurso(req, res) {
    const { curso } = req.body;

    try {
        const cursoEliminado = await Curso.findOneAndDelete({ curso });

        if (!cursoEliminado) {
            res.status(400).send({ msg: "Error al eliminar el curso" });
        } else {
            res.status(200).send({ msg: "Curso eliminado" });
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Administrador.
 * Función para obtener todos los cursos.
 */
async function obtenerCursos(req, res) {
    const response = await Curso.find();

    if (!response) {
        res.status(400).send({ msg: "Error al buscar los cursos" });
    } else {
        res.status(200).send(response);
    }
}

/**
 * Administrador de apoyo.
 * Función para buscar los cursos que estén disponibles de acuerdo al área que pertenezca el administrador de apoyo.
 */
async function cursosActivos(req, res) {
    const { area } = req.body;

    const cursosActivos = await Curso.find({ disponible: true });

    let cursos = [];

    cursosActivos.forEach((cursoActivo) => {
        let areaCurso = cursoActivo.area;

        if (areaCurso === area) {
            cursos.push(cursoActivo);
        }
    });

    if (cursos.length === 0) {
        res.status(400).send({
            msg: "Error, no se encontraron cursos disponibles de acuerdo al área",
        });
    } else {
        res.status(200).send(cursos);
    }
}

/**
 * Administrador.
 * Función para editar el nombre del curso. Se debe enviar un JSON con dos atributos: el nombre que tiene actualmente y el segundo al que se tiene que cambiar.
 */
async function editarCurso(req, res) {
    const {
        cursoOriginal,
        cursoCambio,
        area,
        creador,
        duracion,
        inicio,
        fin,
        //imagen,
    } = req.body;

    let curso = "";

    if (cursoCambio) {
        curso = cursoCambio;
    } else {
        curso = cursoOriginal;
    }

    const cursoActualizado = await Curso.findOneAndUpdate(
        { curso: cursoOriginal },
        {
            $set: {
                curso,
                area,
                creador,
                duracion,
                inicio,
                fin,
                //imagen,
            },
        },
        { new: true }
    );

    if (!cursoActualizado) {
        res.status(400).send({ msg: "Error al actualizar el curso" });
    } else {
        res.status(200).send(cursoActualizado);
    }
}

/**
 * Función para agregar una encuesta a un curso.
 */
async function agregarEncuesta(req, res) {
    try {
        const { curso, encuesta } = req.body;

        // Verificar si la encuesta está disponible
        const encuestaDisponible = await Encuestas.findOne({ titulo: encuesta, disponible: true });

        if (!encuestaDisponible) {
            return res.status(400).send({ msg: "Error al agregar la encuesta, no está disponible" });
        }

        // Verificar si el curso está vencido
        const cursoEncontrado = await Curso.findOne({ curso });

        if (!cursoEncontrado) {
            return res.status(404).send({ msg: "Curso no encontrado" });
        }

        const fechaActual = moment();
        if (moment(cursoEncontrado.fin).isBefore(fechaActual)) {
            return res.status(400).send({ msg: "Error, no se puede agregar la encuesta a un curso vencido" });
        }

        // Agregar la encuesta al curso
        const cursoActualizado = await Curso.findOneAndUpdate(
            { curso },
            { $push: { encuestas: encuesta } },
            { new: true }
        );

        // Actualizar la disponibilidad de la encuesta a false
        const encuestaActualizada = await Encuestas.updateOne(
            { titulo: encuesta },
            { $set: { disponible: false } }
        );

        if (!cursoActualizado || encuestaActualizada.nModified === 0) {
            return res.status(400).send({ msg: "Error al agregar la encuesta" });
        }

        return res.status(200).send({ msg: "Encuesta del curso actualizada" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}


/**
 * Función para quitar una encuesta de un curso.
 */
async function quitarEncuesta(req, res) {
    const { curso, titulo } = req.body;

    const encuestasActualizadas = await Curso.findOneAndUpdate(
        { curso },
        { $pull: { encuestas: titulo } },
        { new: true }
    );

    const encuestaActualizada = await Encuestas.findOneAndUpdate(
        { titulo },
        { disponible: true },
        { new: true }
    );

    if (!encuestasActualizadas || !encuestaActualizada) {
        res.status(400).send({ msg: "Error al quitar la encuesta" });
    } else {
        res.status(200).send({ msg: "Encuesta del curso actualizada" });
    }
}

/**
 * Función para agregar un estudiante a un curso.
 */
async function agregarEstudiante(req, res) {
    const { curso, nombre } = req.body;

    try {
        // Verificar si el estudiante ya está en la base de datos
        const encontrarEstudiante = await Publico.findOne({ nombre });
        if (!encontrarEstudiante) {
            return res.status(400).send({ msg: "El estudiante no existe en la base de datos" });
        }

        // Encontrar el curso por su nombre
        const cursoEncontrado = await Curso.findOne({ curso });
        if (!cursoEncontrado) {
            return res.status(400).send({ msg: "El curso no existe en la base de datos" });
        }

        // Actualizar el curso encontrando por su nombre
        const cursoActualizado = await Curso.findOneAndUpdate(
            { curso }, // Utilizamos el nombre del curso para buscar
            { $push: { publico: nombre } },
            { new: true }
        );

        if (!cursoActualizado) {
            return res.status(400).send({ msg: "Error al agregar el estudiante al curso" });
        }

        return res.status(200).send({ msg: "Estudiante agregado al curso correctamente" });
    } catch (error) {
        console.error("Error al agregar estudiante al curso:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

/**
 * Función para quitar un estudiante de un curso.
 */
async function quitarEstudiante(req, res) {
    const { curso, nombre } = req.body;

    try {
        const cursoActualizado = await Curso.findOneAndUpdate(
            { curso },
            { $pull: { publico: nombre } },
            { new: true }
        );

        if (!cursoActualizado) {
            return res.status(400).send({ msg: "Error al quitar al estudiante" });
        }

        return res.status(200).send({ msg: "Estudiante del curso actualizado" });
    } catch (error) {
        console.error("Error al desvincular estudiante del curso:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

/**
 * Función para obtener un único curso por su nombre.
 */
async function obtenerUnicoCurso(req, res) {
    const { curso } = req.body;

    const response = await Curso.findOne({ curso });

    if (!response) {
        res.status(400).send({ msg: "Error al obtener los datos del curso" });
    } else {
        res.status(200).send(response);
    }
}

async function cursosActivosTodos(req, res) {
    try {
        // Buscar todos los cursos activos (disponibles)
        const cursosActivos = await Curso.find({ disponible: true });

        // Verificar si hay cursos activos disponibles
        if (cursosActivos.length === 0) {
            res.status(400).send({
                msg: "Error, no se encontraron cursos disponibles",
            });
        } else {
            // Enviar la lista de cursos activos como respuesta
            res.status(200).send(cursosActivos);
        }
    } catch (error) {
        // Manejar posibles errores durante la ejecución
        console.error("Error al buscar cursos activos:", error);
        res.status(500).send({
            msg: "Ocurrió un error interno al buscar cursos activos",
        });
    }
}

async function cursosActivosConNumeroPublico(req, res) {
    try {
        // Buscar los cursos cuya disponibilidad sea true
        const cursosActivos = await Curso.find({ disponible: true });

        // Mapear los cursos para agregar el número de público y los nombres del público
        const cursosConNumeroPublico = cursosactivos.map(curso => ({
            ...curso._doc,
            numeroPublico: curso.publico.length,
            nombresPublico: curso.publico.map(p => p.nombre)
        }));

        // Verificar si hay cursos activos disponibles
        if (cursosConNumeroPublico.length === 0) {
            res.status(400).send({
                msg: "Error, no se encontraron cursos activos",
            });
        } else {
            // Enviar la lista de cursos activos con el número de público y los nombres del público como respuesta
            res.status(200).send(cursosConNumeroPublico);
        }
    } catch (error) {
        // Manejar posibles errores durante la ejecución
        console.error("Error al buscar cursos activos:", error);
        res.status(500).send({
            msg: "Ocurrió un error interno al buscar cursos inactivos",
        });
    }
}
async function agregarClase(req, res) {
    try {
        const { curso, nombre } = req.body;

        const claseEncontrada = await Clase.findOne({ nombre });

        if (!claseEncontrada) {
            return res.status(400).send({ msg: "Error al agregar la clase al curso, la clase no se encontro" });
        }

        //Agregar la clase al curso
        const cursoActualizado = await Curso.findOneAndUpdate(
            { curso },
            { $push: { clase: nombre } },
            { new: true }
        );

        const claseActualizada = await Clase.findOneAndUpdate(
            { nombre: nombre },
            { $set: { disponible: false } },
        );

        if (!cursoActualizado || !claseActualizada) {
            return res.status(400).send({ msg: "Error al agregar la clase" });
        } else {
            return res.status(200).send({ msg: "Clase del curso actualizada" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

async function quitarClase(req, res) {
    const { curso, clase } = req.body;

    console.log(req.body);

    try {
        const cursoActualizado = await Curso.findOneAndUpdate(
            { curso },
            { $pull: { clase: clase } },
            { new: true }
        );

        if (!cursoActualizado) {
            return res.status(400).send({ msg: "Error al quitar la clase" });
        }
        console.log("Curso actualizado:", cursoActualizado);
        return res.status(200).send({ msg: "Clase del curso actualizada" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

module.exports = {
    crearCurso,
    eliminarCurso,
    obtenerCursos,
    cursosActivos,
    editarCurso,
    agregarEncuesta,
    quitarEncuesta,
    agregarEstudiante,
    quitarEstudiante,
    obtenerUnicoCurso,
    cursosActivosTodos,
    cursosActivosConNumeroPublico,
    agregarClase,
    quitarClase
};
