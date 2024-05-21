require('dotenv').config();

const mongoose = require("mongoose");
const app = require("./src/app");


const PORT = process.env.PORT || 4000;

//Inicio del servidor de la aplicación y la conexión de la base de datos
async function main() {
    try {
        await mongoose.connect (
            `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`
        );
        app.listen(PORT, () => {
            console.log(`http://${IP_SERVER}:${PORT}/API/${API_VERSION}`);
        });
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error);
    }
}

//ejecuta la función de arriba para establecer la conexión
main().catch((err) => console.log(err));