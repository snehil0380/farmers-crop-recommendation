'use server';

/**
 * @fileOverview A simple text translation flow.
 *
 * - translateText - A function that translates text to a target language.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are an expert translator. Translate the following text to {{targetLanguage}}.
  
Text: """{{text}}"""

Respond only with the translated text in a JSON object with a single key "translatedText".
If the input text is a short UI label, provide a concise and contextually appropriate translation.
For example, if translating "Get Suggestions" to Hindi, the output must be:
{
  "translatedText": "सुझाव प्राप्त करें"
}
`,
  model: 'googleai/gemini-1.5-flash',
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
