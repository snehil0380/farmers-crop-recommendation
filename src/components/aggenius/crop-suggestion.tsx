'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { getCropSuggestions } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { SuggestCropsOutput } from "@/ai/flows/ai-crop-suggestions";
import { Loader2, BarChart, Sprout, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  ph: z.coerce.number().min(0).max(14, "pH must be between 0 and 14."),
  moisture: z.coerce.number().min(0).max(100, "Moisture must be between 0 and 100."),
});

type FormValues = z.infer<typeof formSchema>;

export function CropSuggestion() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestCropsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ph: 7.0,
      moisture: 50,
    },
  });
  
  const phValue = form.watch('ph');
  const moistureValue = form.watch('moisture');

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
      <Card>
        <CardHeader>
          <CardTitle>Soil Analysis</CardTitle>
          <CardDescription>Enter your soil's pH and moisture levels to get personalized crop suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="ph"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Soil pH</FormLabel>
                      <span className="text-sm font-medium text-primary">{phValue.toFixed(1)}</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={14}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moisture"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Moisture (%)</FormLabel>
                       <span className="text-sm font-medium text-primary">{moistureValue}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
            <CardDescription>Based on your soil data, here's what we suggest.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Suggested Crops
                  </CardTitle>
                  <Sprout className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{result.crops.join(', ')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Estimated Yield
                  </CardTitle>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
