require('dotenv').config();
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { API_VERSION } = process.env;

const app = express();

// Configurar body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar ruta para servir archivos estáticos
app.use(`/API/${API_VERSION}/uploads`, express.static(path.join(__dirname, 'uploads')));

// Importar rutas
const encuestasRoutes = require("./routes/encuestas.routes");
const fechaRoutes = require("./routes/fecha.routes");
const publicoRoutes = require("./routes/publico.routes");
const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuarios.routes");
const cursosRoutes = require("./routes/cursos.routes");
const respuestasRoutes = require("./routes/respuestas.routes");
const claseRoutes = require("./routes/clase.routes");
// Root Working
const espaciosRoutes = require("./routes/RootWorking/espacio.routes");
const oficinaRoutes = require("./routes/RootWorking/oficina.routes");
const codigosRoutes = require("./routes/RootWorking/codigos.routes");

// Configurar header http - cors
app.use(cors());

// Configurar rutas
app.use(`/API/${API_VERSION}`, encuestasRoutes);
app.use(`/API/${API_VERSION}`, fechaRoutes);
app.use(`/API/${API_VERSION}`, publicoRoutes);
app.use(`/API/${API_VERSION}`, authRoutes);
app.use(`/API/${API_VERSION}`, usuarioRoutes);
app.use(`/API/${API_VERSION}`, cursosRoutes);
app.use(`/API/${API_VERSION}`, respuestasRoutes);
app.use(`/API/${API_VERSION}`, claseRoutes);
// Root Working
app.use(`/API/${API_VERSION}`, espaciosRoutes);
app.use(`/API/${API_VERSION}`, oficinaRoutes);
app.use(`/API/${API_VERSION}`, codigosRoutes);

module.exports = app;
