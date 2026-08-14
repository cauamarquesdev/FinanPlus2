const express = require("express");
const pool = require("../db");

const router = express.Router();
const authenticateToken = require("../middleware/auth");
router.use(authenticateToken);

// GET - buscar apenas clientes ativos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM clients
      WHERE status = 'active'
        AND user_id = $1
      ORDER BY id DESC
      `,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);

    res.status(500).json({
      message: "Erro ao buscar clientes.",
    });
  }
});

// POST - cadastrar cliente
router.post("/", async (req, res) => {
  try {
    const { company_name, type, contact, email, phone, status } = req.body;

    if (!company_name) {
      return res.status(400).json({
        message: "Nome da empresa é obrigatório.",
      });
    }

    const result = await pool.query(
      `
  INSERT INTO clients (
    company_name,
    type,
    contact,
    email,
    phone,
    status,
    user_id
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
  `,
      [
        company_name,
        type,
        contact,
        email,
        phone,
        status || "active",
        req.user.id,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);

    res.status(500).json({
      message: "Erro ao cadastrar cliente.",
    });
  }
});

// PATCH - editar cliente
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { company_name, type, contact, email, phone, status } = req.body;

    if (!company_name) {
      return res.status(400).json({
        message: "Nome da empresa é obrigatório.",
      });
    }

    const result = await pool.query(
      `
      UPDATE clients
      SET
        company_name = $1,
        type = $2,
        contact = $3,
        email = $4,
        phone = $5,
        status = $6
      WHERE id = $7
        AND user_id = $8
      RETURNING *
      `,
      [company_name, type, contact, email, phone, status, id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Cliente não encontrado.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);

    res.status(500).json({
      message: "Erro ao atualizar cliente.",
    });
  }
});

// DELETE - remover cliente da lista sem apagar transações
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE clients
      SET status = 'inactive'
      WHERE id = $1
        AND user_id = $2
      RETURNING *
      `,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Cliente não encontrado.",
      });
    }

    res.json({
      message: "Cliente removido com sucesso.",
      client: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao remover cliente:", error);

    res.status(500).json({
      message: "Erro ao remover cliente.",
    });
  }
});

module.exports = router;
