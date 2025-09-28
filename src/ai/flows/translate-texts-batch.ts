'use server';

/**
 * @fileOverview A batch text translation flow using Google Cloud Translation API.
 *
 * - translateTextsBatch - A function that translates a list of texts to a target language.
 * - TranslateTextsBatchInput - The input type for the translateTextsBatch function.
 * - TranslateTextsBatchOutput - The return type for the translateTextsBatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { translateTextsBatch as translateTextsBatchSvc } from '@/services/translation-service';

const TranslateTextsBatchInputSchema = z.object({
  texts: z.array(z.string()).describe('The texts to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "es", "fr", "hi").'),
});
export type TranslateTextsBatchInput = z.infer<typeof TranslateTextsBatchInputSchema>;

const TranslateTextsBatchOutputSchema = z.object({
  translatedTexts: z.record(z.string(), z.string()).describe('A dictionary mapping original texts to their translations.'),
});
export type TranslateTextsBatchOutput = z.infer<typeof TranslateTextsBatchOutputSchema>;

export async function translateTextsBatch(input: TranslateTextsBatchInput): Promise<TranslateTextsBatchOutput> {
  return translateTextsBatchFlow(input);
}

const batchTranslationTool = ai.defineTool(
  {
    name: 'translateTextsBatch',
    description: 'Translates a batch of texts to a target language.',
    inputSchema: TranslateTextsBatchInputSchema,
    outputSchema: z.record(z.string()),
  },
  async ({ texts, targetLanguage }) => {
    return await translateTextsBatchSvc(texts, targetLanguage);
  }
);

const translateTextsBatchFlow = ai.defineFlow(
  {
    name: 'translateTextsBatchFlow',
    inputSchema: TranslateTextsBatchInputSchema,
    outputSchema: TranslateTextsBatchOutputSchema,
  },
  async ({ texts, targetLanguage }) => {
    const translatedTexts = await batchTranslationTool({ texts, targetLanguage });
    return { translatedTexts };
  }
);