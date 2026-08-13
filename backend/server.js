const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const clientsRoutes = require("./routes/clients");
const transactionsRoutes = require("./routes/transactions");
const sectorsRoutes = require("./routes/sectors");

const pool = require("./db");

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://finan-plus2.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite Postman e requisições sem Origin
      if (!origin) return callback(null, true);

      // Permite localhost
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Permite qualquer deploy do Vercel deste projeto
      if (/^https:\/\/finan-plus2.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      console.log("Origem bloqueada pelo CORS:", origin);
      return callback(new Error("Origem não permitida pelo CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/clients", clientsRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/sectors", sectorsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API do FinanPlus funcionando!",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "PostgreSQL conectado com sucesso!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Erro no banco:", error);

    res.status(500).json({
      message: "Erro ao conectar com PostgreSQL.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
