'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from './use-language';
import { getTranslation, getTranslationsBatch } from '@/app/actions';

const translationsCache: Record<string, Record<string, string>> = {};

export function useTranslation() {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>(
    translationsCache[language] || {}
  );
  const translationQueue = useRef<string[]>([]);
  const translationTimeout = useRef<NodeJS.Timeout | null>(null);

  const processTranslationQueue = useCallback(async () => {
    if (translationQueue.current.length === 0) {
      return;
    }

    const textsToTranslate = [...new Set(translationQueue.current)];
    translationQueue.current = [];

    if (language === 'en') {
      return;
    }

    const textsNotInCache = textsToTranslate.filter(
      (text) => !(translationsCache[language] && translationsCache[language][text])
    );

    if (textsNotInCache.length === 0) {
      setTranslations(prev => ({...prev, ...translationsCache[language]}));
      return;
    }

    try {
      const { data, error } = await getTranslationsBatch({ texts: textsNotInCache, targetLanguage: language });
      if (error || !data) {
        console.error('Batch translation error:', error);
        return;
      }

      const newTranslations = data.translatedTexts;

      if (!translationsCache[language]) {
        translationsCache[language] = {};
      }
      Object.assign(translationsCache[language], newTranslations);
      
      setTranslations(prev => ({ ...prev, ...newTranslations }));
    } catch (e) {
      console.error('Batch translation failed:', e);
    }
  }, [language]);


  const t = useCallback(
    (text: string | undefined): string => {
      if (!text) return '';
      if (language === 'en') {
        return text;
      }
      const translated = translations[text] || (translationsCache[language] && translationsCache[language][text]);

      if (!translated && !translationQueue.current.includes(text)) {
        translationQueue.current.push(text);
        if (translationTimeout.current) {
          clearTimeout(translationTimeout.current);
        }
        translationTimeout.current = setTimeout(processTranslationQueue, 50);
      }
      
      return translated || text;
    },
    [language, translations, processTranslationQueue]
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

  useEffect(() => {
    // When language changes, clear the queue and trigger a re-translation of existing texts if needed
    translationQueue.current = [];
    if (translationTimeout.current) {
      clearTimeout(translationTimeout.current);
    }
    setTranslations(translationsCache[language] || {});
  }, [language]);


  return { t, translateText, language };
}
