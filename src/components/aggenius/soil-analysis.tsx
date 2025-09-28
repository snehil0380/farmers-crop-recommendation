'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

const formSchema = z.object({
  nitrogen: z.coerce.number().min(0, "Nitrogen must be a positive number."),
  phosphorus: z.coerce.number().min(0, "Phosphorus must be a positive number."),
  potassium: z.coerce.number().min(0, "Potassium must be a positive number."),
  ph: z.coerce.number().min(0, "pH must be between 0 and 14.").max(14, "pH must be between 0 and 14."),
  temperature: z.coerce.number(),
  rainfall: z.coerce.number().min(0, "Rainfall must be a positive number."),
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
      nitrogen: 50,
      phosphorus: 40,
      potassium: 40,
      ph: 6.5,
      temperature: 25,
      rainfall: 120,
    },
  });
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Krishi AI - Crop Recommendation (Demo)')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nitrogen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Nitrogen (N)')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phosphorus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Phosphorus (P)')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="potassium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Potassium (K)')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ph"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Soil pH')}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Temperature (°C)')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rainfall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Rainfall (mm)')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button suppressHydrationWarning type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('Get Recommendation')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
