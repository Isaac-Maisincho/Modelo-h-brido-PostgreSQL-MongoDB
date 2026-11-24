// src/middlewares/auth.js · Verifica el JWT y deja el usuario en req.user ({ id, role })
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", statusCode: 401, message: "Acceso denegado: falta el token" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(401)
        .json({ status: "error", statusCode: 401, message: "Token inválido o expirado" });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
