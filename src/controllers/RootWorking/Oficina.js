const Oficina = require("../../models/RootWorking/oficina");

async function crearOficina(req, res) {
    const {
        nombre,
        costo,
        metrosCuadrados,
        descripcion
    } = req.body

    //Validacion de los campos requeridos
    if (!nombre) res.status(400).send({ msg: "Nombre es requerido" });
    if (!costo) res.status(400).send({ msg: "Costo es requerida" });
    if (!metrosCuadrados) res.status(400).send({ msg: "Metros cuadrados son requeridos" });
    if (!descripcion) res.status(400).send({ msg: "Descripción es requerida" });

    const oficina = new Oficina({
        nombre,
        costo,
        metrosCuadrados,
        descripcion
    });

    //guardar los datos en la base de datos
    try {
        const oficinaGuardar = await oficina.save();
        res.status(200).send({ msg: "Oficina creada correctamente" });
    } catch (error) {
        res.status(400).send({ msg: "Error al cargar los datos" });
        throw error;
    }
}

async function eliminarOficina(req, res) {
    const { nombre } = req.body;

    try {
        const oficinaEliminada = await Oficina.findOneAndDelete({ nombre });

        if (!oficinaEliminada) {
            res.status(400).send({ msg: "Error al eliminar la oficina" });
        } else {
            res.status(200).send({ msg: "Inmueble eliminado" });
        }
    } catch (error) {
        throw error;
    }
}

async function editarOficina(req, res) {
    const {
        nombreOriginal,
        nombreCambio,
        costo,
        metrosCuadrados,
        descripcion
    } = req.body;

    let nombre = "";

    if (nombreCambio) {
        nombre = nombreCambio;
    } else {
        nombre = nombreOriginal;
    }

    const oficinaActualizada = await Oficina.findOneAndUpdate(
        { nombre: nombreOriginal },
        {
            $set: {
                nombre,
                costo,
                metrosCuadrados,
                descripcion
            },
        },
        { new: true }
    );

    if (!oficinaActualizada) {
        res.status(400).send({ msg: "Error al actualizar la oficina" });
    } else {
        res.status(200).send(oficinaActualizada);
    }
}

async function obtenerOficina(req, res) {
    const response = await Oficina.find();

    if (!response) {
        res.status(400).send({ msg: "Error al buscar los oficina" });
    } else {
        res.status(200).send(response);
    }
}

module.exports = {
    crearOficina,
    eliminarOficina,
    editarOficina,
    obtenerOficina
}