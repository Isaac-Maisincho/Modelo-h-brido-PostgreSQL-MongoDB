// src/models/curso.js · Catálogo de cursos (MongoDB). Los módulos se embeben: se leen junto con el curso.
const mongoose = require("mongoose");

const moduloSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título del módulo es obligatorio"],
      trim: true,
    },
    duracionMinutos: {
      type: Number,
      required: [true, "La duración del módulo es obligatoria"],
      min: [1, "La duración del módulo debe ser de al menos 1 minuto"],
    },
    orden: {
      type: Number,
      required: [true, "El orden del módulo es obligatorio"],
      min: [1, "El orden del módulo empieza en 1"],
    },
  },
  { _id: false },
);

const cursoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, "El código del curso es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^CRS-\d{4}$/, "El código debe tener el formato CRS-0000"],
    },
    titulo: {
      type: String,
      required: [true, "El título del curso es obligatorio"],
      trim: true,
      minlength: [5, "El título debe tener al menos 5 caracteres"],
      maxlength: [120, "El título no puede superar los 120 caracteres"],
    },
    descripcion: {
      type: String,
      required: [true, "La descripción del curso es obligatoria"],
      trim: true,
      minlength: [10, "La descripción debe tener al menos 10 caracteres"],
    },
    nivel: {
      type: String,
      required: [true, "El nivel del curso es obligatorio"],
      uppercase: true,
      enum: {
        values: ["BASICO", "INTERMEDIO", "AVANZADO"],
        message: "El nivel {VALUE} no es válido (BASICO, INTERMEDIO o AVANZADO)",
      },
    },
    precio: {
      type: Number,
      required: [true, "El precio del curso es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
      max: [5000, "El precio no puede superar 5000"],
    },
    instructor: {
      type: String,
      required: [true, "El instructor es obligatorio"],
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    modulos: {
      type: [moduloSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 1,
        message: "El curso debe tener al menos 1 módulo",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtuales: se calculan desde los módulos embebidos, no se guardan
cursoSchema.virtual("duracionTotalMinutos").get(function () {
  if (!Array.isArray(this.modulos)) return undefined;
  return this.modulos.reduce((total, m) => total + (m.duracionMinutos || 0), 0);
});

cursoSchema.virtual("totalModulos").get(function () {
  if (!Array.isArray(this.modulos)) return undefined;
  return this.modulos.length;
});

// pre("validate") sin next: normaliza espacios del título y numera los módulos sin orden
cursoSchema.pre("validate", function () {
  if (typeof this.titulo === "string") {
    this.titulo = this.titulo.replace(/\s+/g, " ").trim();
  }
  if (Array.isArray(this.modulos)) {
    this.modulos.forEach((modulo, index) => {
      if (modulo.orden === undefined || modulo.orden === null) {
        modulo.orden = index + 1;
      }
    });
  }
});

module.exports = mongoose.model("Curso", cursoSchema);
