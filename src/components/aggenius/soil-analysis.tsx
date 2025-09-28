'use client';

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  ph: z.coerce.number().min(0).max(14, "pH must be between 0 and 14."),
  moisture: z.coerce.number().min(0).max(100, "Moisture must be between 0 and 100."),
});

type FormValues = z.infer<typeof formSchema>;

interface SoilAnalysisProps {
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
}

export function SoilAnalysis({ onSubmit, isLoading }: SoilAnalysisProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ph: 7.0,
      moisture: 50,
    },
  });
  
  const phValue = form.watch('ph');
  const moistureValue = form.watch('moisture');

  return (
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
  );
}
