const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET não configurado no servidor.",
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
    console.error("Erro na autenticação:", error);

    return res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
};

module.exports = authenticateToken;
