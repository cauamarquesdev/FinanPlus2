const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET - buscar todas as transações
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.id,
        t.client_id,
        c.company_name AS client_name,
        t.sector_id,
        s.name AS sector_name,
        t.type,
        t.payer,
        t.description,
        t.amount,
        t.transaction_date,
        t.created_at
      FROM transactions t
      LEFT JOIN clients c
        ON t.client_id = c.id
      LEFT JOIN sectors s
        ON t.sector_id = s.id
      ORDER BY t.transaction_date DESC, t.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);

    res.status(500).json({
      message: "Erro ao buscar transações.",
    });
  }
});

// POST - criar uma transação
router.post("/", async (req, res) => {
  try {
    const {
      client_id,
      sector_id,
      type,
      payer,
      description,
      amount,
      transaction_date,
    } = req.body;

    if (!type || !payer || !amount || !transaction_date) {
      return res.status(400).json({
        message: "Tipo, pagador, valor e data são obrigatórios.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO transactions (
        client_id,
        sector_id,
        type,
        payer,
        description,
        amount,
        transaction_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        client_id || null,
        sector_id || null,
        type,
        payer,
        description || null,
        amount,
        transaction_date,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar transação:", error);

    res.status(500).json({
      message: "Erro ao cadastrar transação.",
    });
  }
});

module.exports = router;
