const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("❌ Configuração ausente: JWT_SECRET não definido no .env");
      return res.status(500).json({
        message: "Erro interno de configuração de segurança.",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Acesso não autorizado: Token de autenticação não fornecido.",
      });
    }

    const parts = authHeader.trim().split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message:
          "Acesso não autorizado: Formato de credencial inválido (esperado: Bearer <token>).",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    // Valida se o payload decodificado possui estrutura esperada
    if (!decoded || (!decoded.id && !decoded.userId)) {
      return res.status(401).json({
        message: "Token inválido ou sem identificador de usuário.",
      });
    }

    // Normaliza req.user garantindo compatibilidade
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      name: decoded.name,
      ...decoded,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Sessão expirada. Faça login novamente.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      message: "Token de autenticação inválido ou corrompido.",
      code: "INVALID_TOKEN",
    });
  }
};

module.exports = authenticateToken;
