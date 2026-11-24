// src/db/mongo.js · Conexión a MongoDB con Mongoose
const mongoose = require("mongoose");

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Conectado a MongoDB");
};

module.exports = connectMongo;
