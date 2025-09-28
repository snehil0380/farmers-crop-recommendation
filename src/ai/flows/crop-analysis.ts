'use server';

/**
 * @fileOverview AI-driven crop analysis flow.
 *
 * - getCropAnalysis - A function that returns a list of crops and their production months.
 * - CropAnalysisOutput - The return type for the getCropAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getMarketPrice} from '@/services/market-data-service';

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
        soilPreference: z.string().describe('The preferred soil type for the crop.'),
        waterNeeds: z.string().describe('The water requirements for the crop.'),
        marketPrice: z.string().optional().describe('The current market price of the crop.'),
      })
    )
    .describe('A list of crops with their production months and other data.'),
});
export type CropAnalysisOutput = z.infer<typeof CropAnalysisOutputSchema>;

export async function getCropAnalysis(): Promise<CropAnalysisOutput> {
  return cropAnalysisFlow();
}

const getMarketPriceTool = ai.defineTool(
  {
    name: 'getMarketPrice',
    description: 'Get the market price for a given crop.',
    inputSchema: z.object({cropName: z.string()}),
    outputSchema: z.string(),
  },
  async ({cropName}) => getMarketPrice(cropName)
);

const prompt = ai.definePrompt({
  name: 'cropAnalysisPrompt',
  output: {schema: CropAnalysisOutputSchema},
  tools: [getMarketPriceTool],
  prompt: `You are an AI assistant that provides information about crops.

  Provide a list of 5 common crops with the following details for each:
  - Name
  - Typical production months (e.g., "June - August" or "All Year")
  - A simple two-word description for a placeholder image
  - Soil preference
  - Water needs
  
  For each crop, use the getMarketPrice tool to fetch its market price.

  Format the output as a JSON object. The 'crops' field should be an array of objects, each with 'name', 'productionMonths', 'imageDescription', 'soilPreference', 'waterNeeds', and 'marketPrice'.
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
