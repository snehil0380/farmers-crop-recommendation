'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './use-language';
import { getTranslation } from '@/app/actions';

const translationsCache: Record<string, Record<string, string>> = {};

export function useTranslation() {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>(
    translationsCache[language] || {}
  );

  const t = useCallback(
    (text: string | undefined): string => {
      if (!text) return '';
      if (language === 'en') {
        return text;
      }
      return translations[text] || text;
    },
    [language, translations]
  );

  const translateText = useCallback(
    async (text: string) => {
      if (language === 'en' || !text) {
        return text;
      }
      if (translationsCache[language] && translationsCache[language][text]) {
        return translationsCache[language][text];
      }

      try {
        const { data, error } = await getTranslation({ text, targetLanguage: language });
        if (error || !data) {
          console.error('Translation error:', error);
          return text; // Fallback to original text
        }

        const translated = data.translatedText;

        if (!translationsCache[language]) {
          translationsCache[language] = {};
        }
        translationsCache[language][text] = translated;
        
        setTranslations(prev => ({ ...prev, [text]: translated }));
        return translated;
      } catch (e) {
        console.error('Translation failed:', e);
        return text; // Fallback
      }
    },
    [language]
  );

  return { t, translateText, language };
}
