import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { Category, HistoryEntry, Transaction } from './model';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body('prompt') prompt: string): Promise<{ message: string }> {
    const response = await this.aiService.generateResponse(prompt);
    return { message: response };
  }

  @Get('history')
  async getHistory(): Promise<{
    history: HistoryEntry[];
  }> {
    const history = await this.aiService.getConversationHistory();
    return { history };
  }

  @Delete('history')
  async clearHistory(): Promise<{ message: string }> {
    await this.aiService.clearConversationHistory();
    return { message: 'Conversation history cleared' };
  }

  @Get('expenses')
  async getExpenses(): Promise<{ expenses: Transaction[] }> {
    const expenses = await this.aiService.getAllExpenses();
    return { expenses };
  }

  @Get('transactions')
  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    const transactions = await this.aiService.getAllTransactions();
    return { transactions };
  }

  @Delete('transactions')
  async clearTransactions(): Promise<void> {
    await this.aiService.clearTransactions();
  }

  @Get('categories')
  async getCategories(): Promise<{ categories: Category[] }> {
    const categories = await this.aiService.getCategories();
    return { categories };
  }

  @Post('categories')
  async createCategory(
    @Body('name') name: string,
  ): Promise<{ category: Category }> {
    const category = await this.aiService.createCategory(name);
    return { category };
  }
}
