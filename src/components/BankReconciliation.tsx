import React, { useState } from "react";
import { Upload, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Transaction, ExtractedBankItem } from "../types";

interface BankReconciliationProps {
  existingTransactions: Transaction[];
  onBatchConfirm: (items: ExtractedBankItem[]) => Promise<void> | void;
}

const BankReconciliation: React.FC<BankReconciliationProps> = ({
  existingTransactions,
  onBatchConfirm,
}) => {
  const [bankItems, setBankItems] = useState<ExtractedBankItem[]>([]);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorizeDescription = (desc: string): string => {
    const d = desc.toLowerCase();
    if (
      d.includes("aws") ||
      d.includes("google") ||
      d.includes("cloud") ||
      d.includes("tech") ||
      d.includes("servidor") ||
      d.includes("internet") ||
      d.includes("telefonia")
    )
      return "Infraestrutura & TI";
    if (
      d.includes("salario") ||
      d.includes("folha") ||
      d.includes("rescisao") ||
      d.includes("adiantamento")
    )
      return "Pessoal & RH";
    if (
      d.includes("aluguel") ||
      d.includes("condominio") ||
      d.includes("iptu") ||
      d.includes("energia") ||
      d.includes("luz")
    )
      return "Instalações";
    if (
      d.includes("imposto") ||
      d.includes("taxa") ||
      d.includes("darf") ||
      d.includes("contabilidade") ||
      d.includes("material")
    )
      return "Administrativo & Fiscal";
    if (
      d.includes("cliente") ||
      d.includes("pix recebido") ||
      d.includes("fatura") ||
      d.includes("venda") ||
      d.includes("recebimento") ||
      d.includes("ted-")
    )
      return "Receita Operacional";
    return "Geral";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const parsed: ExtractedBankItem[] = [];
      const lines = content.split(/\r\n|\n/);

      let colIndexDate = 0;
      let colIndexDesc = 1;
      let colIndexType = -1;
      let colIndexVal = -1;

      // 1. Identifica os cabeçalhos dinamicamente
      if (lines.length > 0) {
        const headerLine = lines[0].replace(/["']/g, "").toLowerCase();
        const separator = headerLine.includes(";") ? ";" : ",";
        const headers = headerLine.split(separator).map((h) => h.trim());

        headers.forEach((h, idx) => {
          if (h.includes("data")) colIndexDate = idx;
          if (
            h.includes("descri") ||
            h.includes("historico") ||
            h.includes("memo")
          )
            colIndexDesc = idx;
          if (h.includes("tipo") || h.includes("natureza")) colIndexType = idx;
          if (
            h === "valor" ||
            h.includes("valor") ||
            h.includes("montante") ||
            h.includes("quantia")
          ) {
            if (!h.includes("saldo")) colIndexVal = idx;
          }
        });

        // Se não achou a coluna de valor pelo nome, tenta a penúltima ou índice 2
        if (colIndexVal === -1) {
          colIndexVal = headers.length >= 5 ? 4 : 2;
        }
      }

      // 2. Processa cada linha de dados
      lines.forEach((line, idx) => {
        const cleanLine = line.trim();
        if (!cleanLine || idx === 0) return;

        const separator = cleanLine.includes(";") ? ";" : ",";
        const cols = cleanLine
          .split(separator)
          .map((c) => c.replace(/["']/g, "").trim());

        if (cols.length > Math.max(colIndexDate, colIndexDesc, colIndexVal)) {
          const rawDate = cols[colIndexDate] || "";
          const desc = cols[colIndexDesc] || "Lançamento Bancário";

          // Ignora lançamentos de abertura ou conferência de saldo
          if (
            desc.toLowerCase().includes("saldo inicial") ||
            desc.toLowerCase().includes("saldo final")
          ) {
            return;
          }

          const rawTypeStr =
            colIndexType !== -1 ? (cols[colIndexType] || "").toUpperCase() : "";
          const rawAmountStr =
            cols[colIndexVal]
              ?.replace(/["'R$\s]/g, "")
              .replace(/\.(?=\d{3})/g, "")
              .replace(",", ".") || "0";
          const rawNum = parseFloat(rawAmountStr);

          if (!isNaN(rawNum) && rawNum !== 0) {
            let type: "income" | "expense" = "income";

            // Critério de identificação: coluna Tipo (DEBITO/CREDITO) ou sinal negativo
            if (
              rawTypeStr.includes("DEBIT") ||
              rawTypeStr.includes("DEB") ||
              rawTypeStr.includes("DESPESA") ||
              rawNum < 0
            ) {
              type = "expense";
            } else if (
              rawTypeStr.includes("CREDIT") ||
              rawTypeStr.includes("CRED") ||
              rawTypeStr.includes("RECEITA") ||
              rawNum > 0
            ) {
              type = "income";
            }

            const absVal = Math.abs(rawNum);

            const match = existingTransactions.find(
              (t) =>
                Math.abs(Number(t.amount)) === absVal &&
                String(t.type).toLowerCase() === type,
            );

            parsed.push({
              id: `ext-${Date.now()}-${idx}`,
              date: rawDate,
              description: desc,
              amount: absVal,
              type,
              suggestedSector: categorizeDescription(desc),
              matchedTransactionId: match?.id,
              status: match ? "matched" : "unmatched",
            });
          }
        }
      });

      console.log("✅ Itens extraídos com sucesso do CSV:", parsed);
      setBankItems(parsed);
    };

    reader.readAsText(file);
  };

  const handleConfirm = async () => {
    if (bankItems.length === 0) return;
    setIsSubmitting(true);
    try {
      await onBatchConfirm(bankItems);
      setBankItems([]);
      setFileName("");
    } catch (err) {
      console.error("Falha na submissão de conciliação:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchedCount = bankItems.filter((i) => i.status === "matched").length;
  const pendingCount = bankItems.length - matchedCount;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Conciliação Bancária Automatizada (OFX / CSV)
          </h3>
          <p className="text-xs text-slate-500">
            Cruze o extrato oficial da conta corrente com lançamentos internos
          </p>
        </div>

        {bankItems.length > 0 && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting && <RefreshCw size={12} className="animate-spin" />}
            {isSubmitting
              ? "Gravando no Banco..."
              : `Confirmar e Lançar (${bankItems.length} itens)`}
          </button>
        )}
      </div>

      {bankItems.length === 0 ? (
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl cursor-pointer bg-slate-50/50 transition">
          <Upload className="h-8 w-8 text-slate-400 mb-2" />
          <span className="text-xs font-semibold text-slate-700">
            Subir extrato bancário (.CSV ou .OFX)
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Compatível com layouts bancários padrão (Data, Histórico, Tipo,
            Valor)
          </span>
          <input
            type="file"
            accept=".csv,.ofx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-slate-600">
              Arquivo: <strong className="text-slate-900">{fileName}</strong>
            </span>
            <span className="text-emerald-700">
              Já Conciliados: <strong>{matchedCount}</strong>
            </span>
            <span className="text-amber-700">
              Novos Lançamentos: <strong>{pendingCount}</strong>
            </span>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="px-4 py-2.5">Data Extrato</th>
                  <th className="px-4 py-2.5">Histórico Bancário</th>
                  <th className="px-4 py-2.5">Centro Sugerido</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bankItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-mono text-slate-500">
                      {item.date}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 font-medium text-slate-700">
                        {item.suggestedSector}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {item.status === "matched" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle2 size={13} /> Já Cadastrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                          <AlertCircle size={13} /> Novo Lançamento
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-mono font-semibold ${item.type === "income" ? "text-emerald-700" : "text-slate-900"}`}
                    >
                      {item.type === "income" ? "+" : "-"} R${" "}
                      {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankReconciliation;
