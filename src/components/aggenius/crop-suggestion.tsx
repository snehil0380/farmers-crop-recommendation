'use client';

import { useState } from "react";
import Image from "next/image";
import * as z from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCropSuggestions } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { SuggestCropsOutput } from "@/ai/flows/ai-crop-suggestions";
import { Loader2, BarChart, Sprout, ShieldCheck, Star, CalendarDays } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SoilAnalysis } from "./soil-analysis";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  ph: z.coerce.number().min(0).max(14, "pH must be between 0 and 14."),
  moisture: z.coerce.number().min(0).max(100, "Moisture must be between 0 and 100."),
});

type FormValues = z.infer<typeof formSchema>;

export function CropSuggestion() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestCropsOutput | null>(null);
  const { toast } = useToast();

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);

    const { data, error } = await getCropSuggestions(values);

    if (error) {
      toast({
        title: "Error",
        description: error,
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
            <p className="text-muted-foreground">Analyzing your soil...</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Our Recommendations</CardTitle>
            <CardDescription>Based on your soil data, here are our suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estimated Yield</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{result.yieldEstimate}</div>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sustainability Score</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{result.sustainabilityScore} / 100</div>
                  <Progress value={result.sustainabilityScore} className="mt-2" />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center"><Sprout className="mr-2 h-5 w-5" /> Suggested Crops</h3>
              <div className="grid grid-cols-1 gap-4">
                {result.crops.map((crop, index) => (
                  <Card key={index} className={crop.name === result.bestCrop ? 'border-primary shadow-lg' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          {crop.name}
                          {crop.name === result.bestCrop && (
                            <Badge variant="default" className="ml-2 bg-accent text-accent-foreground">
                              <Star className="mr-1 h-3 w-3" /> Best Choice
                            </Badge>
                          )}
                        </CardTitle>
                         <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          <span>{crop.growthTime}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Image
                        src={`https://picsum.photos/seed/${crop.name.toLowerCase().replace(' ', '')}${Math.random()}/600/400`}
                        alt={`Image of ${crop.name}`}
                        width={600}
                        height={400}
                        className="rounded-lg object-cover aspect-[3/2]"
                        data-ai-hint={crop.imageDescription}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
