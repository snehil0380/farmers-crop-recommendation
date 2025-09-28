'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Mic, MicOff, Languages, FileText, Bot } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { getSpeechToText } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [open, setOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { t, translateText, language } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when dialog is closed
    if (!open) {
      setIsRecording(false);
      setIsProcessing(false);
      setTranscript('');
      setTranslatedText('');
    }
  }, [open]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = [];
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const audioDataUri = reader.result as string;
          const { data, error } = await getSpeechToText({ audioDataUri, language });

          if (error || !data) {
            toast({ title: t('Error'), description: t('Could not process audio.'), variant: 'destructive' });
            setIsProcessing(false);
            return;
          }

          setTranscript(data.text);
          if (data.text) {
            const translated = await translateText(data.text);
            setTranslatedText(translated);
          } else {
            setTranslatedText('');
          }
          setIsProcessing(false);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all audio tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscript('');
      setTranslatedText('');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({ title: t('Microphone Error'), description: t('Could not access the microphone.'), variant: 'destructive' });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };
  
  const currentLanguageLabel = t(
      language === 'en' ? 'English' :
      language === 'hi' ? 'Hindi' :
      language === 'bn' ? 'Bengali' :
      language === 'ta' ? 'Tamil' :
      'Telugu'
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" suppressHydrationWarning>
          <Mic className="h-6 w-6" />
          <span className="sr-only">{t('Voice Translation')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('Voice Translation')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Button
              onClick={toggleRecording}
              disabled={isProcessing}
              size="icon"
              className={`h-20 w-20 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isRecording ? t('Recording...') : (isProcessing ? t('Processing...') : t('Tap to speak'))}
              </p>
               {!isRecording && !isProcessing && <p className="text-xs text-muted-foreground">{t('Language')}: {currentLanguageLabel}</p>}
            </div>
          </div>

          {(isProcessing || transcript) && (
             <div className="space-y-4 pt-4">
                {isProcessing && !transcript && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                {transcript && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center text-sm"><FileText className="mr-2"/>{t('Transcript')}</h3>
                        <p className="text-muted-foreground p-3 bg-muted/50 rounded-md">{transcript}</p>
                    </div>
                     <div className="space-y-2">
                        <h3 className="font-semibold flex items-center text-sm"><Bot className="mr-2"/>{t('Translation')}</h3>
                        <p className="p-3 bg-primary/10 rounded-md">{translatedText || t('Translating...')}</p>
                    </div>
                  </div>
                )}
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
