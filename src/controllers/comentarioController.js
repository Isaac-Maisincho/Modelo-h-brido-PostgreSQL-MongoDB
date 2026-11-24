// src/controllers/comentarioController.js
const comentarioService = require("../services/comentarioService");

const createComentario = async (req, res, next) => {
  try {
    const comentario = await comentarioService.createComentario(req.user, req.body);
    res.status(201).json(comentario);
  } catch (error) {
    next(error);
  }
};

const listComentarios = async (req, res, next) => {
  try {
    const comentarios = await comentarioService.listComentarios({ cursoId: req.query.cursoId });
    res.json({ total: comentarios.length, data: comentarios });
  } catch (error) {
    next(error);
  }
};

const resumenComentarios = async (req, res, next) => {
  try {
    const resumen = await comentarioService.resumenPorCurso();
    res.json({ total: resumen.length, data: resumen });
  } catch (error) {
    next(error);
  }
};

module.exports = { createComentario, listComentarios, resumenComentarios };
