// src/routes/comentarios.js
const { Router } = require("express");
const comentarioController = require("../controllers/comentarioController");
const authenticateToken = require("../middlewares/auth");

const router = Router();

// /resumen va antes que cualquier ruta con parámetros
router.get("/resumen", comentarioController.resumenComentarios);
router.get("/", comentarioController.listComentarios);
router.post("/", authenticateToken, comentarioController.createComentario);

module.exports = router;
