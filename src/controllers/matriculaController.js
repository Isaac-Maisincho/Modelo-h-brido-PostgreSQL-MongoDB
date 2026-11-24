// src/controllers/matriculaController.js
const matriculaService = require("../services/matriculaService");

const createMatricula = async (req, res, next) => {
  try {
    const matricula = await matriculaService.createMatricula(req.user.id, req.body);
    res.status(201).json(matricula);
  } catch (error) {
    next(error);
  }
};

const listMatriculas = async (req, res, next) => {
  try {
    const matriculas = await matriculaService.listMatriculas(req.user);
    res.json({ total: matriculas.length, data: matriculas });
  } catch (error) {
    next(error);
  }
};

const deleteMatricula = async (req, res, next) => {
  try {
    const matricula = await matriculaService.deleteMatricula(req.user, req.params.id);
    res.json({ message: `Matrícula ${matricula.id} eliminada`, matricula });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMatricula, listMatriculas, deleteMatricula };
