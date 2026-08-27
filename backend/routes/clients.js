const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();
router.use(authenticateToken);

// GET /clients (Filtro por usuário autenticado)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        company_name,
        type,
        contact,
        email,
        phone,
        status,
        user_id,
        created_at
      FROM clients
      WHERE user_id = $1
      ORDER BY id DESC
      `,
      [req.user.id],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("❌ Erro ao listar clientes:", error);
    return res
      .status(500)
      .json({ message: "Erro ao buscar carteira de clientes." });
  }
});

// POST /clients
router.post("/", async (req, res) => {
  try {
    const { company_name, type, contact, email, phone, status } = req.body;
    const normalizedName = company_name?.trim();

    if (!normalizedName) {
      return res
        .status(400)
        .json({ message: "Nome da empresa/cliente é obrigatório." });
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
        normalizedName,
        type || "Pessoa Jurídica",
        contact?.trim() || null,
        email?.toLowerCase().trim() || null,
        phone?.trim() || null,
        status || "active",
        req.user.id,
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erro ao cadastrar cliente:", error);
    return res.status(500).json({ message: "Erro ao cadastrar cliente." });
  }
});

// PATCH /clients/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, type, contact, email, phone, status } = req.body;
    const normalizedName = company_name?.trim();

    if (!normalizedName) {
      return res
        .status(400)
        .json({ message: "Nome da empresa/cliente é obrigatório." });
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
      WHERE id = $7 AND user_id = $8
      RETURNING *
      `,
      [
        normalizedName,
        type || "Pessoa Jurídica",
        contact?.trim() || null,
        email?.toLowerCase().trim() || null,
        phone?.trim() || null,
        status || "active",
        id,
        req.user.id,
      ],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Cliente não localizado ou sem permissão." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erro ao atualizar cliente:", error);
    return res
      .status(500)
      .json({ message: "Erro ao atualizar registro do cliente." });
  }
});

// DELETE /clients/:id (Soft Delete ou Remoção com verificação de FK)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM clients
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cliente não localizado." });
    }

    return res.json({
      message: "Cliente removido com sucesso.",
      client: result.rows[0],
    });
  } catch (error) {
    // Tratamento caso haja transações vinculadas ao cliente
    if (error.code === "23503") {
      // Fallback para soft-delete se houver transações vinculadas
      const softDelete = await pool.query(
        `UPDATE clients SET status = 'inactive' WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id],
      );
      return res.json({
        message:
          "Cliente possui transações atreladas e foi marcado como inativo.",
        client: softDelete.rows[0],
      });
    }

    console.error("❌ Erro ao remover cliente:", error);
    return res.status(500).json({ message: "Erro ao excluir cliente." });
  }
});

module.exports = router;
