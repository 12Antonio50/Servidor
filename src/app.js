require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { API_VERSION } = process.env;
//require("dotenv").config({ path: ".env" });

const app = express();

//configurar body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//importar rutas
const encuestasRoutes = require("./routes/encuestas.routes");
const fechaRoutes = require("./routes/fecha.routes");
const publicoRoutes = require("./routes/publico.routes");
const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuarios.routes");
const cursosRoutes = require("./routes/cursos.routes");
const respuestasRoutes = require("./routes/respuestas.routes");
//Root Working
const espaciosRoutes = require("./routes/espacio.routes");
const oficinaRoutes = require("./routes/oficina.routes");

//configurar header http - cors
app.use(cors());

//configurar rutas
app.use(`/API/${API_VERSION}`, encuestasRoutes);
app.use(`/API/${API_VERSION}`, fechaRoutes);
app.use(`/API/${API_VERSION}`, publicoRoutes);
app.use(`/API/${API_VERSION}`, authRoutes);
app.use(`/API/${API_VERSION}`, usuarioRoutes);
app.use(`/API/${API_VERSION}`, cursosRoutes);
app.use(`/API/${API_VERSION}`, respuestasRoutes);
//Root Working
app.use(`/API/${API_VERSION}`, espaciosRoutes);
app.use(`/API/${API_VERSION}`, oficinaRoutes);

module.exports = app;