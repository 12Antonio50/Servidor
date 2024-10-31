require('dotenv').config();

const mongoose = require("mongoose");
const app = require("./app");

// Usar variables de entorno
const { 
    DB_USER, 
    DB_PASSWORD, 
    DB_HOST, 
    DB_NAME, 
    IP_SERVER, 
    API_VERSION 
} = process.env;

const PORT = process.env.PORT || 4000;

async function main() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(
            `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`
        );
        console.log('Conexión a MongoDB establecida.');
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://${IP_SERVER}:${PORT}/API/${API_VERSION}`);
        });
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error);
    }
}

// Ejecuta la función para establecer la conexión
main().catch((err) => console.log(err));
