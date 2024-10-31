const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Directorio de subida
const uploadDir = path.join(__dirname, '../../uploads/');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const oficinaNombre = req.body.nombreCambio || req.body.nombreOriginal || req.body.nombre;
        const oficinaDir = path.join(uploadDir, oficinaNombre);

        if (!fs.existsSync(oficinaDir)) {
            fs.mkdirSync(oficinaDir, { recursive: true });
        }
        cb(null, oficinaDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

// Filtro de tipo de archivo para aceptar imágenes y videos
const fileFilter = function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mkv|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten imágenes o videos"));
    }
};

// Configuración de multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;
