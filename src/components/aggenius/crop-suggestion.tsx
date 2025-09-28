'use client';

import { useState } from "react";
import Image from "next/image";
import * as z from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCropSuggestions } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { SuggestCropsOutput } from "@/ai/flows/ai-crop-suggestions";
import { Loader2, BarChart, Sprout, ShieldCheck, Star, CalendarDays, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SoilAnalysis } from "./soil-analysis";
import { Badge } from "@/components/ui/badge";
import { findImage } from "@/lib/placeholder-images";
import { useTranslation } from "@/hooks/use-translation";

const formSchema = z.object({
  nitrogen: z.coerce.number(),
  phosphorus: z.coerce.number(),
  potassium: z.coerce.number(),
  ph: z.coerce.number().min(0).max(14),
  temperature: z.coerce.number(),
  rainfall: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

export function CropSuggestion() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestCropsOutput | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);

    const { data, error } = await getCropSuggestions(values);

    if (error) {
      toast({
        title: t("Error"),
        description: t(error),
        variant: "destructive",
      });
    } else {
      setResult(data);
    }
    
    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <SoilAnalysis onSubmit={onSubmit} isLoading={isLoading} />

      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('Analyzing your soil...')}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center space-x-2 bg-green-100 dark:bg-green-900/50 p-4 rounded-t-lg">
                <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-400" />
                <div>
                    <CardTitle className="text-base font-semibold">{t('Recommended Crop')}: {t(result.bestCrop)}</CardTitle>
                </div>
            </CardHeader>
          <CardContent className="p-6 grid gap-4">
            <p><span className="font-semibold">{t('Expected Yield')}:</span> {t(result.yieldEstimate)}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.crops.map((crop, index) => {
                if (crop.name !== result.bestCrop) return null;

                const placeholderImage = findImage(crop.name);
                const imageUrl = placeholderImage?.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(crop.name)}/600/400`;
                
                return (
                  <Card key={index} className="col-span-1 md:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          {t(crop.name)}
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          <span>{t(crop.growthTime)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Image
                        src={imageUrl}
                        alt={`Image of ${crop.name}`}
                        width={600}
                        height={400}
                        className="rounded-lg object-cover aspect-[3/2]"
                        data-ai-hint={crop.imageDescription}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-2"><Sprout className="mr-2 h-5 w-5" /> {t('Other Suggestions')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {result.crops.map((crop) => {
                   if (crop.name === result.bestCrop) return null;
                   return (
                    <Badge key={crop.name} variant="outline" className="justify-center py-1 px-2 text-sm">{t(crop.name)}</Badge>
                   )
                })}
              </div>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
