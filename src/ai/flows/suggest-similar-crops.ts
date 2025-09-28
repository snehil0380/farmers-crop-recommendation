'use server';

/**
 * @fileOverview AI-driven similar crop suggestion flow.
 *
 * - suggestSimilarCrops - A function that suggests crops similar to a given query.
 * - SuggestSimilarCropsInput - The input type for the suggestSimilarCrops function.
 * - SuggestSimilarCropsOutput - The return type for the suggestSimilarCrops function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarCropsInputSchema = z.object({
  query: z.string().describe('The name of the crop to find alternatives for.'),
});
export type SuggestSimilarCropsInput = z.infer<typeof SuggestSimilarCropsInputSchema>;

const SuggestSimilarCropsOutputSchema = z.object({
  crops: z
    .array(
      z.object({
        name: z.string().describe('The name of the suggested alternative crop.'),
        reason: z.string().describe('A brief reason why this crop is a good alternative.'),
        imageDescription: z.string().describe('A simple two-word description for a placeholder image.'),
      })
    )
    .describe('A list of alternative crops.'),
});
export type SuggestSimilarCropsOutput = z.infer<typeof SuggestSimilarCropsOutputSchema>;


export async function suggestSimilarCrops(input: SuggestSimilarCropsInput): Promise<SuggestSimilarCropsOutput> {
  return suggestSimilarCropsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarCropsPrompt',
  input: {schema: SuggestSimilarCropsInputSchema},
  output: {schema: SuggestSimilarCropsOutputSchema},
  prompt: `You are an agricultural expert. A user wants to find alternative crops to "{{query}}".
  
Suggest 2-3 alternative crops that have similar growing requirements, market value, or rotational benefits.
For each suggestion, provide:
- The crop name.
- A brief, one-sentence reason why it's a good alternative.
- A simple two-word description for a placeholder image.

Example for "Tomatoes":
{
  "crops": [
    {
      "name": "Peppers",
      "reason": "Peppers have similar warmth and soil requirements to tomatoes and can be a profitable alternative.",
      "imageDescription": "Colorful peppers"
    },
    {
      "name": "Eggplant",
      "reason": "Eggplant belongs to the same family as tomatoes and thrives in similar hot weather conditions.",
      "imageDescription": "Purple eggplant"
    }
  ]
}

Provide the response as a valid JSON object.
`,
});

const suggestSimilarCropsFlow = ai.defineFlow(
  {
    name: 'suggestSimilarCropsFlow',
    inputSchema: SuggestSimilarCropsInputSchema,
    outputSchema: SuggestSimilarCropsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
