import { Mastra, Agent } from '@mastra/core';
import { google } from '@ai-sdk/google';

export function createMastra() {
  const exampleAgent = new Agent({
    name: 'Example Agent',
    instructions: 'You are a helpful assistant powered by Google Gemini.',
    model: google('models/gemini-1.5-flash'),
  });

  return new Mastra({
    agents: {
      exampleAgent,
    },
  });
}
