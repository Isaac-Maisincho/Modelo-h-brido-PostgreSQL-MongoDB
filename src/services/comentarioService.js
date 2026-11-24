// src/services/comentarioService.js · Comentarios (MongoDB) validados contra la matrícula (PostgreSQL)
const mongoose = require("mongoose");
const Comentario = require("../models/comentario");
const { prisma } = require("../db/prisma");
const HttpError = require("../utils/httpError");

const createComentario = async (user, { matriculaId, calificacion, contenido } = {}) => {
  const id = Number(matriculaId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "El matriculaId es obligatorio y debe ser un entero positivo");
  }

  const matricula = await prisma.matricula.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!matricula) throw new HttpError(404, "Matrícula no encontrada");

  if (matricula.userId !== user.id) {
    throw new HttpError(403, "No puedes comentar una matrícula que no te pertenece");
  }

  if (!matricula.cursoId) {
    throw new HttpError(409, "La matrícula no tiene un curso asociado");
  }

  try {
    const comentario = await Comentario.create({
      matriculaId: matricula.id,
      userId: user.id,
      cursoId: matricula.cursoId,
      nombreEstudiante: matricula.user.name || matricula.user.email,
      calificacion,
      contenido,
    });
    return comentario;
  } catch (error) {
    if (error.code === 11000) {
      throw new HttpError(409, "Ya existe un comentario registrado para esta matrícula");
    }
    throw error;
  }
};

const listComentarios = async ({ cursoId } = {}) => {
  const filter = {};
  if (cursoId !== undefined) {
    if (!mongoose.isValidObjectId(cursoId)) {
      throw new HttpError(400, `El cursoId ${cursoId} no es un ObjectId válido`);
    }
    filter.cursoId = cursoId;
  }
  return Comentario.find(filter)
    .populate("cursoId", "codigo titulo nivel")
    .sort({ createdAt: -1 });
};

// Promedio y total de comentarios por curso con aggregate
const resumenPorCurso = async () => {
  return Comentario.aggregate([
    {
      $group: {
        _id: "$cursoId",
        promedioCalificacion: { $avg: "$calificacion" },
        totalComentarios: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "cursos",
        localField: "_id",
        foreignField: "_id",
        as: "curso",
      },
    },
    { $unwind: { path: "$curso", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        cursoId: "$_id",
        codigo: "$curso.codigo",
        titulo: "$curso.titulo",
        promedioCalificacion: { $round: ["$promedioCalificacion", 2] },
        totalComentarios: 1,
      },
    },
    { $sort: { promedioCalificacion: -1, totalComentarios: -1 } },
  ]);
};

module.exports = { createComentario, listComentarios, resumenPorCurso };
