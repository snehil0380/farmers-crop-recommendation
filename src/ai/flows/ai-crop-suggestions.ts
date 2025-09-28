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
  nitrogen: z.number().describe('The Nitrogen level of the soil.'),
  phosphorus: z.number().describe('The Phosphorus level of the soil.'),
  potassium: z.number().describe('The Potassium level of the soil.'),
  ph: z.number().describe('The pH level of the soil.'),
  temperature: z.number().describe('The temperature in Celsius.'),
  rainfall: z.number().describe('The rainfall in mm.'),
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
    .describe('An estimate of the expected yield for the suggested crops (e.g., "18 quintals/acre").'),
});
export type SuggestCropsOutput = z.infer<typeof SuggestCropsOutputSchema>;

export async function suggestCrops(input: SuggestCropsInput): Promise<SuggestCropsOutput> {
  return suggestCropsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCropsPrompt',
  input: {schema: SuggestCropsInputSchema},
  output: {schema: SuggestCropsOutputSchema},
  prompt: `You are an AI assistant that suggests suitable crops based on soil and climate data.

  Suggest a few crops, provide a yield estimate, and identify the single best crop from the list based on the following data:
  For each crop, provide its name, the best time for it to grow, and a simple two-word description for a placeholder image.

  Nitrogen: {{nitrogen}}
  Phosphorus: {{phosphorus}}
  Potassium: {{potassium}}
  pH: {{ph}}
  Temperature: {{temperature}}°C
  Rainfall: {{rainfall}}mm

  Format the output as a JSON object. The 'crops' field should be an array of objects, each with 'name', 'growthTime', and 'imageDescription'.
  Also include 'bestCrop' and 'yieldEstimate' fields.
  Be concise.
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
