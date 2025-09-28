'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { getDiseaseDiagnosis } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import type { ImageBasedDiseaseDetectionOutput } from "@/ai/flows/image-based-disease-detection";
import { Loader2, Upload, Microscope, Pill } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

export function DiseaseDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImageBasedDiseaseDetectionOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t, translateText, language } = useTranslation();

  const [title, setTitle] = useState('Crop Disease Detection');
  const [description, setDescription] = useState('Upload a photo of your crop to get an AI-powered disease diagnosis and advice.');
  const [uploadLabel, setUploadLabel] = useState('Click to upload');
  const [dragDropLabel, setDragDropLabel] = useState('or drag and drop');
  const [fileTypesLabel, setFileTypesLabel] = useState('PNG, JPG, or WEBP');
  const [buttonText, setButtonText] = useState('Analyze Crop Image');
  const [diagnosingText, setDiagnosingText] = useState('Diagnosing crop disease...');
  const [reportTitle, setReportTitle] = useState('Diagnosis Report');
  const [reportDesc, setReportDesc] = useState("Here's our analysis of the crop image.");
  const [diagnosisLabel, setDiagnosisLabel] = useState('Diagnosis');
  const [adviceLabel, setAdviceLabel] = useState('Preliminary Advice');

  useEffect(() => {
    if (language !== 'en') {
      Promise.all([
        translateText('Crop Disease Detection'),
        translateText('Upload a photo of your crop to get an AI-powered disease diagnosis and advice.'),
        translateText('Click to upload'),
        translateText('or drag and drop'),
        translateText('PNG, JPG, or WEBP'),
        translateText('Analyze Crop Image'),
        translateText('Diagnosing crop disease...'),
        translateText('Diagnosis Report'),
        translateText("Here's our analysis of the crop image."),
        translateText('Diagnosis'),
        translateText('Preliminary Advice'),
      ]).then(([t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11]) => {
        setTitle(t1);
        setDescription(t2);
        setUploadLabel(t3);
        setDragDropLabel(t4);
        setFileTypesLabel(t5);
        setButtonText(t6);
        setDiagnosingText(t7);
        setReportTitle(t8);
        setReportDesc(t9);
        setDiagnosisLabel(t10);
        setAdviceLabel(t11);
      });
    } else {
      setTitle('Crop Disease Detection');
      setDescription('Upload a photo of your crop to get an AI-powered disease diagnosis and advice.');
      setUploadLabel('Click to upload');
      setDragDropLabel('or drag and drop');
      setFileTypesLabel('PNG, JPG, or WEBP');
      setButtonText('Analyze Crop Image');
      setDiagnosingText('Diagnosing crop disease...');
      setReportTitle('Diagnosis Report');
      setReportDesc("Here's our analysis of the crop image.");
      setDiagnosisLabel('Diagnosis');
      setAdviceLabel('Preliminary Advice');
    }
  }, [language, translateText]);

  const { handleSubmit, setValue, getValues } = useForm<{ photoDataUri: string }>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        setValue('photoDataUri', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        setValue('photoDataUri', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onSubmit = async () => {
    const values = getValues();
    if (!values.photoDataUri) {
      toast({
        title: t("No image selected"),
        description: t("Please upload an image of your crop."),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    const { data, error } = await getDiseaseDiagnosis(values);

    if (error) {
      toast({
        title: t("Error"),
        description: t(error),
        variant: "destructive",
      });
    } else {
      setResult(data);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div 
              className="flex items-center justify-center w-full"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Label 
                htmlFor="dropzone-file" 
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-primary/5"
              >
                {preview ? (
                  <div className="relative w-full h-full">
                     <Image src={preview} alt="Crop preview" fill className="object-contain p-2 rounded-lg" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{uploadLabel}</span> {dragDropLabel}</p>
                    <p className="text-xs text-muted-foreground">{fileTypesLabel}</p>
                  </div>
                )}
                <Input 
                  id="dropzone-file"
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                />
              </Label>
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{diagnosingText}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>{reportTitle}</CardTitle>
            <CardDescription>{reportDesc}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{diagnosisLabel}</CardTitle>
                  <Microscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{t(result.diagnosis)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{adviceLabel}</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t(result.advice)}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
