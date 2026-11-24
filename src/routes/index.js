// src/routes/index.js
const { Router } = require("express");
const authRouter = require("./auth");
const cursosRouter = require("./cursos");
const matriculasRouter = require("./matriculas");
const comentariosRouter = require("./comentarios");

const router = Router();

router.use("/auth", authRouter);
router.use("/cursos", cursosRouter);
router.use("/matriculas", matriculasRouter);
router.use("/comentarios", comentariosRouter);

module.exports = router;
