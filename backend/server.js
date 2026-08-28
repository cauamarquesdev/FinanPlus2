const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

// Importação das rotas
const authRoutes = require("./routes/auth");
const clientsRoutes = require("./routes/clients");
const transactionsRoutes = require("./routes/transactions");
const sectorsRoutes = require("./routes/sectors");
const aiRoutes = require("./routes/ai");
const chatRoutes = require("./routes/chat");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://finan-plus2.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: mobile, curl, Postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/finan-plus2.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      console.warn("⚠️ Origem bloqueada pela política CORS:", origin);
      return callback(new Error("Origem não autorizada pela política CORS."));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

// Mapeamento de Rotas
app.use("/auth", authRoutes);
app.use("/clients", clientsRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/sectors", sectorsRoutes);
app.use("/ai", aiRoutes);
app.use("/chat", chatRoutes);

// Health Check do Sistema
app.get("/health", async (req, res) => {
  try {
    const dbResult = await pool.query("SELECT NOW() as db_time");
    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      db_time: dbResult.rows[0].db_time,
      uptime: process.uptime(),
    });
  } catch (err) {
    return res.status(503).json({
      status: "unhealthy",
      error: "Falha na comunicação com o banco de dados.",
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    name: "FinanPlus Enterprise API",
    status: "active",
    version: "2.0.0",
  });
});

// Middleware para tratamento de rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    message: `Rota ${req.method} ${req.url} não encontrada no servidor.`,
  });
});

// Middleware Global de Tratamento de Erros (500)
app.use((err, req, res, next) => {
  console.error("❌ Erro não capturado na requisição:", err);
  res.status(500).json({
    message: "Ocorreu um erro interno no processamento da solicitação.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 FinanPlus API ativa na porta ${PORT}`);
});

// Encerramento suave (Graceful Shutdown)
const gracefulShutdown = (signal) => {
  console.log(
    `\n🛑 Sinal ${signal} recebido. Encerrando conexões de forma segura...`,
  );
  server.close(async () => {
    console.log("🔒 Servidor HTTP finalizado.");
    try {
      await pool.end();
      console.log("🔌 Conexões do PostgreSQL encerradas com sucesso.");
      process.exit(0);
    } catch (err) {
      console.error("❌ Erro ao desconectar pool do PostgreSQL:", err);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
