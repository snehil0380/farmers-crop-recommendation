import { Wheat } from "lucide-react";
import { LanguageSelector } from "./language-selector";
import { AudioRecorder } from "./audio-recorder";

export function Header() {
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
          <AudioRecorder />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
