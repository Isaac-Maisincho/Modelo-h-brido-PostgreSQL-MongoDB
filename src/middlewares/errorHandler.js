// src/middlewares/errorHandler.js · Traduce errores de Mongoose, MongoDB y Prisma a respuestas HTTP
const mongoose = require("mongoose");

const resolveError = (err) => {
  // Validación de Mongoose (required, min, max, enum, match, validate...)
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      campo: e.path,
      mensaje: e.message,
    }));
    return { statusCode: 400, message: "Datos inválidos", errors };
  }

  // ObjectId u otro tipo mal formado
  if (err instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      message: `Valor inválido para el campo ${err.path}: ${err.value}`,
    };
  }

  // Índice único de MongoDB
  if (err && err.code === 11000) {
    const campos = Object.keys(err.keyValue || err.keyPattern || {}).join(", ");
    return {
      statusCode: 409,
      message: `Ya existe un registro con el mismo valor en: ${campos || "campo único"}`,
    };
  }

  // Prisma: violación de @unique / @@unique
  if (err && err.code === "P2002") {
    return {
      statusCode: 409,
      message: "Ya existe un registro con esos datos únicos",
    };
  }

  // Prisma: registro no encontrado
  if (err && err.code === "P2025") {
    return { statusCode: 404, message: "Registro no encontrado" };
  }

  // JSON mal formado en el body
  if (err && err.type === "entity.parse.failed") {
    return { statusCode: 400, message: "El cuerpo de la petición no es JSON válido" };
  }

  return {
    statusCode: err.statusCode || 500,
    message: err.message || "Ocurrió un error inesperado",
  };
};

const errorHandler = (err, req, res, next) => {
  const { statusCode, message, errors } = resolveError(err);

  console.log(`[ERROR] ${new Date().toISOString()} - ${statusCode} - ${message}`);
  if (statusCode >= 500 && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && statusCode >= 500 && { stack: err.stack }),
  });
};

module.exports = errorHandler;
