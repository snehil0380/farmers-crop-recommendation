'use server';

import { suggestCrops, SuggestCropsInput, SuggestCropsOutput } from "@/ai/flows/ai-crop-suggestions";
import { imageBasedDiseaseDetection, ImageBasedDiseaseDetectionInput, ImageBasedDiseaseDetectionOutput } from "@/ai/flows/image-based-disease-detection";
import { getCropAnalysis as getCropAnalysisFlow, CropAnalysisOutput } from "@/ai/flows/crop-analysis";
import { translateText, TranslateTextInput, TranslateTextOutput } from "@/ai/flows/translate-text";
import { translateTextsBatch, TranslateTextsBatchInput, TranslateTextsBatchOutput } from "@/ai/flows/translate-texts-batch";
import { getCropRotationSuggestions as getCropRotationSuggestionsFlow, CropRotationSuggestionOutput } from "@/ai/flows/crop-rotation-suggestion";
import { speechToText, SpeechToTextInput, SpeechToTextOutput } from "@/ai/flows/speech-to-text";
import { z } from "zod";

const cropSuggestionSchema = z.object({
  nitrogen: z.coerce.number(),
  phosphorus: z.coerce.number(),
  potassium: z.coerce.number(),
  ph: z.coerce.number().min(0).max(14),
  temperature: z.coerce.number(),
  rainfall: z.coerce.number(),
});

export async function getCropSuggestions(data: SuggestCropsInput): Promise<{data: SuggestCropsOutput | null; error: string | null}> {
  const validatedFields = cropSuggestionSchema.safeParse(data);

  if (!validatedFields.success) {
    return { data: null, error: "Invalid input." };
  }

  try {
    const result = await suggestCrops(validatedFields.data);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "Failed to get suggestions. Please try again." };
  }
}

const diseaseDetectionSchema = z.object({
  photoDataUri: z.string().startsWith("data:image/"),
});

export async function getDiseaseDiagnosis(data: { photoDataUri: string }): Promise<{data: ImageBasedDiseaseDetectionOutput | null; error: string | null}> {
  const validatedFields = diseaseDetectionSchema.safeParse(data);

  if (!validatedFields.success) {
    return { data: null, error: "Invalid image format." };
  }
  
  try {
    const result = await imageBasedDiseaseDetection(validatedFields.data);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "Failed to analyze image. Please try again." };
  }
}


export async function getCropAnalysis(): Promise<{data: CropAnalysisOutput | null; error: string | null}> {
  try {
    const result = await getCropAnalysisFlow();
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "Failed to get crop analysis. Please try again." };
  }
}

const translateTextSchema = z.object({
  text: z.string(),
  targetLanguage: z.string(),
});

export async function getTranslation(data: { text: string, targetLanguage: string }): Promise<{data: TranslateTextOutput | null; error: string | null}> {
  const validatedFields = translateTextSchema.safeParse(data);
  if (!validatedFields.success) {
    return { data: null, error: "Invalid input for translation." };
  }

  try {
    const result = await translateText(validatedFields.data);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "Failed to translate text. Please try again." };
  }
}

const translateTextsBatchSchema = z.object({
  texts: z.array(z.string()),
  targetLanguage: z.string(),
});

export async function getTranslationsBatch(data: { texts: string[], targetLanguage: string }): Promise<{data: TranslateTextsBatchOutput | null; error: string | null}> {
  const validatedFields = translateTextsBatchSchema.safeParse(data);
  if (!validatedFields.success) {
    return { data: null, error: "Invalid input for batch translation." };
  }

  try {
    const result = await translateTextsBatch(validatedFields.data);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "Failed to translate texts. Please try again." };
  }
}

export async function getCropRotationSuggestions(): Promise<{data: CropRotationSuggestionOutput | null; error: string | null}> {
  try {
    const result = await getCropRotationSuggestionsFlow();
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "Failed to get crop rotation suggestions. Please try again." };
  }
}

const speechToTextSchema = z.object({
  audioDataUri: z.string().startsWith("data:audio/"),
});

export async function getSpeechToText(data: SpeechToTextInput): Promise<{data: SpeechToTextOutput | null; error: string | null}> {
  const validatedFields = speechToTextSchema.safeParse(data);

  if (!validatedFields.success) {
    return { data: null, error: "Invalid audio format." };
  }

  try {
    const result = await speechToText(validatedFields.data);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "Failed to process audio. Please try again." };
  }
}
