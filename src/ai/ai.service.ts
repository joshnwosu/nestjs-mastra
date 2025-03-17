import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mastra } from 'src/mastra/mastra.config';

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {
    // Optional: Log the API key to verify it's loaded (for debugging)
    console.log(
      'OpenAI API Key:',
      this.configService.get<string>('OPENAI_API_KEY'),
    );
  }

  async generateResponse(prompt: string): Promise<string> {
    const agent = mastra.getAgent('exampleAgent');
    const response = await agent.generate([{ role: 'user', content: prompt }]);
    return response.text;
  }
}
