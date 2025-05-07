export interface Category {
  id: number;
  name: string;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: string;
  description: string;
  category: Category;
  date: string;
}

export interface HistoryEntry {
  id: string;
  prompt: string;
  response: string;
  timestamp: string; // ISO string for timestamp
}

// Keep CoreMessage as is, assuming it's imported from @mastra/core
export { CoreMessage } from '@mastra/core';
