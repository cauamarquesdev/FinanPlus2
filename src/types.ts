export interface Transaction {
  id: number | string;
  client_id?: number | null;
  client_name?: string | null;
  sector_id?: number | null;
  sector_name?: string | null;
  type: "income" | "expense";
  payer?: "client" | "user" | null;
  description: string | null;
  amount: string | number;
  transaction_date?: string;
  created_at?: string;
  category?: string;
  status?: "completed" | "pending";
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Client {
  id: number;
  company_name: string;
  type: string;
  email: string;
  phone: string;
  contact: string;
  status: string;
}

export interface Sector {
  id: number;
  name: string;
}

export interface AIInsight {
  title: string;
  description: string;
  type: "positive" | "negative" | "warning" | "neutral";
}

export interface ChartData {
  name: string;
  income: number;
  expenses: number;
}

export interface ExtractedBankItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  suggestedSector: string;
  matchedTransactionId?: string | number;
  status: "matched" | "unmatched";
}
