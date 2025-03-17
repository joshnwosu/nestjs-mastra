import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { CoreMessage } from '@mastra/core';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body('prompt') prompt: string): Promise<{
    response: string;
    history: CoreMessage[];
  }> {
    if (!prompt || typeof prompt !== 'string') {
      throw new BadRequestException('Prompt is required and must be a string');
    }

    const response = await this.aiService.generateResponse(prompt);
    const history = await this.aiService.getConversationHistory();
    return { response, history };
  }

  @Get('history')
  async getHistory(): Promise<{
    history: CoreMessage[];
  }> {
    const history = await this.aiService.getConversationHistory();
    return { history };
  }

  @Delete('history')
  async clearHistory(): Promise<{ message: string }> {
    await this.aiService.clearConversationHistory();
    return { message: 'Conversation history cleared' };
  }
}
