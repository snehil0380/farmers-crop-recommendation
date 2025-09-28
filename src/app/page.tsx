import { Header } from "@/components/aggenius/header";
import { CropSuggestion } from "@/components/aggenius/crop-suggestion";
import { DiseaseDetection } from "@/components/aggenius/disease-detection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Stethoscope } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <Tabs defaultValue="suggestion" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-primary/10 rounded-lg">
              <TabsTrigger value="suggestion" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                <Leaf className="mr-2 h-4 w-4" />
                Crop Advisor
              </TabsTrigger>
              <TabsTrigger value="detection" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                <Stethoscope className="mr-2 h-4 w-4" />
                Disease Detection
              </TabsTrigger>
            </TabsList>
            <TabsContent value="suggestion" className="mt-6">
              <CropSuggestion />
            </TabsContent>
            <TabsContent value="detection" className="mt-6">
              <DiseaseDetection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
