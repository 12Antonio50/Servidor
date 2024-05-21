const Espacio = require("../../models/RootWorking/espacio");
const Oficina = require("../../models/RootWorking/oficina");

async function crearInmueble(req, res) {
    const {
        nombre,
        direccion,
        metrosCuadrados,
        descripcion
    } = req.body;

    //Validacion de los campos requeridos
    if (!nombre) res.status(400).send({ msg: "Nombre es requerido" });
    if (!direccion) res.status(400).send({ msg: "Dirección es requerida" });
    if (!metrosCuadrados) res.status(400).send({ msg: "Metros cuadrados son requeridos" });
    if (!descripcion) res.status(400).send({ msg: "Descripción es requerida" });

    //Crear una nueva instancia del inmueble
    const espacio = new Espacio({
        nombre,
        direccion,
        metrosCuadrados,
        descripcion
    });

    //guardar los datos en la base de datos
    try {
        const inmuebleGuardar = await espacio.save();
        res.status(200).send({ msg: "Inmueble creado correctamente" });
    } catch (error) {
        res.status(400).send({ msg: "Error al cargar los datos" });
        throw error;
    }
}

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
        throw error;
    }
}

async function editarInmueble(req, res) {
    try {
        const {
            nombreOriginal,
            nombreCambio,
            direccion,
            metrosCuadrados,
            descripcion
        } = req.body;

        let nombre = nombreOriginal;

        if (nombreCambio) {
            nombre = nombreCambio; 
        }

        const inmuebleActualizado = await Espacio.findOneAndUpdate(
            { nombre: nombreOriginal }, 
            {
                nombre,
                direccion,
                metrosCuadrados,
                descripcion
            },
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
        console.log("Encuesta disponible:", oficinaEncontrada);

        if (!oficinaEncontrada) {
            return res.status(400).send({ msg: "Error al agregar la oficina, no está disponible" });
        }

        //Agregar la oficina al inmueble
        const espacioActualizado = await Espacio.findOneAndUpdate(
            { nombre },
            { $push: { oficina: oficina } },
            { new: true }
        );

        console.log("espacio actualizado:", espacioActualizado);

        //Actualizar la disponibilidad de la oficina a false
        const oficinaActualizada = await Oficina.findOneAndUpdate(
            { nombre: oficina },
            { $set: { disponible: false } }
        );
        console.log("Oficina actualizada:", oficinaActualizada);

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

async function quitarOficina(req, res) {
    const { nombre, oficina } = req.body;

    const espacioActualizada = await Espacio.findOneAndUpdate(
        { nombre },
        { $pull: { oficina: oficina } },
        { new: true },
    );

    const oficinaActualizada = await Oficina.findOneAndUpdate(
        { oficina },
        { disponible: true },
        { new: true }
    );

    if (!espacioActualizada || !oficinaActualizada) {
        res.status(400).send({ msg: "Error al quitar la oficina" });
    } else {
        res.status(200).send({ msg: "Oficina del inmueble actualizados" });
    }
}

async function obtenerEspacio(req, res) {
    const response = await Espacio.find();

    if (!response) {
        res.status(400).send({ msg: "Error al buscar los espacio" });
    } else {
        res.status(200).send(response);
    }
}

module.exports = {
    crearInmueble,
    eliminarInmueble,
    editarInmueble,
    agregarOficina,
    quitarOficina,
    obtenerEspacio
}