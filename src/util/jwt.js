require('dotenv').config();
const jwt = require("jsonwebtoken");


function crearAccessToken(usuario) {
    const expToken = new Date();
    expToken.setHours(expToken.getHours() +12);
    
    const payload = {
        token_type: "access",
        iat: Date.now(),
        exp: expToken.getTime(),
        correo: usuario.correo,
        rol: usuario.rol,
    } 
    return jwt.sign(payload, SECRET_KEY);
}

function crearRefreshToken(usuario) {
    const expToken = new Date();
    expToken.setMonth(expToken.getMonth() + 12);

    const payload = {
        token_type: "refresh",
        iat: Date.now(),
        exp: expToken.getTime(),
        correo: usuario.correo,
        rol: usuario.rol,
    }
    return jwt.sign(payload, SECRET_KEY);
}

function decode(token) {
    return jwt.decode(token, SECRET_KEY, true);
}

module.exports ={
    crearAccessToken,
    crearRefreshToken,
    decode,
}