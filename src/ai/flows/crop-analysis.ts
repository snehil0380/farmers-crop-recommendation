'use server';

/**
 * @fileOverview AI-driven crop analysis flow.
 *
 * - getCropAnalysis - A function that returns a list of crops and their production months.
 * - CropAnalysisOutput - The return type for the getCropAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropAnalysisOutputSchema = z.object({
  crops: z
    .array(
      z.object({
        name: z.string().describe('The name of the crop.'),
        productionMonths: z
          .string()
          .describe('The months when this crop is typically produced.'),
        imageDescription: z
          .string()
          .describe(
            'A simple two-word description of the crop for a placeholder image search.'
          ),
      })
    )
    .describe('A list of crops with their production months.'),
});
export type CropAnalysisOutput = z.infer<typeof CropAnalysisOutputSchema>;

export async function getCropAnalysis(): Promise<CropAnalysisOutput> {
  return cropAnalysisFlow();
}

const prompt = ai.definePrompt({
  name: 'cropAnalysisPrompt',
  output: {schema: CropAnalysisOutputSchema},
  prompt: `You are an AI assistant that provides information about crops.

  Provide a list of 10 common crops, their typical production months (e.g., "June - August" or "All Year"), and a simple two-word description for a placeholder image for each crop.

  Format the output as a JSON object. The 'crops' field should be an array of objects, each with 'name', 'productionMonths', and 'imageDescription'.
  `,
});

const cropAnalysisFlow = ai.defineFlow(
  {
    name: 'cropAnalysisFlow',
    outputSchema: CropAnalysisOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
