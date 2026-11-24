// src/server.js · El servidor HTTP arranca solo después de conectar a PostgreSQL y MongoDB
require("dotenv").config();
const { connectPostgres } = require("./db/prisma");
const connectMongo = require("./db/mongo");
const app = require("./app");

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectPostgres();
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error de conexión a las bases de datos:", err.message);
    process.exit(1);
  }
};

start();
