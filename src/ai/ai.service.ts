import { Injectable } from '@nestjs/common';
import { createMastra } from 'src/mastra/mastra.config';
import { CoreMessage } from '@mastra/core';

@Injectable()
export class AiService {
  private mastra: ReturnType<typeof createMastra>;
  private conversationHistory: CoreMessage[] = []; // Store history in memory

  constructor() {
    this.mastra = createMastra();
  }

  async generateResponse(prompt: string): Promise<string> {
    const agent = this.mastra.getAgent('exampleAgent');
    // Add the user's prompt to the history
    this.conversationHistory.push({ role: 'user', content: prompt });

    // Generate a response with the full history
    const response = await agent.generate(this.conversationHistory);

    // Add the assistant's response to the history
    this.conversationHistory.push({
      role: 'assistant',
      content: response.text,
    });

    // Optional: Limit history to prevent memory growth
    const maxMessages = 20; // Keep last 20 messages (10 user + 10 assistant)
    if (this.conversationHistory.length > maxMessages) {
      this.conversationHistory = this.conversationHistory.slice(-maxMessages);
    }
    return response.text;
  }

  async getConversationHistory(): Promise<CoreMessage[]> {
    return this.conversationHistory;
  }

  async clearConversationHistory(): Promise<void> {
    this.conversationHistory = [];
  }
}
