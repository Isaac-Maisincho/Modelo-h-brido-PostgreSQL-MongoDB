// src/models/comentario.js · Registro que crece (MongoDB): un comentario por matrícula
const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema(
  {
    // Referencia a Matricula.id de PostgreSQL (sin FK). Único: máximo un comentario por matrícula.
    matriculaId: {
      type: Number,
      required: [true, "El id de la matrícula es obligatorio"],
      unique: true,
    },
    // Referencia a User.id de PostgreSQL; sale del token JWT
    userId: {
      type: Number,
      required: [true, "El id del usuario es obligatorio"],
    },
    // Referencia dentro de MongoDB: permite populate
    cursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Curso",
      required: [true, "El curso es obligatorio"],
    },
    // Dato copiado (desnormalizado) desde PostgreSQL al momento de comentar
    nombreEstudiante: {
      type: String,
      required: [true, "El nombre del estudiante es obligatorio"],
      trim: true,
    },
    calificacion: {
      type: Number,
      required: [true, "La calificación es obligatoria"],
      min: [1, "La calificación mínima es 1"],
      max: [5, "La calificación máxima es 5"],
    },
    contenido: {
      type: String,
      required: [true, "El contenido del comentario es obligatorio"],
      trim: true,
      minlength: [5, "El comentario debe tener al menos 5 caracteres"],
      maxlength: [500, "El comentario no puede superar los 500 caracteres"],
    },
  },
  { timestamps: true },
);

// Índice para listar los comentarios de un curso, los más nuevos primero
comentarioSchema.index({ cursoId: 1, createdAt: -1 });

module.exports = mongoose.model("Comentario", comentarioSchema);
