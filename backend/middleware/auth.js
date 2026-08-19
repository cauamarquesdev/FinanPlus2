const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET não configurado.");
      return res.status(500).json({
        message: "Erro interno de configuração do servidor.",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token não informado.",
      });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Formato de token inválido.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Erro na autenticação:", error.message);

    return res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
};

module.exports = authenticateToken;
