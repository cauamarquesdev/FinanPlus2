import React, { useMemo } from "react";
import { Transaction } from "../types";

interface DREProps {
  transactions: Transaction[];
}

const IncomeStatementDRE: React.FC<DREProps> = ({ transactions }) => {
  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  const dre = useMemo(() => {
    const grossRevenue = transactions
      .filter((t) => String(t.type).toLowerCase() === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const directCosts = transactions
      .filter(
        (t) =>
          String(t.type).toLowerCase() === "expense" &&
          (t.sector_name?.toLowerCase().includes("infra") ||
            t.sector_name?.toLowerCase().includes("serviço")),
      )
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const grossProfit = grossRevenue - directCosts;

    const opex = transactions
      .filter(
        (t) =>
          String(t.type).toLowerCase() === "expense" &&
          !(
            t.sector_name?.toLowerCase().includes("infra") ||
            t.sector_name?.toLowerCase().includes("serviço")
          ),
      )
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const ebitda = grossProfit - opex;
    const taxes = grossRevenue * 0.06;
    const netIncome = ebitda - taxes;

    return {
      grossRevenue,
      directCosts,
      grossProfit,
      opex,
      ebitda,
      taxes,
      netIncome,
    };
  }, [transactions]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Demonstrativo do Resultado do Exercício (DRE Gerencial)
        </h3>
        <p className="text-xs text-slate-500">
          Estruturação contábil auditada para reporte financeiro
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="px-5 py-3">Linha Contábil / Estrutura</th>
              <th className="px-5 py-3 text-right">Montante (R$)</th>
              <th className="px-5 py-3 text-right">% Receita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            <tr className="bg-slate-50 font-bold text-slate-900">
              <td className="px-5 py-2.5 font-sans">
                (+) Receita Operacional Bruta (ROB)
              </td>
              <td className="px-5 py-2.5 text-right text-emerald-700">
                {formatBRL(dre.grossRevenue)}
              </td>
              <td className="px-5 py-2.5 text-right">100.0%</td>
            </tr>
            <tr className="text-slate-600">
              <td className="px-5 py-2.5 font-sans pl-8">
                (-) Custos Diretos & Infraestrutura (CPV)
              </td>
              <td className="px-5 py-2.5 text-right text-rose-700">
                -{formatBRL(dre.directCosts)}
              </td>
              <td className="px-5 py-2.5 text-right">
                {dre.grossRevenue > 0
                  ? ((dre.directCosts / dre.grossRevenue) * 100).toFixed(1)
                  : 0}
                %
              </td>
            </tr>
            <tr className="bg-slate-100/60 font-semibold text-slate-900">
              <td className="px-5 py-2.5 font-sans">
                (=) Lucro Bruto / Margem de Contribuição
              </td>
              <td className="px-5 py-2.5 text-right">
                {formatBRL(dre.grossProfit)}
              </td>
              <td className="px-5 py-2.5 text-right">
                {dre.grossRevenue > 0
                  ? ((dre.grossProfit / dre.grossRevenue) * 100).toFixed(1)
                  : 0}
                %
              </td>
            </tr>
            <tr className="text-slate-600">
              <td className="px-5 py-2.5 font-sans pl-8">
                (-) Despesas Operacionais & Administrativas (OPEX)
              </td>
              <td className="px-5 py-2.5 text-right text-rose-700">
                -{formatBRL(dre.opex)}
              </td>
              <td className="px-5 py-2.5 text-right">
                {dre.grossRevenue > 0
                  ? ((dre.opex / dre.grossRevenue) * 100).toFixed(1)
                  : 0}
                %
              </td>
            </tr>
            <tr className="bg-slate-100/60 font-semibold text-slate-900">
              <td className="px-5 py-2.5 font-sans">
                (=) EBITDA Operacional (LAJIDA)
              </td>
              <td
                className={`px-5 py-2.5 text-right ${dre.ebitda >= 0 ? "text-emerald-700" : "text-rose-700"}`}
              >
                {formatBRL(dre.ebitda)}
              </td>
              <td className="px-5 py-2.5 text-right">
                {dre.grossRevenue > 0
                  ? ((dre.ebitda / dre.grossRevenue) * 100).toFixed(1)
                  : 0}
                %
              </td>
            </tr>
            <tr className="text-slate-600">
              <td className="px-5 py-2.5 font-sans pl-8">
                (-) Provisão Tributária Estimada (6%)
              </td>
              <td className="px-5 py-2.5 text-right text-rose-700">
                -{formatBRL(dre.taxes)}
              </td>
              <td className="px-5 py-2.5 text-right">6.0%</td>
            </tr>
            <tr className="bg-slate-900 font-bold text-white text-sm">
              <td className="px-5 py-3 font-sans">
                (=) Resultado Líquido do Exercício
              </td>
              <td
                className={`px-5 py-3 text-right ${dre.netIncome >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {formatBRL(dre.netIncome)}
              </td>
              <td className="px-5 py-3 text-right text-xs font-normal">
                {dre.grossRevenue > 0
                  ? ((dre.netIncome / dre.grossRevenue) * 100).toFixed(1)
                  : 0}
                %
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeStatementDRE;
