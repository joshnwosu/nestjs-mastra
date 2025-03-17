import { Mastra, Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';

// Step 1: Create the agent using the Agent class
export const exampleAgent = new Agent({
  name: 'Example Agent',
  instructions: 'You are a helpful assistant powered by OpenAI.',
  model: openai('gpt-4o-mini'),
});

// Step 2: Register the agent with Mastra
export const mastra = new Mastra({
  agents: {
    exampleAgent, // Pass the instantiated agent, not a plain object
  },
});
