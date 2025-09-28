'use client';

import { useEffect, useState } from "react";
import { Header } from "@/components/aggenius/header";
import { CropSuggestion } from "@/components/aggenius/crop-suggestion";
import { DiseaseDetection } from "@/components/aggenius/disease-detection";
import { CropAnalysis } from "@/components/aggenius/crop-analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Stethoscope, BarChart } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t, translateText, language } = useTranslation();
  const [tab1, setTab1] = useState('Crop Advisor');
  const [tab2, setTab2] = useState('Disease Detection');
  const [tab3, setTab3] = useState('Crop Analysis');

  useEffect(() => {
    if (language !== 'en') {
      Promise.all([
        translateText('Crop Advisor'),
        translateText('Disease Detection'),
        translateText('Crop Analysis')
      ]).then(([t1, t2, t3]) => {
        setTab1(t1);
        setTab2(t2);
        setTab3(t3);
      });
    } else {
      setTab1('Crop Advisor');
      setTab2('Disease Detection');
      setTab3('Crop Analysis');
    }
  }, [language, translateText]);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <Tabs defaultValue="suggestion" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-primary/10 rounded-lg">
              <TabsTrigger value="suggestion" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                <Leaf className="mr-2 h-4 w-4" />
                {tab1}
              </TabsTrigger>
              <TabsTrigger value="detection" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                <Stethoscope className="mr-2 h-4 w-4" />
                {tab2}
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                <BarChart className="mr-2 h-4 w-4" />
                {tab3}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="suggestion" className="mt-6">
              <CropSuggestion />
            </TabsContent>
            <TabsContent value="detection" className="mt-6">
              <DiseaseDetection />
            </TabsContent>
            <TabsContent value="analysis" className="mt-6">
              <CropAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
