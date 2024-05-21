const fechas = require("../models/fecha");

/*
 * Adminstrador y administrador de apoyo 
 * funcion para cargar la fecha de la encuesta
 * Se espera que no se pueddan hacer cambios en las fechas que se 
 * publicaron las encuestas y se cargen nuevas fechas de encuestas
 */

async function crearFecha(req, res) {
    const nuevaFecha = req.body;
    
    try {
        const fechaCreada = await fechas.create(nuevaFecha);
        res.status(200).send(fechaCreada);
    } catch (error) {
        res.status(400).send({ msg: "Error al cargar la fecha" });
        throw error;
    }
}

/**
 * Administrador
 * Funcion que se encarga de mostrar todas las fechas de las encuestas mostrar en una tabla o calendario
 */

async function obtnerFechas(req, res){
    const response = await fechas.find();

    if (!response) {
        res.status(400).send({ msg: "Error al obtener las encuestas de esa fecha" });
    } else {
        res.status(200).send(response);
    }
}

/*
 * Administrador y administrador de apoyo 
 * funcion para obtener las fechas guardadas y mostrarlas en unaa tabla o calendario
 */ 

async function obtnerFechasUnica(req, res) {
    const response = await fechas.findOne();

    if (!response) {
        res.status(400).send({ msg: "Error al obtener las encuestas de esa fecha" });
    } else {
        res.status(200).send(response);
    }
}

/*
 * Administrador 
 * En el caso que se deseen eliminar las fechas cargadas con aterioridad 
 */

async function eliminarFechas(req, res) {
    try {
        const fechasEliminadas = await fechas.deleteOne();

        if (!fechasEliminadas) {
            res.status(400).send({ msg: "Error al intentar eleminar las fechas" });
        } else {
            res.status(200).send({ msg: "Fechas eliminadas correctamente" });
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    crearFecha,
    obtnerFechasUnica,
    obtnerFechas,
    eliminarFechas,
}