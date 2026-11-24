// src/services/cursoService.js · Catálogo de cursos (MongoDB) + borrado protegido con PostgreSQL
const mongoose = require("mongoose");
const Curso = require("../models/curso");
const Comentario = require("../models/comentario");
const { prisma } = require("../db/prisma");
const HttpError = require("../utils/httpError");

const UPDATABLE_FIELDS = [
  "codigo",
  "titulo",
  "descripcion",
  "nivel",
  "precio",
  "instructor",
  "activo",
  "modulos",
];

const PROJECTABLE_FIELDS = [
  "codigo",
  "titulo",
  "descripcion",
  "nivel",
  "precio",
  "instructor",
  "activo",
  "modulos",
  "createdAt",
  "updatedAt",
];

const SORTABLE_FIELDS = ["precio", "titulo", "nivel", "codigo", "createdAt", "updatedAt"];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, `El id ${id} no es un ObjectId válido`);
  }
};

const buildProjection = (fields) => {
  if (!fields) return null;
  const selected = String(fields)
    .split(",")
    .map((f) => f.trim())
    .filter((f) => PROJECTABLE_FIELDS.includes(f));
  return selected.length ? selected.join(" ") : null;
};

const buildSort = (sort) => {
  if (!sort) return { createdAt: -1 };
  const result = {};
  String(sort)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((s) => {
      const desc = s.startsWith("-");
      const field = desc ? s.slice(1) : s;
      if (SORTABLE_FIELDS.includes(field)) result[field] = desc ? -1 : 1;
    });
  return Object.keys(result).length ? result : { createdAt: -1 };
};

const createCurso = async (data) => {
  return Curso.create(data);
};

const listCursos = async ({ q, fields, sort, nivel } = {}) => {
  const filter = {};
  if (q && String(q).trim()) {
    const regex = { $regex: escapeRegex(String(q).trim()), $options: "i" };
    filter.$or = [{ titulo: regex }, { instructor: regex }];
  }
  if (nivel) filter.nivel = String(nivel).toUpperCase();

  const query = Curso.find(filter).sort(buildSort(sort));
  const projection = buildProjection(fields);
  if (projection) query.select(projection);
  return query;
};

const getCursoById = async (id) => {
  assertValidId(id);
  const curso = await Curso.findById(id);
  if (!curso) throw new HttpError(404, "Curso no encontrado");
  return curso;
};

// findById + asignación + save(): así corren las validaciones y el hook pre("validate")
const updateCurso = async (id, data = {}) => {
  assertValidId(id);
  const curso = await Curso.findById(id);
  if (!curso) throw new HttpError(404, "Curso no encontrado");
  for (const field of UPDATABLE_FIELDS) {
    if (data[field] !== undefined) curso.set(field, data[field]);
  }
  await curso.save();
  return curso;
};

// Borrado protegido: si hay matrículas en PostgreSQL → 409. Si no, borra el curso y sus comentarios.
const deleteCurso = async (id) => {
  assertValidId(id);
  const curso = await Curso.findById(id);
  if (!curso) throw new HttpError(404, "Curso no encontrado");

  const matriculas = await prisma.matricula.count({ where: { cursoId: id } });
  if (matriculas > 0) {
    throw new HttpError(
      409,
      `No se puede eliminar el curso ${curso.codigo}: tiene ${matriculas} matrícula(s) asociada(s) en PostgreSQL`,
    );
  }

  const { deletedCount } = await Comentario.deleteMany({ cursoId: id });
  await curso.deleteOne();
  return { curso, comentariosEliminados: deletedCount };
};

module.exports = {
  createCurso,
  listCursos,
  getCursoById,
  updateCurso,
  deleteCurso,
};
