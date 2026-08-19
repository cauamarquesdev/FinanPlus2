const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ==========================================
// GET - TRANSAÇÕES DO USUÁRIO LOGADO
// ==========================================

router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
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
        t.created_at,
        t.user_id
      FROM transactions t
      LEFT JOIN clients c
        ON t.client_id = c.id
      LEFT JOIN sectors s
        ON t.sector_id = s.id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.id DESC
      `,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);

    res.status(500).json({
      message: "Erro ao buscar transações.",
    });
  }
});

// ==========================================
// POST - CRIAR TRANSAÇÃO
// ==========================================

router.post("/", authenticateToken, async (req, res) => {
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

    const user_id = req.user.id;

    // ==========================================
    // VALIDAÇÕES
    // ==========================================

    if (!type || !payer || amount === undefined || !transaction_date) {
      return res.status(400).json({
        message: "Tipo, pagador, valor e data são obrigatórios.",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Tipo de transação inválido.",
      });
    }

    if (!["client", "user"].includes(payer)) {
      return res.status(400).json({
        message: "Pagador inválido.",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "O valor da transação deve ser maior que zero.",
      });
    }

    // ==========================================
    // REGRA DE NEGÓCIO
    // ==========================================

    // Receita = cliente paga
    if (type === "income" && payer !== "client") {
      return res.status(400).json({
        message: "Uma receita deve ser paga pelo cliente.",
      });
    }

    // Despesa = usuário paga
    if (type === "expense" && payer !== "user") {
      return res.status(400).json({
        message: "Uma despesa deve ser paga pelo usuário.",
      });
    }

    // ==========================================
    // VERIFICAR CLIENTE
    // ==========================================

    if (client_id) {
      const clientResult = await pool.query(
        `
        SELECT id
        FROM clients
        WHERE id = $1
          AND user_id = $2
        `,
        [client_id, user_id],
      );

      if (clientResult.rows.length === 0) {
        return res.status(404).json({
          message: "Cliente não encontrado.",
        });
      }
    }

    // ==========================================
    // INSERIR TRANSAÇÃO
    // ==========================================

    const result = await pool.query(
      `
      INSERT INTO transactions (
        client_id,
        sector_id,
        type,
        payer,
        description,
        amount,
        transaction_date,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        client_id || null,
        sector_id || null,
        type,
        payer,
        description?.trim() || null,
        numericAmount,
        transaction_date,
        user_id,
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
