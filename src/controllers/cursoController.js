// src/controllers/cursoController.js
const cursoService = require("../services/cursoService");

const createCurso = async (req, res, next) => {
  try {
    const curso = await cursoService.createCurso(req.body);
    res.status(201).json(curso);
  } catch (error) {
    next(error);
  }
};

const listCursos = async (req, res, next) => {
  try {
    const { q, fields, sort, nivel } = req.query;
    const cursos = await cursoService.listCursos({ q, fields, sort, nivel });
    res.json({ total: cursos.length, data: cursos });
  } catch (error) {
    next(error);
  }
};

const getCursoById = async (req, res, next) => {
  try {
    const curso = await cursoService.getCursoById(req.params.id);
    res.json(curso);
  } catch (error) {
    next(error);
  }
};

const updateCurso = async (req, res, next) => {
  try {
    const curso = await cursoService.updateCurso(req.params.id, req.body);
    res.json(curso);
  } catch (error) {
    next(error);
  }
};

const deleteCurso = async (req, res, next) => {
  try {
    const { curso, comentariosEliminados } = await cursoService.deleteCurso(req.params.id);
    res.json({
      message: `Curso ${curso.codigo} eliminado`,
      cursoId: curso._id,
      comentariosEliminados,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCurso, listCursos, getCursoById, updateCurso, deleteCurso };
