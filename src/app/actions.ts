'use server';

import { suggestCrops, SuggestCropsInput, SuggestCropsOutput } from "@/ai/flows/ai-crop-suggestions";
import { imageBasedDiseaseDetection, ImageBasedDiseaseDetectionInput, ImageBasedDiseaseDetectionOutput } from "@/ai/flows/image-based-disease-detection";
import { z } from "zod";

const cropSuggestionSchema = z.object({
  ph: z.coerce.number().min(0).max(14),
  moisture: z.coerce.number().min(0).max(100),
});

export async function getCropSuggestions(data: { ph: number, moisture: number }): Promise<{data: SuggestCropsOutput | null; error: string | null}> {
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
