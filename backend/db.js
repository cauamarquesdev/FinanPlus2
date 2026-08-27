const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const isProduction =
  process.env.NODE_ENV === "production" ||
  !process.env.DATABASE_URL?.includes("localhost");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
  max: 20, // Limite máximo de clientes simultâneos no pool
  idleTimeoutMillis: 30000, // Encerra clientes ociosos após 30s
  connectionTimeoutMillis: 5000, // Timeout de 5s ao tentar conectar
});

pool.on("error", (err) => {
  console.error(
    "⚠️ Erro inesperado em cliente ocioso do PostgreSQL:",
    err.message,
  );
});

// Verificação não bloqueante de inicialização
pool
  .query("SELECT current_database(), current_user")
  .then((res) => {
    console.log("✅ PostgreSQL Conectado com sucesso:", res.rows[0]);
  })
  .catch((err) => {
    console.error("❌ Falha crítica ao conectar no PostgreSQL:", err.message);
  });

module.exports = pool;
