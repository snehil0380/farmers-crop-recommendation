'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCropRotationSuggestions } from '@/app/actions';
import type { CropRotationSuggestionOutput } from '@/ai/flows/crop-rotation-suggestion';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, CheckCircle, Leaf, Zap, Droplets, Wheat, Carrot, Bean } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Corn: Wheat, // Using Wheat for Corn as it's visually similar in this context
  Bean,
  Carrot,
  Wheat, // For Cereals
};

export function CropRotation() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CropRotationSuggestionOutput | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  async function handleGetSuggestions() {
    setIsLoading(true);
    setResult(null);

    const { data, error } = await getCropRotationSuggestions();

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
      handleGetSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const sortedRotation = useMemo(() => {
    return result?.rotation.sort((a, b) => a.step - b.step);
  }, [result]);


  if (isLoading && !result) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('Generating Crop Rotation Plan...')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('Crop Rotation Plan')}</CardTitle>
          <CardDescription>
            {t('An AI-generated 4-step crop rotation plan to improve soil health and yield.')}
          </CardDescription>
        </CardHeader>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {sortedRotation?.map((item, index) => {
              const Icon = iconMap[item.icon] || Leaf;
              const nextItem = sortedRotation[(index + 1) % sortedRotation.length];

              return (
                <div key={item.step} className="flex flex-col items-center">
                  <Card className="w-full relative shadow-lg">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                           <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <CardDescription>{t('Step')} {item.step}</CardDescription>
                          <CardTitle>{t(item.cropType)}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />{t('Benefits')}</h4>
                        <p className="text-muted-foreground text-sm">{t(item.benefits)}</p>
                      </div>
                       <div>
                        <h4 className="font-semibold flex items-center"><Zap className="mr-2 h-4 w-4 text-yellow-500" />{t('Requirements')}</h4>
                        <p className="text-muted-foreground text-sm">{t(item.requirements)}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">{t('Examples')}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.examples.map(ex => <Badge key={ex} variant="secondary">{t(ex)}</Badge>)}
                        </div>
                      </div>
                    </CardContent>
                     {/* Arrow logic */}
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden md:block">
                       <ArrowRight className="h-8 w-8 text-muted-foreground" />
                    </div>
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 md:hidden">
                       <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90" />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>{t('Overall Benefits of Crop Rotation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t(result.overallBenefits)}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
