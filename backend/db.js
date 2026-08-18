const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

console.log("DATABASE_URL configurada:", !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .query("SELECT current_database(), current_user, inet_server_addr()")
  .then((result) => {
    console.log("Banco conectado:", result.rows[0]);
  })
  .catch((error) => {
    console.error("Erro ao identificar banco:", error);
  });

module.exports = pool;

// Isso administra as conexões com o banco de dados PostgreSQL, usando as variáveis de ambiente definidas no arquivo .env.
