const express = require("express");
const router = express.Router();

const quotesCache = {};

router.get("/quote/:ticker", async (req, res) => {
  try {
    const rawTicker = (req.params.ticker || "").toUpperCase().trim();
    if (!rawTicker) {
      return res.status(400).json({ message: "Ticker não informado." });
    }

    const now = Date.now();
    if (
      quotesCache[rawTicker] &&
      now - quotesCache[rawTicker].time < 60 * 1000
    ) {
      return res.json(quotesCache[rawTicker].data);
    }

    const yahooSymbol = rawTicker.endsWith(".SA")
      ? rawTicker
      : `${rawTicker}.SA`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;

    // No backend, o fetch não tem restrição de CORS
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;

      if (meta && typeof meta.regularMarketPrice === "number") {
        const currentPrice = meta.regularMarketPrice;
        const prev =
          meta.chartPreviousClose || meta.previousClose || currentPrice;
        const change = currentPrice - prev;
        const changePercent = prev > 0 ? (change / prev) * 100 : 0;

        const payload = {
          symbol: rawTicker,
          shortName: meta.shortName || meta.symbol || rawTicker,
          regularMarketPrice: Number(currentPrice.toFixed(2)),
          regularMarketChange: Number(change.toFixed(2)),
          regularMarketChangePercent: Number(changePercent.toFixed(2)),
          updatedAt: new Date().toISOString(),
        };

        quotesCache[rawTicker] = { time: now, data: payload };
        return res.json(payload);
      }
    }

    return res.status(404).json({ message: "Ativo não encontrado." });
  } catch (error) {
    console.error("Erro na rota de cotações B3:", error.message);
    return res
      .status(500)
      .json({ message: "Erro ao consultar mercado financeiro." });
  }
});

module.exports = router;
