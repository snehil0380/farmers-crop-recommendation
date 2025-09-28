'use server';
/**
 * @fileOverview This file defines a Genkit flow for image-based crop disease detection.
 *
 * It allows farmers to upload an image of their crops and receive an AI-driven disease detection analysis with preliminary advice.
 *
 * @file ImageBasedDiseaseDetection
 * @interface ImageBasedDiseaseDetectionInput - Defines the input schema for the disease detection flow, including the image data URI.
 * @interface ImageBasedDiseaseDetectionOutput - Defines the output schema for the disease detection flow, including the disease diagnosis and advice.
 * @function imageBasedDiseaseDetection - The main function to trigger the image-based disease detection flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageBasedDiseaseDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ImageBasedDiseaseDetectionInput = z.infer<
  typeof ImageBasedDiseaseDetectionInputSchema
>;

const ImageBasedDiseaseDetectionOutputSchema = z.object({
  diagnosis: z
    .string()
    .describe('The diagnosis of the plant disease based on the image.'),
  advice: z
    .string()
    .describe('Preliminary advice for addressing the identified disease.'),
});

export type ImageBasedDiseaseDetectionOutput = z.infer<
  typeof ImageBasedDiseaseDetectionOutputSchema
>;

export async function imageBasedDiseaseDetection(
  input: ImageBasedDiseaseDetectionInput
): Promise<ImageBasedDiseaseDetectionOutput> {
  return imageBasedDiseaseDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageBasedDiseaseDetectionPrompt',
  input: {schema: ImageBasedDiseaseDetectionInputSchema},
  output: {schema: ImageBasedDiseaseDetectionOutputSchema},
  prompt: `You are an AI assistant specialized in diagnosing plant diseases based on images.
  A farmer will upload an image of their crop, and you will provide a diagnosis and preliminary advice.

  Analyze the following image and provide a diagnosis and advice:
  {{media url=photoDataUri}}

  Format your response as follows:
  Diagnosis: [diagnosis of the plant disease]
  Advice: [preliminary advice for addressing the identified disease]
  `,
});

const imageBasedDiseaseDetectionFlow = ai.defineFlow(
  {
    name: 'imageBasedDiseaseDetectionFlow',
    inputSchema: ImageBasedDiseaseDetectionInputSchema,
    outputSchema: ImageBasedDiseaseDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
