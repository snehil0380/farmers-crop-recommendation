'use client';

import { useEffect, useState } from "react";
import { Header } from "@/components/aggenius/header";
import { CropSuggestion } from "@/components/aggenius/crop-suggestion";
import { DiseaseDetection } from "@/components/aggenius/disease-detection";
import { CropAnalysis } from "@/components/aggenius/crop-analysis";
import { CropRotation } from "@/components/aggenius/crop-rotation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wheat, Stethoscope, BarChart, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <Tabs defaultValue="suggestion" className="flex flex-col flex-grow">
        <main className="flex-grow flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-8">
          <div className="w-full max-w-4xl mx-auto">
              <TabsContent value="suggestion" className="mt-6">
                <CropSuggestion />
              </TabsContent>
              <TabsContent value="detection" className="mt-6">
                <DiseaseDetection />
              </TabsContent>
              <TabsContent value="analysis" className="mt-6">
                <CropAnalysis />
              </TabsContent>
              <TabsContent value="rotation" className="mt-6">
                <CropRotation />
              </TabsContent>
          </div>
        </main>
        <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="w-full max-w-4xl mx-auto p-2">
            <TabsList className="grid w-full grid-cols-4 bg-primary/10 rounded-lg h-16">
              <TabsTrigger value="suggestion" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md h-full">
                <div className="flex flex-col items-center gap-1">
                  <Wheat className="h-5 w-5" />
                  <span className="text-xs">{t('Crop Advisor')}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="detection" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md h-full">
                 <div className="flex flex-col items-center gap-1">
                  <Stethoscope className="h-5 w-5" />
                  <span className="text-xs">{t('Disease Detection')}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md h-full">
                 <div className="flex flex-col items-center gap-1">
                  <BarChart className="h-5 w-5" />
                  <span className="text-xs">{t('Crop Analysis')}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="rotation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md h-full">
                 <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="h-5 w-5" />
                  <span className="text-xs">{t('Crop Rotation')}</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
