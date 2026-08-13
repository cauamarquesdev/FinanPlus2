export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface FinancialData {
  balance: number;
  transactions: Transaction[];
  monthlyExpenses: number;
  monthlyIncome: number;
}