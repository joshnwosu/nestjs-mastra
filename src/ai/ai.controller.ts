import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(
    @Body('prompt') prompt: string,
  ): Promise<{ response: string }> {
    const response = await this.aiService.generateResponse(prompt);
    return { response };
  }
}
