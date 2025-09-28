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
  ph: z.coerce.number().min(0, "pH must be between 0 and 14.").max(14, "pH must be between 0 and 14."),
  moisture: z.coerce.number().min(0, "Moisture must be between 0 and 100.").max(100, "Moisture must be between 0 and 100."),
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
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Soil Analysis')}</CardTitle>
        <CardDescription>{t("Enter your soil's pH and moisture levels to get personalized crop suggestions.")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Soil pH')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 7.0" {...field} />
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
                    <FormLabel>{t('Moisture (%)')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button suppressHydrationWarning type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('Get Suggestions')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
