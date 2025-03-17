import { Injectable } from '@nestjs/common';
import { createMastra } from 'src/mastra/mastra.config';

@Injectable()
export class AiService {
  private mastra: ReturnType<typeof createMastra>;

  constructor() {
    this.mastra = createMastra();
  }

  async generateResponse(prompt: string): Promise<string> {
    const agent = this.mastra.getAgent('exampleAgent');
    const response = await agent.generate([{ role: 'user', content: prompt }]);
    return response.text;
  }
}
