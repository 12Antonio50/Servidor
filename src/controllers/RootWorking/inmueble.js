const Espacio = require("../../models/RootWorking/espacio");
const Oficina = require("../../models/RootWorking/oficina");
const Codigo = require("../../models/RootWorking/codigos");

// Función para crear un inmueble
async function crearInmueble(req, res) {
    const {
        nombre,
        direccion,
        metrosCuadrados,
        descripcion
    } = req.body;

    // Validación de los campos requeridos
    if (!nombre) return res.status(400).send({ msg: "Nombre es requerido" });
    if (!direccion) return res.status(400).send({ msg: "Dirección es requerida" });
    if (!metrosCuadrados) return res.status(400).send({ msg: "Metros cuadrados son requeridos" });
    if (!descripcion) return res.status(400).send({ msg: "Descripción es requerida" });

    // Crear una nueva instancia del inmueble
    const espacio = new Espacio({
        nombre,
        direccion,
        metrosCuadrados,
        descripcion
    });

    // Guardar los datos en la base de datos
    try {
        await espacio.save();
        res.status(200).send({ msg: "Inmueble creado correctamente" });
    } catch (error) {
        res.status(400).send({ msg: "Error al cargar los datos" });
        throw error;
    }
}

// Función para eliminar un inmueble
async function eliminarInmueble(req, res) {
    const { nombre } = req.body;

    try {
        const inmuebleEliminado = await Espacio.findOneAndDelete({ nombre });

        if (!inmuebleEliminado) {
            res.status(400).send({ msg: "Error al eliminar el inmueble" });
        } else {
            res.status(200).send({ msg: "Inmueble eliminado" });
        }
    } catch (error) {
        res.status(500).send({ msg: "Error interno del servidor" });
        throw error;
    }
}

// Función para editar un inmueble
async function editarInmueble(req, res) {
    const {
        nombreOriginal,
        nombreCambio,
        direccion,
        metrosCuadrados,
        descripcion
    } = req.body;

    let nombre = nombreOriginal;
    if (nombreCambio) nombre = nombreCambio;

    try {
        const inmuebleActualizado = await Espacio.findOneAndUpdate(
            { nombre: nombreOriginal },
            { nombre, direccion, metrosCuadrados, descripcion },
            { new: true }
        );

        if (!inmuebleActualizado) {
            return res.status(400).send({ msg: "No se pudo encontrar el inmueble para actualizar" });
        }

        res.status(200).send(inmuebleActualizado);
    } catch (error) {
        console.error('Error al actualizar el inmueble:', error);
        res.status(500).send({ msg: "Error interno del servidor al actualizar el inmueble" });
    }
}

