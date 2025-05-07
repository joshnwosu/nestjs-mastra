import { Injectable } from '@nestjs/common';
import { createMastra } from 'src/mastra/mastra.config';
import { CoreMessage } from '@mastra/core';
import { HistoryEntry, Category, Transaction } from './model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AiService {
  private mastra: ReturnType<typeof createMastra>;
  private history: HistoryEntry[] = [];
  private transactions: Transaction[] = [];
  private categories: Category[] = [
    { id: 1, name: 'Groceries' },
    { id: 2, name: 'Transport' },
    { id: 3, name: 'Entertainment' },
    { id: 4, name: 'Utilities' },
    { id: 5, name: 'Healthcare' },
    { id: 6, name: 'Dining' },
    { id: 7, name: 'Shopping' },
    { id: 8, name: 'Education' },
    { id: 9, name: 'Travel' },
    { id: 10, name: 'Rent' },
    { id: 11, name: 'Investment' },
    { id: 12, name: 'Others' },
  ];

  private nextCategoryId = 15;

  constructor() {
    this.mastra = createMastra();
  }

  async generateResponse(prompt: string): Promise<string> {
    const agent = this.mastra.getAgent('exampleAgent');

    // Convert history entries to CoreMessage format for the agent
    const coreMessages: CoreMessage[] = [
      ...this.history.flatMap((entry: HistoryEntry): CoreMessage[] => [
        { role: 'user', content: entry.prompt },
        { role: 'assistant', content: entry.response },
      ]),
      { role: 'user', content: prompt },
    ];

    // Generate a response with the full history
    const response = await agent.generate(coreMessages);

    // Check if the response indicates a request to list transactions
    if (response.text.trim() === 'LIST_TRANSACTIONS') {
      const responseText =
        this.transactions.length > 0
          ? JSON.stringify(this.transactions, null, 2)
          : 'No transactions recorded yet.';

      const entry: HistoryEntry = {
        id: uuidv4(),
        prompt,
        response: responseText,
        timestamp: new Date().toISOString(),
      };

      this.history.push(entry);
      const maxEntries = 10;
      if (this.history.length > maxEntries) {
        this.history = this.history.slice(-maxEntries);
      }

      return responseText;
    }

    // Handle transaction logging
    const transactionMap: Record<
      string,
      {
        amount: number;
        items: string[];
        category: Category;
        type: 'expense' | 'income';
      }
    > = {};
    const transactionMatches = response.text
      .split(';')
      .map((part) =>
        part
          .trim()
          .match(/I have logged \$([\d.]+) for ([\w\s]+)\s*\((\w+):(\w+)\)/),
      );

    for (const match of transactionMatches) {
      if (match) {
        const amount = parseFloat(match[1]);
        const item = match[2].trim();
        const type = match[3].toLowerCase() as 'expense' | 'income';
        const categoryName = match[4];
        // Find the category, fallback to 'Others' if not found
        const category =
          this.categories.find(
            (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
          ) || this.categories.find((c) => c.name === 'Others')!;

        // Aggregate by category and type
        const key = `${type}:${category.name}`;
        if (transactionMap[key]) {
          transactionMap[key].amount += amount;
          transactionMap[key].items.push(item);
        } else {
          transactionMap[key] = { amount, items: [item], category, type };
        }
      }
    }

    // Create Transaction objects from aggregated map
    const transactions: Transaction[] = Object.values(transactionMap).map(
      ({ amount, items, category, type }) => ({
        id: uuidv4(),
        type,
        amount: amount.toFixed(2),
        // Use full prompt for same-category transactions or multi-item single amount
        description:
          items.length > 1 || items[0].includes('and')
            ? prompt
            : `${items[0]} $${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`,
        category,
        date: new Date().toISOString(),
      }),
    );

    // Fallback for prompts that indicate a transaction but AI didn't categorize
    if (transactions.length === 0) {
      const lowerPrompt = prompt.toLowerCase();
      let type: 'expense' | 'income' = 'expense';
      if (
        lowerPrompt.includes('earned') ||
        lowerPrompt.includes('received') ||
        lowerPrompt.includes('got')
      ) {
        type = 'income';
      } else if (!lowerPrompt.match(/\$[\d.]+/)) {
        // No dollar amount, treat as non-transaction
        const responseText = response.text;
        const entry: HistoryEntry = {
          id: uuidv4(),
          prompt,
          response: responseText,
          timestamp: new Date().toISOString(),
        };
        this.history.push(entry);
        const maxEntries = 10;
        if (this.history.length > maxEntries) {
          this.history = this.history.slice(-maxEntries);
        }
        return responseText;
      }

      const amountMatches = prompt.match(/\$([\d.]+)/g) || [];
      const defaultCategory = this.categories.find((c) => c.name === 'Others')!;

      // Aggregate amounts for the default category
      let totalAmount = 0;
      for (const amountMatch of amountMatches) {
        const amount = parseFloat(amountMatch.replace('$', ''));
        totalAmount += amount;
      }

      if (totalAmount > 0) {
        transactions.push({
          id: uuidv4(),
          type,
          amount: totalAmount.toFixed(2),
          description: prompt,
          category: defaultCategory,
          date: new Date().toISOString(),
        });
      }
    }

    // Add all transactions to the array
    this.transactions.push(...transactions);

    // Generate response text based on consolidated transactions
    const responseText =
      transactions.length > 0
        ? transactions
            .map((t) => `I have logged $${t.amount} for ${t.category.name}`)
            .join(';')
        : response.text;

    const entry: HistoryEntry = {
      id: uuidv4(),
      prompt,
      response: responseText,
      timestamp: new Date().toISOString(),
    };

    this.history.push(entry);
    const maxEntries = 10;
    if (this.history.length > maxEntries) {
      this.history = this.history.slice(-maxEntries);
    }

    return responseText;
  }

  async getConversationHistory(): Promise<HistoryEntry[]> {
    return this.history;
  }

  async clearConversationHistory(): Promise<void> {
    this.history = [];
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactions;
  }

  async getAllExpenses(): Promise<Transaction[]> {
    return this.transactions.filter((t) => t.type === 'expense');
  }

  async clearTransactions(): Promise<void> {
    this.transactions = [];
  }

  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async createCategory(name: string): Promise<Category> {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Category name must be a non-empty string');
    }
    const normalizedName = name.trim();
    if (
      this.categories.some(
        (c) => c.name.toLowerCase() === normalizedName.toLowerCase(),
      )
    ) {
      throw new Error(`Category "${normalizedName}" already exists`);
    }

    const category: Category = {
      id: this.nextCategoryId++,
      name: normalizedName,
    };
    this.categories.push(category);
    return category;
  }
}
