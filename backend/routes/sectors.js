const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// GET /sectors (Público autenticado ou compartilhado)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM sectors ORDER BY name ASC",
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("❌ Erro ao buscar setores contábeis:", error);
    return res
      .status(500)
      .json({ message: "Erro ao listar centros de custos." });
  }
});

module.exports = router;
