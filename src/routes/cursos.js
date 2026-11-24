// src/routes/cursos.js
const { Router } = require("express");
const cursoController = require("../controllers/cursoController");
const authenticateToken = require("../middlewares/auth");

const router = Router();

router.get("/", cursoController.listCursos);
router.get("/:id", cursoController.getCursoById);
router.post("/", authenticateToken, cursoController.createCurso);
router.put("/:id", authenticateToken, cursoController.updateCurso);
router.delete("/:id", authenticateToken, cursoController.deleteCurso);

module.exports = router;
