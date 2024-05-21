const mongoose = require("mongoose");
const app = require("./app");

const {
    DB_HOST,
    DB_PASSWORD,
    DB_USER,
    API_VERSION,
    IP_SERVER,
    DB_NAME,
} = require("./constans");

const PORT = process.env.PORT || 4000;

//Inicio del servidor de la aplicación y la conexión de la base de datos
async function main() {
    await mongoose.connect (
        `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`
    );
    app.listen(PORT, () => {
        console.log(`http://${IP_SERVER}:${PORT}/API/${API_VERSION}`);
    });
}

//ejecuta la función de arriba para establecer la conexión
main().catch((err) => console.log(err));