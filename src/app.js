// src/app.js
const express = require("express");
const routes = require("./routes");
const LoggerMiddleware = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(LoggerMiddleware);

app.get("/", (req, res) => {
  res.json({ message: "API Cursos en línea · PostgreSQL + MongoDB" });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    statusCode: 404,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

module.exports = app;
