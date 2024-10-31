const Oficina = require("../../models/RootWorking/oficina");
const Codigos = require("../../models/RootWorking/codigos");
const Espacio = require("../../models/RootWorking/espacio");
const fs = require("fs");
const path = require('path');

// Función para crear una oficina
async function crearOficina(req, res) {
    const {
        nombre,
        costoBasico,
        costoIntermedio,
        costoPremium,
        metrosCuadrados,
        descripcion,
        caracteristicas,
        servicios,
        ubicacion,
        tipoEspacio,
        numeroMaximoIntegrantes,
    } = req.body;

    if (!nombre) return res.status(400).send({ msg: "Nombre es requerido" });
    if (!costoBasico) return res.status(400).send({ msg: "Costo básico es requerido" });
    if (!costoIntermedio) return res.status(400).send({ msg: "Costo intermedio es requerido" });
    if (!costoPremium) return res.status(400).send({ msg: "Costo premium es requerido" });
    if (!metrosCuadrados) return res.status(400).send({ msg: "Metros cuadrados son requeridos" });
    if (!descripcion) return res.status(400).send({ msg: "Descripción es requerida" });
    if (!caracteristicas) return res.status(400).send({ msg: "Las características son requeridas" });
    if (!servicios) return res.status(400).send({ msg: "Los servicios son requeridos" });
    if (!ubicacion) return res.status(400).send({ msg: "La ubicación es requerida" });
    if (!tipoEspacio) return res.status(400).send({ msg: "El tipo de espacio es requerido" });
    if (!numeroMaximoIntegrantes) return res.status(400).send({ msg: "El número máximo de integrantes es requerido" });

    const imagenesPath = req.files || [];
    //console.log(req.files)

    // Parsear las características y servicios si es necesario
    let parsedCaracteristicas = [];
    let parsedServicios = [];

    // Verificar si las características y servicios están en formato JSON y parsear
    if (typeof caracteristicas === 'string') {
        parsedCaracteristicas = JSON.parse(caracteristicas);
    } else {
        parsedCaracteristicas = caracteristicas;
    }

    if (typeof servicios === 'string') {
        parsedServicios = JSON.parse(servicios);
    } else {
        parsedServicios = servicios;
    }

    const oficina = new Oficina({
        nombre,
        costoBasico,
        costoIntermedio,
        costoPremium,
        metrosCuadrados,
        descripcion,
        caracteristicas: parsedCaracteristicas,
        servicios: parsedServicios,
        ubicacion,
        tipoEspacio,
        numeroMaximoIntegrantes,
        imagen: imagenesPath
    });

    try {
        const oficinaGuardar = await oficina.save();
        res.status(200).send({ msg: "Oficina creada correctamente", oficina: oficinaGuardar });
    } catch (error) {
        console.error("Error al guardar la oficina:", error);
        res.status(400).send({ msg: "Error al cargar los datos", error });
    }
}

