// src/services/matriculaService.js · Matrículas (PostgreSQL) validadas contra el catálogo (MongoDB)
const mongoose = require("mongoose");
const Curso = require("../models/curso");
const { prisma } = require("../db/prisma");
const HttpError = require("../utils/httpError");

const METODOS_PAGO = ["TARJETA", "TRANSFERENCIA", "PAYPAL", "EFECTIVO"];

const toResponse = (matricula) => ({
  ...matricula,
  montoPagado: matricula.montoPagado !== undefined ? Number(matricula.montoPagado) : undefined,
});

const createMatricula = async (userId, { cursoId, metodoPago, montoPagado } = {}) => {
  if (!cursoId || !mongoose.isValidObjectId(cursoId)) {
    throw new HttpError(400, "El cursoId es obligatorio y debe ser un ObjectId válido");
  }

  const existe = await Curso.exists({ _id: cursoId });
  if (!existe) throw new HttpError(404, "El curso indicado no existe en el catálogo");

  const metodo = String(metodoPago || "").toUpperCase();
  if (!METODOS_PAGO.includes(metodo)) {
    throw new HttpError(400, `El método de pago debe ser uno de: ${METODOS_PAGO.join(", ")}`);
  }

  // Si no se envía el monto, se toma el precio vigente del curso
  let monto = montoPagado;
  if (monto === undefined || monto === null) {
    const curso = await Curso.findById(cursoId).select("precio").lean();
    monto = curso.precio;
  }
  if (typeof monto !== "number" || Number.isNaN(monto) || monto < 0) {
    throw new HttpError(400, "El monto pagado debe ser un número mayor o igual a 0");
  }

  try {
    const matricula = await prisma.matricula.create({
      data: {
        userId,
        cursoId: String(cursoId),
        montoPagado: monto,
        metodoPago: metodo,
      },
    });
    return toResponse(matricula);
  } catch (error) {
    const esUnico =
      error.code === "P2002" ||
      error.meta?.driverAdapterError?.cause?.kind === "UniqueConstraintViolation";
    if (esUnico) {
      throw new HttpError(409, "El estudiante ya está matriculado en este curso");
    }
    throw error;
  }
};

// Consulta unida sin N+1: 1 consulta a PostgreSQL + 1 consulta a MongoDB con $in
const listMatriculas = async (user) => {
  const where = user.role === "ADMIN" ? {} : { userId: user.id };
  const matriculas = await prisma.matricula.findMany({
    where,
    orderBy: { fechaMatricula: "desc" },
  });

  const cursoIds = [...new Set(matriculas.map((m) => m.cursoId).filter(Boolean))];

  const cursos = cursoIds.length
    ? await Curso.find({ _id: { $in: cursoIds } })
        .select("codigo titulo nivel precio instructor")
        .lean()
    : [];

  const cursosPorId = new Map(cursos.map((c) => [c._id.toString(), c]));

  return matriculas.map((m) => ({
    ...toResponse(m),
    curso: m.cursoId ? cursosPorId.get(m.cursoId) || null : null,
  }));
};

const deleteMatricula = async (user, id) => {
  const matriculaId = Number(id);
  if (!Number.isInteger(matriculaId) || matriculaId <= 0) {
    throw new HttpError(400, "El id de la matrícula debe ser un entero positivo");
  }
  const matricula = await prisma.matricula.findUnique({ where: { id: matriculaId } });
  if (!matricula) throw new HttpError(404, "Matrícula no encontrada");
  if (matricula.userId !== user.id && user.role !== "ADMIN") {
    throw new HttpError(403, "No puedes eliminar una matrícula que no te pertenece");
  }
  await prisma.matricula.delete({ where: { id: matriculaId } });
  return toResponse(matricula);
};

module.exports = { createMatricula, listMatriculas, deleteMatricula };
