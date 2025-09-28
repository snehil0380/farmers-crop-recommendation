'use server';

/**
 * @fileOverview AI-driven crop suggestion flow.
 *
 * - suggestCrops - A function that suggests crops based on soil data.
 * - SuggestCropsInput - The input type for the suggestCrops function.
 * - SuggestCropsOutput - The return type for the suggestCrops function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCropsInputSchema = z.object({
  ph: z.number().describe('The pH level of the soil.'),
  moisture: z.number().describe('The moisture level of the soil.'),
});
export type SuggestCropsInput = z.infer<typeof SuggestCropsInputSchema>;

const SuggestCropsOutputSchema = z.object({
  crops: z
    .array(
      z.object({
        name: z.string().describe('The name of the suggested crop.'),
        growthTime: z.string().describe('The best time or season for this crop to grow.'),
        imageDescription: z.string().describe('A simple two-word description of the crop for a placeholder image search.'),
      })
    )
    .describe('A list of suitable crops for the given soil conditions.'),
  bestCrop: z
    .string()
    .describe('The name of the single best crop from the suggestions.'),
  yieldEstimate: z
    .string()
    .describe('An estimate of the expected yield for the suggested crops.'),
  sustainabilityScore: z
    .number()
    .describe(
      'A score indicating the sustainability of the suggested crops (0-100).' + 
      ' Higher scores indicate more sustainable crops. Score should take into account water usage, pesticide use, and soil impact.'
    ),
});
export type SuggestCropsOutput = z.infer<typeof SuggestCropsOutputSchema>;

export async function suggestCrops(input: SuggestCropsInput): Promise<SuggestCropsOutput> {
  return suggestCropsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCropsPrompt',
  input: {schema: SuggestCropsInputSchema},
  output: {schema: SuggestCropsOutputSchema},
  prompt: `You are an AI assistant that suggests suitable crops based on soil data.

  Suggest a few crops, provide a yield estimate, a sustainability score (0-100), and identify the single best crop from the list based on the following soil data:
  For each crop, provide its name, the best time for it to grow, and a simple two-word description for a placeholder image.

  pH: {{ph}}
  Moisture: {{moisture}}

  Format the output as a JSON object. The 'crops' field should be an array of objects, each with 'name', 'growthTime', and 'imageDescription'.
  Also include 'bestCrop', 'yieldEstimate', and 'sustainabilityScore' fields.
  The sustainability score should be between 0 and 100, taking into account factors such as water usage, pesticide use, and overall environmental impact. Higher scores represent more sustainable options. Be concise.
  `,
});

const suggestCropsFlow = ai.defineFlow(
  {
    name: 'suggestCropsFlow',
    inputSchema: SuggestCropsInputSchema,
    outputSchema: SuggestCropsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
