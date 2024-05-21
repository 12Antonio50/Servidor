const jwt = require("../util/jwt");

function authAdmin(req, res, next) {
    if (!req.headers.authorization) {
        return res
            .status(400)
            .send({ msg: "ERROR, no se encontro la cabecera de autorizacion" });
    }

    const token = req.headers.authorization;

    try {
        const payload = jwt.decode(token);
        const { exp } = payload;
        const { rol } = payload;
        const currentDate = new Date().getTime();

        if (exp <= currentDate) {
            return res.status(400).send({ msg: "Token ha expirado" });
        }

        if (rol != "A") {
            return res
                .status(400)
                .send({ msg: "Usuario no valido para esta accion" });
        }
        return next();
    } catch (error) {
        return res.status(400).send({ msg: "Error en la autorizacion" });
    }
}

function authAdminAP(req, res, next) {
    if (!req.headers.authorization) {
        return res
            .status(400)
            .send({ msg: "Error, no se encontro la cabecera de autorizacion" });
    }
    const token = req.headers.authorization;

    try {
        const payload = jwt.decode(token);
        const { exp } = payload;
        const { rol } = payload;
        const currentDate = new Date().getTime();

        if (exp <= currentDate) {
            return res.status(400).send({ msg: "Token ha expirado" });
        }

        if (rol === "A" || rol === "AP") {
            return next();
        }
        return res.status(400).send({ msg: "Usuario no valido para esta accion" });
    } catch (error) {
        return res.status(400).send({ msg: "Error en la autorizacion" });
    }
}

function authDocente(req, res, next) {
    if (!req.headers.authorization) {
        return res
            .status(400)
            .send({ msg: "Error, no se encontra la cabecera de autorizacion" });
    }

    const token = req.headers.authorization;

    try {
        const payload = jwt.decode(token);
        const { exp } = payload;
        const { rol } = payload;
        const currentDate = new Date().getTime();

        if (exp <= currentDate) {
            return res.status(400).send({ msg: "Token ha espirado" });
        }

        if (rol != "D") {
            return res
                .status(400)
                .send({ msg: "Usuario no valido para esta accion" });
        }

        return next();
    } catch (error) {
        return res.status(400).send({ msg: "Error en la autorizacion" });
    }
}

function authAdminDocente(req, res, next) {
    if (!req.headers.authorization) {
        return res
            .status(400)
            .send({ msg: "Error, no se encuentra la cabecera de autorizacion" });
    }

    const token = req.headers.authorization;

    try {
        const payload = jwt.decode(token);
        const { exp } = payload;
        const { rol } = payload;
        const currentDate = new Date().getTime();

        if (exp <= currentDate) {
            return res.status(400).send({ msg: "Token ha expirado" });
        }

        if (rol === "D" || rol === "A" || rol === "AP") {
            return next();
        }

        return res.status(400).send({ msg: "Usuario no valido para esta accion" });
    } catch (error) {
        return res.status(400).send({ msg: "Error en la autorizacion" });
    }
}

module.exports = {
    authAdmin,
    authAdminAP,
    authDocente,
    authAdminDocente,
}