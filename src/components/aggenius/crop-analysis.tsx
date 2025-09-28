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
  const { t } = useTranslation();

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

  useEffect(() => {
    if (!result) {
      handleGetAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('Crop Production Analysis')}</CardTitle>
          <CardDescription>
            {t('A list of common crops, their production months, and market data.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGetAnalysis}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('Refresh Crop Analysis')}
          </Button>
        </CardContent>
      </Card>

      {isLoading && !result && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('Fetching crop analysis...')}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>{t('Crop Data')}</CardTitle>
            <CardDescription>
              {t('A list of common crops with their production and market details.')}
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
                          <p className="font-semibold">{t('Water Needs')}</p>
                          <p className="text-muted-foreground">{t(crop.waterNeeds)}</p>
                        </div>
                      </div>
                       <div className="flex items-center">
                        <Mountain className="mr-2 h-4 w-4 text-primary" />
                         <div>
                          <p className="font-semibold">{t('Soil')}</p>
                          <p className="text-muted-foreground">{t(crop.soilPreference)}</p>
                        </div>
                      </div>
                      <div className="flex items-center col-span-2">
                        <DollarSign className="mr-2 h-4 w-4 text-primary" />
                        <div>
                          <p className="font-semibold">{t('Market Price')}</p>
                          <p className="text-muted-foreground">{crop.marketPrice || t('N/A')}</p>
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