async function agregarOficina(req, res) {
    try {
        const { nombre, oficina } = req.body;

        //Verificar si la oficina esta disponible
        const oficinaEncontrada = await Oficina.findOne({ nombre: oficina, disponible: true });

        if (!oficinaEncontrada) {
            return res.status(400).send({ msg: "Error al agregar la oficina, no está disponible" });
        }

        //Agregar la oficina al inmueble
        const espacioActualizado = await Espacio.findOneAndUpdate(
            { nombre },
            { $push: { oficina: oficina } },
            { new: true }
        );

        //Actualizar la disponibilidad de la oficina a false
        const oficinaActualizada = await Oficina.findOneAndUpdate(
            { nombre: oficina },
            { $set: { disponible: false } }
        );

        if (!espacioActualizado) {
            return res.status(400).send({ msg: "Error al agregar la oficina" });
        } else {
            return res.status(200).send({ msg: "Oficina del inmueble actualizada" });
        }

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

// Función para quitar una oficina de un inmueble
async function quitarOficina(req, res) {
    const { nombre, oficina } = req.body;

    try {
        const espacioActualizado = await Espacio.findOneAndUpdate(
            { nombre },
            { $pull: { oficinas: oficina } },
            { new: true }
        );

        const oficinaActualizada = await Oficina.findOneAndUpdate(
            { nombre: oficina },
            { $set: { disponible: true } },
            { new: true }
        );

        if (!espacioActualizado || !oficinaActualizada) {
            return res.status(400).send({ msg: "Error al quitar la oficina" });
        } else {
            return res.status(200).send({ msg: "Oficina del inmueble actualizada" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

// Función para obtener todos los espacios
async function obtenerEspacio(req, res) {
    try {
        const response = await Espacio.find();

        if (!response) {
            res.status(400).send({ msg: "Error al buscar los espacios" });
        } else {
            res.status(200).send(response);
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ msg: "Error interno del servidor" });
    }
}

async function eliminarOficina(req, res) {
    const { nombre } = req.body;

    try {
        // Eliminar la oficina
        const oficinaEliminada = await Oficina.findOneAndDelete({ nombre });

        if (!oficinaEliminada) {
            return res.status(400).send({ msg: "Error al eliminar la oficina" });
        }

        // Buscar todos los inmuebles que contienen la oficina eliminada
        const inmuebles = await Espacio.find({ oficina: nombre });

        // Actualizar cada inmueble eliminando la oficina
        const updatePromises = inmuebles.map(async (inmueble) => {
            const updatedInmueble = await Espacio.findOneAndUpdate(
                { _id: inmueble._id },
                { $pull: { oficina: nombre } },
                { new: true }
            );
            return updatedInmueble;
        });

        // Ejecutar todas las actualizaciones en paralelo
        const updatedInmuebles = await Promise.all(updatePromises);
        res.status(200).send({ msg: "Oficina eliminada y actualizada en los inmuebles", updatedInmuebles });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

async function obtenerInmuebleConMasRentas(req, res) {
    try {
        // Obtener todos los inmuebles
        const inmuebles = await Espacio.find().populate('oficina');

        // Crear un objeto para almacenar las rentas mensuales por inmueble
        const rentasPorMes = {};

        // Recorrer cada inmueble
        for (const inmueble of inmuebles) {
            const { nombre, oficina } = inmueble;

            // Recorrer cada oficina en el inmueble
            for (const oficinaNombre of oficina) {
                // Obtener los datos de la oficina por nombre
                const oficinaData = await Oficina.findOne({ nombre: oficinaNombre }).populate('codigos');

                if (oficinaData && oficinaData.codigos) {
                    // Recorrer cada código en la oficina
                    for (const codigoStr of oficinaData.codigos) {
                        const codigoData = await Codigo.findOne({ codigo: codigoStr });

                        if (codigoData && codigoData.fechaGeneracion) {
                            const fechaGeneracion = new Date(codigoData.fechaGeneracion);
                            const mes = fechaGeneracion.getMonth() + 1; // Obtener el mes (0-11) y ajustar a (1-12)
                            const año = fechaGeneracion.getFullYear();

                            // Crear una clave para el mes y año
                            const claveMesAño = `${año}-${mes}`;

                            // Inicializar el objeto para el inmueble si no existe
                            if (!rentasPorMes[nombre]) {
                                rentasPorMes[nombre] = {};
                            }

                            // Inicializar el contador para el mes y año si no existe
                            if (!rentasPorMes[nombre][claveMesAño]) {
                                rentasPorMes[nombre][claveMesAño] = 0;
                            }

                            // Incrementar el contador de rentas para el mes y año
                            rentasPorMes[nombre][claveMesAño]++;
                        }
                    }
                }
            }
        }

        // Encontrar el inmueble con más rentas por cada mes
        const maxRentasPorMes = {};

        for (const inmueble in rentasPorMes) {
            for (const mesAño in rentasPorMes[inmueble]) {
                if (!maxRentasPorMes[mesAño] || rentasPorMes[inmueble][mesAño] > maxRentasPorMes[mesAño].cantidad) {
                    maxRentasPorMes[mesAño] = {
                        inmueble,
                        cantidad: rentasPorMes[inmueble][mesAño]
                    };
                }
            }
        }

        // Devolver tanto el inmueble con más rentas como los datos completos
        res.status(200).send({
            maxRentasPorMes,
            todosLosDatos: rentasPorMes
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ msg: "Error interno del servidor" });
    }
}


module.exports = {
    crearInmueble,
    eliminarInmueble,
    editarInmueble,
    agregarOficina,
    quitarOficina,
    obtenerEspacio,
    eliminarOficina,
    obtenerInmuebleConMasRentas
};