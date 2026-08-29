const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

// Consulta os dados da assinatura única
router.get("/status", authenticateToken, async (req, res) => {
  return res.json({
    plan_name: "FinanPlus Enterprise",
    price_monthly: 197.0,
    status: "active",
    features_unlocked: true,
  });
});

module.exports = router;
