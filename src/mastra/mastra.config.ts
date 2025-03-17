import { Mastra, Agent, MastraMemory } from '@mastra/core';
import { google } from '@ai-sdk/google';
import { Memory } from '@mastra/memory';

export function createMastra() {
  const memory = new Memory({});

  const exampleAgent = new Agent({
    name: 'Example Agent',
    instructions: 'You are a helpful assistant powered by Google Gemini.',
    model: google('models/gemini-1.5-flash'),
    // memory
  });

  return new Mastra({
    agents: {
      exampleAgent,
    },
  });
}
