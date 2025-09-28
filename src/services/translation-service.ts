'use server';

import { z } from 'zod';

const TranslationResponseSchema = z.object({
  data: z.object({
    translations: z.array(
      z.object({
        translatedText: z.string(),
      })
    ),
  }),
});

const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const API_URL = 'https://translation.googleapis.com/language/translate/v2';

if (!API_KEY) {
  console.warn(
    'GOOGLE_CLOUD_API_KEY environment variable is not set. Translation services will not work.'
  );
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
    if (!API_KEY) {
        console.error('GOOGLE_CLOUD_API_KEY is not set.');
        return text;
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        q: text,
        target: targetLanguage,
        format: 'text',
        }),
    });

    if (!response.ok) {
        console.error('Translation API request failed:', response.statusText);
        const errorBody = await response.text();
        console.error('Error body:', errorBody);
        return text; // Fallback to original text
    }

    const result = await response.json();
    const validatedResult = TranslationResponseSchema.safeParse(result);

    if (!validatedResult.success) {
        console.error('Invalid response from Translation API:', validatedResult.error);
        return text;
    }

    return validatedResult.data.data.translations[0]?.translatedText || text;
}

export async function translateTextsBatch(
  texts: string[],
  targetLanguage: string
): Promise<Record<string, string>> {
  if (!API_KEY) {
    console.error('GOOGLE_CLOUD_API_KEY is not set.');
    const result: Record<string, string> = {};
    texts.forEach(text => result[text] = text);
    return result;
  }
  
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: texts,
      target: targetLanguage,
      format: 'text',
    }),
  });

  if (!response.ok) {
    console.error('Batch translation API request failed:', response.statusText);
    const errorBody = await response.text();
    console.error('Error body:', errorBody);
    const fallbackResult: Record<string, string> = {};
    texts.forEach(text => (fallbackResult[text] = text));
    return fallbackResult;
  }

  const result = await response.json();
  const validatedResult = TranslationResponseSchema.safeParse(result);
  
  if (!validatedResult.success) {
    console.error('Invalid response from Translation API:', validatedResult.error);
    const fallbackResult: Record<string, string> = {};
    texts.forEach(text => (fallbackResult[text] = text));
    return fallbackResult;
  }

  const translatedTexts: Record<string, string> = {};
  validatedResult.data.data.translations.forEach((translation, index) => {
    translatedTexts[texts[index]] = translation.translatedText;
  });

  return translatedTexts;
}