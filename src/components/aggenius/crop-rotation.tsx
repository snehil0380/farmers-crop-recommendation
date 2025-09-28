'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCropRotationSuggestions, getSimilarCrops } from '@/app/actions';
import type { CropRotationSuggestionOutput } from '@/ai/flows/crop-rotation-suggestion';
import type { SuggestSimilarCropsOutput } from '@/ai/flows/suggest-similar-crops';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, CheckCircle, Leaf, Zap, Wheat, Carrot, Bean, Search, Lightbulb } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const iconMap: Record<string, React.ElementType> = {
  Corn: Wheat, // Using Wheat for Corn as it's visually similar in this context
  Bean,
  Carrot,
  Wheat, // For Cereals
};

function SimilarCropsSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestSimilarCropsOutput | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: t('Empty Search'),
        description: t('Please enter a crop name to find similar ones.'),
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const { data, error } = await getSimilarCrops({ query });

    if (error) {
      toast({
        title: t('Error'),
        description: t(error),
        variant: 'destructive',
      });
    } else {
      setResult(data);
    }
    setIsLoading(false);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('Find Similar Crops')}</CardTitle>
          <CardDescription>{t('Enter a crop name to find alternatives with similar characteristics.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              placeholder={t('e.g., Tomatoes')} 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="sr-only">{t('Search')}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && (
         <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[150px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">{t('Finding similar crops...')}</p>
            </CardContent>
          </Card>
      )}

      {result && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>{t('Suggested Alternatives')}</CardTitle>
            <CardDescription>{t('Here are some crops similar to')} "{t(query)}".</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {result.crops.map((crop, index) => {
              return (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">{t(crop.name)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 mt-1 text-primary shrink-0" />
                        <span>{t(crop.reason)}</span>
                     </p>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


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
        title: t('Error'),
        description: t(error),
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
    if (!result?.rotation) return [];
    return [...result.rotation].sort((a, b) => a.step - b.step);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start relative">
            {sortedRotation?.map((item, index) => {
              const Icon = iconMap[item.icon] || Leaf;
              const isLastItem = index === sortedRotation.length - 1;

              return (
                <div key={item.step} className="flex flex-col items-center relative md:pr-8 lg:pr-12">
                  <Card className="w-full shadow-lg">
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
                        <h4 className="font-semibold flex items-center text-sm"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />{t('Benefits')}</h4>
                        <p className="text-muted-foreground text-xs">{t(item.benefits)}</p>
                      </div>
                       <div>
                        <h4 className="font-semibold flex items-center text-sm"><Zap className="mr-2 h-4 w-4 text-yellow-500" />{t('Requirements')}</h4>
                        <p className="text-muted-foreground text-xs">{t(item.requirements)}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{t('Examples')}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.examples.map(ex => <Badge key={ex} variant="secondary" className="text-xs">{t(ex)}</Badge>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                   {/* Arrow logic */}
                  {!isLastItem && (
                    <>
                      <div className="absolute top-1/2 -right-0 -translate-y-1/2 hidden lg:block">
                        <ArrowRight className="h-8 w-8 text-muted-foreground" />
                      </div>
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 lg:hidden">
                        <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90" />
                      </div>
                    </>
                  )}
                   {/* Arrow for md screens wrapping to next line */}
                   {index === 1 && (
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 hidden md:block lg:hidden">
                        <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90" />
                     </div>
                   )}
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

      <SimilarCropsSection />
    </div>
  );
}
