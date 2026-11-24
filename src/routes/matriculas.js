// src/routes/matriculas.js
const { Router } = require("express");
const matriculaController = require("../controllers/matriculaController");
const authenticateToken = require("../middlewares/auth");

const router = Router();

router.post("/", authenticateToken, matriculaController.createMatricula);
router.get("/", authenticateToken, matriculaController.listMatriculas);
router.delete("/:id", authenticateToken, matriculaController.deleteMatricula);

module.exports = router;
