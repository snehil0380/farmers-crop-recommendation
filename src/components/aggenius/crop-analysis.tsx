'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCropAnalysis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { CropAnalysisOutput } from '@/ai/flows/crop-analysis';
import { Loader2, CalendarDays, Droplets, Mountain, DollarSign } from 'lucide-react';
import { findImage } from '@/lib/placeholder-images';
import { useTranslation } from '@/hooks/use-translation';

export function CropAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CropAnalysisOutput | null>(null);
  const { toast } = useToast();
  const { t, translateText, language } = useTranslation();

  const [title, setTitle] = useState('Crop Production Analysis');
  const [description, setDescription] = useState('Click the button to see a list of common crops, their production months, and market data.');
  const [buttonText, setButtonText] = useState('Get Crop Analysis');
  const [loadingText, setLoadingText] = useState('Fetching crop analysis...');
  const [resultsTitle, setResultsTitle] = useState('Crop Data');
  const [resultsDesc, setResultsDesc] = useState('A list of common crops with their production and market details.');
  const [waterNeedsLabel, setWaterNeedsLabel] = useState('Water Needs');
  const [soilLabel, setSoilLabel] = useState('Soil');
  const [marketPriceLabel, setMarketPriceLabel] = useState('Market Price');
  const [notAvailableLabel, setNotAvailableLabel] = useState('N/A');

  useEffect(() => {
    if (language !== 'en') {
      Promise.all([
        translateText('Crop Production Analysis'),
        translateText('Click the button to see a list of common crops, their production months, and market data.'),
        translateText('Get Crop Analysis'),
        translateText('Fetching crop analysis...'),
        translateText('Crop Data'),
        translateText('A list of common crops with their production and market details.'),
        translateText('Water Needs'),
        translateText('Soil'),
        translateText('Market Price'),
        translateText('N/A'),
      ]).then(([t1, t2, t3, t4, t5, t6, t7, t8, t9, t10]) => {
        setTitle(t1);
        setDescription(t2);
        setButtonText(t3);
        setLoadingText(t4);
        setResultsTitle(t5);
        setResultsDesc(t6);
        setWaterNeedsLabel(t7);
        setSoilLabel(t8);
        setMarketPriceLabel(t9);
        setNotAvailableLabel(t10);
      });
    } else {
      setTitle('Crop Production Analysis');
      setDescription('Click the button to see a list of common crops, their production months, and market data.');
      setButtonText('Get Crop Analysis');
      setLoadingText('Fetching crop analysis...');
      setResultsTitle('Crop Data');
      setResultsDesc('A list of common crops with their production and market details.');
      setWaterNeedsLabel('Water Needs');
      setSoilLabel('Soil');
      setMarketPriceLabel('Market Price');
      setNotAvailableLabel('N/A');
    }
  }, [language, translateText]);

  async function handleGetAnalysis() {
    setIsLoading(true);
    setResult(null);

    const { data, error } = await getCropAnalysis();

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      setResult(data);
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGetAnalysis}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{loadingText}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>{resultsTitle}</CardTitle>
            <CardDescription>
              {resultsDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {result.crops.map((crop, index) => {
                const placeholderImage = findImage(crop.name);
                const imageUrl =
                  placeholderImage?.imageUrl ||
                  `https://picsum.photos/seed/${encodeURIComponent(crop.name)}/600/400`;
                
                return (
                <Card key={index} className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <Image
                      src={imageUrl}
                      alt={`Image of ${crop.name}`}
                      width={600}
                      height={400}
                      className="rounded-t-lg md:rounded-l-lg md:rounded-t-none object-cover w-full h-full aspect-[3/2] md:aspect-auto"
                      data-ai-hint={crop.imageDescription}
                    />
                  </div>
                  <div className="md:w-2/3 flex flex-col">
                    <CardHeader>
                      <CardTitle>{t(crop.name)}</CardTitle>
                       <div className="flex items-center text-sm text-muted-foreground pt-1">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span>{t(crop.productionMonths)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm flex-grow">
                      <div className="flex items-center">
                        <Droplets className="mr-2 h-4 w-4 text-primary" />
                        <div>
                          <p className="font-semibold">{waterNeedsLabel}</p>
                          <p className="text-muted-foreground">{t(crop.waterNeeds)}</p>
                        </div>
                      </div>
                       <div className="flex items-center">
                        <Mountain className="mr-2 h-4 w-4 text-primary" />
                         <div>
                          <p className="font-semibold">{soilLabel}</p>
                          <p className="text-muted-foreground">{t(crop.soilPreference)}</p>
                        </div>
                      </div>
                      <div className="flex items-center col-span-2">
                        <DollarSign className="mr-2 h-4 w-4 text-primary" />
                        <div>
                          <p className="font-semibold">{marketPriceLabel}</p>
                          <p className="text-muted-foreground">{crop.marketPrice || notAvailableLabel}</p>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
