'use client';

import { Wheat } from "lucide-react";
import { LanguageSelector } from "./language-selector";
import { AudioRecorder } from "./audio-recorder";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "../ui/badge";

export function Header() {
  const { language } = useLanguage();
  
  const languageMap: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    bn: 'Bengali',
    ta: 'Tamil',
    te: 'Telugu',
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex flex-1 items-center">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <Wheat className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              KRISHI
            </span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <AudioRecorder />
            <Badge variant="outline" className="hidden sm:block">{languageMap[language]}</Badge>
          </div>
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
