'use server';

/**
 * @fileOverview A simple text translation flow using Google Cloud Translation API.
 *
 * - translateText - A function that translates text to a target language.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { translateText as translateTextSvc } from '@/services/translation-service';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "es", "fr", "hi").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translationTool = ai.defineTool(
  {
    name: 'translateText',
    description: 'Translates text to a target language.',
    inputSchema: TranslateTextInputSchema,
    outputSchema: z.string(),
  },
  async ({ text, targetLanguage }) => {
    return await translateTextSvc(text, targetLanguage);
  }
);

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async ({ text, targetLanguage }) => {
    const translatedText = await translationTool({ text, targetLanguage });
    return { translatedText };
  }
);