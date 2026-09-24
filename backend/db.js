const { Pool } = require("pg");
require("dotenv").config();

// 1. DEBUG: Vamos ver o que o Node.js está realmente enxergando
const dbUrl = process.env.DATABASE_URL;
console.log(
  "🔍 URL carregada no env:",
  dbUrl ? dbUrl.substring(0, 25) + "..." : "NENHUMA (Undefined)",
);

const pool = new Pool({
  connectionString: dbUrl,
  // Força o SSL absoluto sem nenhuma condicional
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000, // Dá 10 segundos pro Neon "acordar"
});

pool.on("error", (err) => {
  console.error("⚠️ Erro no Pool:", err.message);
});

// Testa a conexão imediatamente
pool
  .query("SELECT 1 AS conectado")
  .then(() => {
    console.log("✅ Neon conectado com sucesso absoluto!");
  })
  .catch((err) => {
    console.error("❌ Erro exato de conexão:", err.message);
  });

module.exports = pool;
