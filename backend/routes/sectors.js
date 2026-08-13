const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sectors ORDER BY id ASC");

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar setores:", error);

    res.status(500).json({
      message: "Erro ao buscar setores.",
    });
  }
});

module.exports = router;