async function eliminarOficina(req, res) {
    const { nombre } = req.body;

    console.log("El nombre de la oficina es:", nombre)

    if (!nombre) {
        return res.status(400).send({ msg: "Nombre de la oficina es requerido" });
    }

    try {
        // Eliminar el directorio asociado a la oficina
        const directorio = path.join(__dirname, '../../uploads', nombre);
        console.log("Ruta del directorio a eliminar:", directorio);

        if (fs.existsSync(directorio)) {
            console.log("El directorio existe y se eliminará.");
            try {
                fs.rmSync(directorio, { recursive: true, force: true });
                console.log("Directorio eliminado correctamente.");
            } catch (err) {
                console.error("Error al eliminar el directorio:", err);
                return res.status(500).send({ msg: "Error al eliminar los archivos asociados" });
            }
        } else {
            console.log("El directorio no existe.");
        }

        // Buscar y eliminar la oficina
        const oficinaEliminada = await Oficina.findOneAndDelete({ nombre });

        if (!oficinaEliminada) {
            return res.status(404).send({ msg: "No se encontró la oficina para eliminar" });
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

        const updatedInmuebles = await Promise.all(updatePromises);
        res.status(200).send({ msg: "Oficina eliminada correctamente y actualizada en inmuebles", updatedInmuebles });
    } catch (error) {
        console.error("Error al eliminar la oficina:", error);
        res.status(500).send({ msg: "Error interno del servidor" });
    }
}

// Función para editar una oficina
async function editarOficina(req, res) {
    const {
        nombreOriginal,
        nombreCambio,
        costoBasico,
        costoIntermedio,
        costoPremium,
        metrosCuadrados,
        descripcion,
        caracteristicas,
        servicios,
        ubicacion,
        tipoEspacio,
        numeroMaximoIntegrantes
    } = req.body;

    // Parsear las características y servicios si es necesario
    let parsedCaracteristicas = [];
    let parsedServicios = [];

    try {
        // Verificar si las características y servicios están en formato JSON y parsear
        if (typeof caracteristicas === 'string') {
            parsedCaracteristicas = JSON.parse(caracteristicas);
        } else {
            parsedCaracteristicas = caracteristicas;
        }

        if (typeof servicios === 'string') {
            parsedServicios = JSON.parse(servicios);
        } else {
            parsedServicios = servicios;
        }

        const nombre = nombreCambio || nombreOriginal;

        // Verificar si el nombre de la oficina cambió
        if (nombreOriginal !== nombre) {
            const directorioAntiguo = path.join(__dirname, '../../uploads', nombreOriginal);
            const nuevoDirectorio = path.join(__dirname, '../../uploads', nombre);

            if (fs.existsSync(directorioAntiguo)) {
                fs.renameSync(directorioAntiguo, nuevoDirectorio); // Renombrar el directorio
            }
        }

        // Actualizar la oficina
        const oficinaActualizada = await Oficina.findOneAndUpdate(
            { nombre: nombreOriginal },
            {
                $set: {
                    nombre,
                    costoBasico,
                    costoIntermedio,
                    costoPremium,
                    metrosCuadrados,
                    descripcion,
                    caracteristicas: parsedCaracteristicas,
                    servicios: parsedServicios,
                    ubicacion,
                    tipoEspacio,
                    numeroMaximoIntegrantes
                },
            },
            { new: true }
        );

        if (!oficinaActualizada) {
            return res.status(400).send({ msg: "Error al actualizar la oficina" });
        }

        // Actualizar la referencia en el modelo de Espacio si el nombre ha cambiado
        if (nombreOriginal !== nombre) {
            const result = await Espacio.updateMany(
                { oficina: nombreOriginal },
                { $set: { 'oficina.$[elem]': nombre } },
                { arrayFilters: [{ 'elem': nombreOriginal }] }
            );
        }

        res.status(200).send(oficinaActualizada);
    } catch (error) {
        console.error("Error al actualizar la oficina:", error);
        res.status(500).send({ msg: "Error en el servidor", error });
    }
}


async function obtenerTodasOficinas(req, res) {
    try {
        const response = await Oficina.find();

        //console.log(response)

        if (!response) {
            return res.status(400).send({ msg: "Error al buscar las oficinas" });
        }

        const oficinasConImagenes = response.map(oficina => {
            const oficinaDir = path.join(__dirname, '../../uploads', oficina.nombre);
            let imagenes = [];

            if (fs.existsSync(oficinaDir)) {
                imagenes = fs.readdirSync(oficinaDir).map(file => {
                    return `http://localhost:4000/API/v1/uploads/${oficina.nombre}/${file}`;
                });
            }

            return {
                ...oficina.toObject(),
                imagenes
            };
        });


        res.status(200).send(oficinasConImagenes);
    } catch (error) {
        res.status(500).send({ msg: "Error en el servidor", error });
    }
}

async function obtenerOficina(req, res) {
    try {
        const response = await Oficina.find({ deshabilitar: false });

        if (!response) {
            return res.status(400).send({ msg: "Error al buscar las oficinas" });
        }

        const oficinasConImagenes = response.map(oficina => {
            const oficinaDir = path.join(__dirname, '../../uploads', oficina.nombre);
            let imagenes = [];

            if (fs.existsSync(oficinaDir)) {
                imagenes = fs.readdirSync(oficinaDir).map(file => {
                    return `http://localhost:4000/API/v1/uploads/${oficina.nombre}/${file}`;
                });
            }

            return {
                ...oficina.toObject(),
                imagenes
            };
        });

        res.status(200).send(oficinasConImagenes);
    } catch (error) {
        res.status(500).send({ msg: "Error en el servidor", error });
    }
}

async function obtenerOficinaUnica(req, res) {
    const { nombre } = req.query;

    try {
        const response = await Oficina.findOne({ nombre: nombre });

        if (!response) {
            return res.status(404).send({ msg: "Error al encontrar la oficina" });
        }

        const oficinaDir = path.join(__dirname, '../../uploads/', response.nombre);
        let imagenes = [];

        if (fs.existsSync(oficinaDir)) {
            imagenes = fs.readdirSync(oficinaDir).map(file => {
                return `http://localhost:4000/API/v1/uploads/${response.nombre}/${file}`;
            });
        }

        const oficinaConImagenes = {
            ...response.toObject(),
            imagenes
        };

        res.status(200).send(oficinaConImagenes);
    } catch (error) {
        res.status(500).send({ msg: "Error en el servidor", error });
    }
}


async function obtenerOficinaDeshabilitada(req, res) {
    try {
        const respuesta = await Oficina.find({ deshabilitar: true });

        if (!respuesta) {
            return res.status(400).send({ msg: "Error al buscar las oficinas deshabilitadas" });
        }

        const oficinasConImagenes = respuesta.map(oficina => {
            const oficinaDir = path.join(__dirname, '../../uploads/', oficina.nombre);
            let imagenes = [];

            if (fs.existsSync(oficinaDir)) {
                imagenes = fs.readdirSync(oficinaDir).map(file => {
                    return path.join('/uploads', oficina.nombre, file);
                });
            }

            return {
                ...oficina.toObject(),
                imagenes
            };
        });

        res.status(200).send(oficinasConImagenes);
    } catch (error) {
        res.status(500).send({ msg: "Error en el servidor", error });
    }
}

async function deshabilitarEspacio(req, res) {
    const { nombre } = req.body;

    try {
        const oficinaDeshabilitada = await Oficina.findOneAndUpdate(
            { nombre: nombre },
            { $set: { deshabilitar: true } }
        );

        if (!oficinaDeshabilitada) {
            return res.status(400).send({ msg: "Error al deshabilitar el espacio ", nombre });
        } else {
            return res.status(200).send({ msg: "Espacio deshabilitado correctemnte" });
        }
    } catch (error) {
        console.error("Error", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

async function habilitarEspacio(req, res) {
    const { nombre } = req.body;

    try {
        const oficinaHabilitada = await Oficina.findOneAndUpdate(
            { nombre: nombre },
            { $set: { deshabilitar: false } },
        );

        if (!oficinaHabilitada) {
            return res.status(400).send({ msg: "Error al habilitar el espacio" });
        } else {
            return res.status(200).send({ msg: "Espacio habilitado correctemente" });
        }
    } catch (error) {
        console.error("Error", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

// Función para agregar un código a una oficina sin validación de horarios
async function agregarCodigo(req, res) {
    try {
        const { codigo, nombre } = req.body;

        // Verificar si los parámetros obligatorios están presentes
        if (!codigo || !nombre) {
            return res.status(400).send({ msg: "El código y el nombre de la oficina son requeridos" });
        }

        // Buscar todas las rentas existentes para la oficina en cuestión
        const rentasExistentes = await Oficina.find({ nombre: nombre });

        // Validar si ya existe una renta con el mismo código
        const codigoExistente = rentasExistentes.find(oficina => oficina.codigos.includes(codigo));
        if (codigoExistente) {
            return res.status(400).send({ msg: "El código ya está asociado a la oficina" });
        }

        // Agregar el código a la oficina
        const oficinaActualizada = await Oficina.findOneAndUpdate(
            { nombre: nombre },
            { $push: { codigos: codigo } },
            { new: true }
        );

        if (!oficinaActualizada) {
            return res.status(400).send({ msg: "Error al agregar el código a la oficina" });
        } else {
            return res.status(200).send({ msg: "Código agregado a la oficina exitosamente" });
        }

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

// Función para quitar un código de una oficina
async function quitarCodigo(req, res) {
    const { codigo, nombre } = req.body;

    try {
        const oficinaActualizada = await Oficinas.findOneAndUpdate(
            { nombre: nombre },
            { $pull: { codigos: codigo } },
            { new: true }
        );

        if (!oficinaActualizada) {
            return res.status(400).send({ msg: "Error al quitar el código de la oficina" });
        } else {
            return res.status(200).send({ msg: "Código quitado de la oficina exitosamente" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ msg: "Error interno del servidor" });
    }
}

const obtenerOficinasConCodigos = async (req, res) => {
    try {
        // Obtener todas las oficinas sin poblar los códigos inicialmente
        const oficinas = await Oficina.find();

        // Verificar si se obtuvieron oficinas
        if (!oficinas || oficinas.length === 0) {
            return res.status(404).send({ msg: "No se encontraron oficinas" });
        }

        // Obtener los detalles de los códigos por separado
        const oficinasConDetalles = await Promise.all(oficinas.map(async (oficina) => {
            const codigosDetalles = await Codigos.find({ codigo: { $in: oficina.codigos } });

            const detallesCodigos = codigosDetalles.map(codigo => ({
                codigo: codigo.codigo || 'N/A',
                paqueteSeleccionado: codigo.paquete || 'N/A',
                precioTotal: codigo.precioTotal || 0
            }));

            const cantidadCodigos = codigosDetalles.length;
            const totalCodigos = oficinas.reduce((total, oficina) => total + oficina.codigos.length, 0);
            const porcentaje = (totalCodigos > 0) ? (cantidadCodigos / totalCodigos) * 100 : 0;

            return {
                nombre: oficina.nombre,
                tipoEspacio: oficina.tipoEspacio,
                paqueteBasico: oficina.costoBasico,
                paqueteIntermedio: oficina.costoIntermedio,
                paquetePremium: oficina.costoPremium,
                cantidadCodigos,
                porcentaje: porcentaje.toFixed(2), // Redondear a 2 decimales
                detallesCodigos // Añadir los detalles de los códigos
            };
        }));

        res.status(200).send(oficinasConDetalles);
    } catch (error) {
        console.error("Error en la función obtenerOficinasConCodigos:", error);
        res.status(500).send({ msg: "Error interno del servidor", error });
    }
};

module.exports = {
    crearOficina,
    eliminarOficina,
    editarOficina,
    obtenerOficina,
    obtenerOficinaDeshabilitada,
    deshabilitarEspacio,
    habilitarEspacio,
    obtenerOficinaUnica,
    agregarCodigo,
    quitarCodigo,
    obtenerTodasOficinas,
    obtenerOficinasConCodigos
}