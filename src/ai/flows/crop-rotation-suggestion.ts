'use server';

/**
 * @fileOverview AI-driven crop rotation suggestion flow.
 *
 * - getCropRotationSuggestions - A function that suggests a crop rotation plan.
 * - CropRotationSuggestionOutput - The return type for the getCropRotationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropRotationSuggestionOutputSchema = z.object({
  rotation: z
    .array(
      z.object({
        step: z.number().describe('The step number in the rotation cycle.'),
        cropType: z.string().describe('The type of crop for this step (e.g., Legumes, Root Crops).'),
        benefits: z.string().describe('The benefits of planting this crop type in the rotation.'),
        requirements: z.string().describe('The requirements for growing this crop type (e.g., soil, water).'),
        icon: z.enum(['Corn', 'Bean', 'Carrot', 'Wheat']).describe('An icon name representing the crop type.'),
        examples: z.array(z.string()).describe('Example crops for this type.'),
      })
    )
    .describe('A list of crops in the rotation plan.'),
    overallBenefits: z.string().describe('The overall benefits of practicing crop rotation.'),
});
export type CropRotationSuggestionOutput = z.infer<typeof CropRotationSuggestionOutputSchema>;

export async function getCropRotationSuggestions(): Promise<CropRotationSuggestionOutput> {
  return cropRotationSuggestionFlow();
}

const prompt = ai.definePrompt({
  name: 'cropRotationSuggestionPrompt',
  output: {schema: CropRotationSuggestionOutputSchema},
  prompt: `You are an agricultural expert providing a 4-step crop rotation plan based on the sequence: Corn, Legumes, Root Crops, Cereals.

  For each step in the rotation, provide:
  - The step number (1-4).
  - The crop type.
  - The primary benefit of planting this crop at this stage.
  - The general requirements (soil, water).
  - A suitable icon name from the following list: ['Corn', 'Bean', 'Carrot', 'Wheat'].
  - Two example crops.

  Also provide a summary of the overall benefits of crop rotation.

  The rotation order is:
  1. Corn
  2. Legumes
  3. Root Crops
  4. Cereals

  Keep descriptions concise.
  `,
});

const cropRotationSuggestionFlow = ai.defineFlow(
  {
    name: 'cropRotationSuggestionFlow',
    outputSchema: CropRotationSuggestionOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
