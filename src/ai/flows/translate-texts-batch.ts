'use server';

/**
 * @fileOverview A batch text translation flow.
 *
 * - translateTextsBatch - A function that translates a list of texts to a target language.
 * - TranslateTextsBatchInput - The input type for the translateTextsBatch function.
 * - TranslateTextsBatchOutput - The return type for the translateTextsBatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextsBatchInputSchema = z.object({
  texts: z.array(z.string()).describe('The texts to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French").'),
});
export type TranslateTextsBatchInput = z.infer<typeof TranslateTextsBatchInputSchema>;

const TranslateTextsBatchOutputSchema = z.object({
  translatedTexts: z.record(z.string(), z.string()).describe('A dictionary mapping original texts to their translations.'),
});
export type TranslateTextsBatchOutput = z.infer<typeof TranslateTextsBatchOutputSchema>;


export async function translateTextsBatch(input: TranslateTextsBatchInput): Promise<TranslateTextsBatchOutput> {
  return translateTextsBatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextsBatchPrompt',
  input: {schema: TranslateTextsBatchInputSchema},
  output: {schema: TranslateTextsBatchOutputSchema},
  prompt: `You are an expert translator. Translate the following list of English texts to the language with code '{{targetLanguage}}'.
Provide a JSON object where keys are the original English texts and values are their translations.

Texts to translate:
{{#each texts}}
- "{{this}}"
{{/each}}

If an input text is a short UI label, provide a concise and contextually appropriate translation.
For example, if translating ["Get Suggestions", "Soil Analysis"] to Hindi, the output should be:
{
  "translatedTexts": {
    "Get Suggestions": "सुझाव प्राप्त करें",
    "Soil Analysis": "मृदा विश्लेषण"
  }
}
`,
  model: 'gemini-2.5-flash',
});

const translateTextsBatchFlow = ai.defineFlow(
  {
    name: 'translateTextsBatchFlow',
    inputSchema: TranslateTextsBatchInputSchema,
    outputSchema: TranslateTextsBatchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
