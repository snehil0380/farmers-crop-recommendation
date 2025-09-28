'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from './use-language';
import { getTranslation, getTranslationsBatch } from '@/app/actions';

const translationsCache: Record<string, Record<string, string>> = {};
const failedTranslations = new Set<string>();

export function useTranslation() {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>(
    () => translationsCache[language] || {}
  );
  
  const textsToTranslate = useRef<Set<string>>(new Set());
  const translationTimeout = useRef<NodeJS.Timeout | null>(null);

  const processTranslationQueue = useCallback(async () => {
    if (textsToTranslate.current.size === 0) {
      return;
    }

    const texts = Array.from(textsToTranslate.current);
    textsToTranslate.current.clear();
    
    if (language === 'en') {
      return;
    }

    const textsNotInCache = texts.filter(
      (text) => !(translationsCache[language] && translationsCache[language][text]) && !failedTranslations.has(`${language}:${text}`)
    );
    
    if (textsNotInCache.length === 0) {
      // All translations are already in cache or have failed before, just update the state if needed
      setTranslations(prev => ({...prev, ...translationsCache[language]}));
      return;
    }

    try {
      const { data, error } = await getTranslationsBatch({
        texts: textsNotInCache,
        targetLanguage: language,
      });

      if (error || !data) {
        console.error('Batch translation error:', error);
        // Mark these as failed to prevent retrying them immediately
        textsNotInCache.forEach(text =>
          failedTranslations.add(`${language}:${text}`)
        );
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
      textsNotInCache.forEach(text => failedTranslations.add(`${language}:${text}`));
    }
  }, [language]);


  const t = useCallback(
    (text: string | undefined): string => {
      if (!text) return '';
      if (language === 'en') {
        return text;
      }
      
      const cachedTranslation = translations[text] || (translationsCache[language] && translationsCache[language][text]);
      
      if (cachedTranslation) {
        return cachedTranslation;
      }
      
      if (failedTranslations.has(`${language}:${text}`)) {
        return text; // Return original text if it has failed before
      }

      textsToTranslate.current.add(text);

      if (translationTimeout.current) {
        clearTimeout(translationTimeout.current);
      }
      translationTimeout.current = setTimeout(processTranslationQueue, 50);
      
      return text; // Return original text until translation is available
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
    // When language changes, update the translations from cache
    setTranslations(translationsCache[language] || {});
    // Any outstanding texts will be re-queued and translated to the new language on next render
  }, [language]);


  return { t, translateText, language };
}
