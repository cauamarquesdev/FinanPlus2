const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

// 1. Listar transações
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const result = await pool.query(
      `
      SELECT 
        t.*,
        c.company_name AS client_name,
        s.name AS sector_name
      FROM transactions t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN sectors s ON t.sector_id = s.id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.id DESC
      `,
      [user_id],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("❌ Erro ao buscar transações:", error);
    return res.status(500).json({
      message: "Erro ao buscar transações.",
      detail: error.message,
    });
  }
});

// 2. Criar transação (com fallback automático para client_id e sector_id)
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

    const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    if (!type || !amount || !transaction_date) {
      return res.status(400).json({
        message: "Tipo, valor e data de competência são obrigatórios.",
      });
    }

    const normalizedType = String(type).toLowerCase().trim();
    if (!["income", "expense"].includes(normalizedType)) {
      return res.status(400).json({ message: "Tipo de transação inválido." });
    }

    const numericAmount = Number(String(amount).replace(",", "."));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ message: "O montante deve ser superior a zero." });
    }

    // 1. Garante um setor existente (para não violar FK)
    let finalSectorId = sector_id ? Number(sector_id) : null;
    if (!finalSectorId) {
      const sectorQuery = await pool.query(
        "SELECT id FROM sectors ORDER BY id ASC LIMIT 1",
      );
      if (sectorQuery.rows.length > 0) {
        finalSectorId = sectorQuery.rows[0].id;
      }
    }

    // 2. GARANTE UM CLIENTE VÁLIDO (Impede o erro NOT NULL de client_id)
    let finalClientId = client_id ? Number(client_id) : null;
    if (!finalClientId) {
      // Tenta pegar o primeiro cliente deste usuário
      let clientQuery = await pool.query(
        "SELECT id FROM clients WHERE user_id = $1 ORDER BY id ASC LIMIT 1",
        [user_id],
      );

      if (clientQuery.rows.length === 0) {
        // Se o usuário não tiver nenhum cliente cadastrado, cria um genérico agora
        clientQuery = await pool.query(
          `
          INSERT INTO clients (company_name, type, email, phone, contact, status, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
          `,
          [
            "Lançamentos Gerais / Extrato",
            "Serviços",
            "sistema@finanplus.com",
            "(00) 0000-0000",
            "Financeiro",
            "active",
            user_id,
          ],
        );
      }

      finalClientId = clientQuery.rows[0].id;
    }

    const finalPayer =
      payer || (normalizedType === "income" ? "client" : "user");
    const finalDesc = description?.trim() || "Lançamento via Extrato";

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
        finalClientId,
        finalSectorId,
        normalizedType,
        finalPayer,
        finalDesc,
        numericAmount,
        transaction_date,
        user_id,
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ ERRO DETALHADO NO POST /transactions:", error);
    return res.status(500).json({
      message: "Erro ao gravar lançamento financeiro.",
      detail: error.message || error.detail,
    });
  }
});

// 3. Deletar transação
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, user_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Transação não encontrada." });
    }

    return res.json({ message: "Transação removida com sucesso." });
  } catch (error) {
    console.error("❌ Erro ao deletar transação:", error);
    return res.status(500).json({
      message: "Erro ao deletar transação.",
      detail: error.message,
    });
  }
});

module.exports = router;
