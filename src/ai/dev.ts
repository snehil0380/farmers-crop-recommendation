import { config } from 'dotenv';
config();

import '@/ai/flows/ai-crop-suggestions.ts';
import '@/ai/flows/image-based-disease-detection.ts';
import '@/ai/flows/crop-analysis.ts';
import '@/ai/flows/translate-text.ts';
import '@/services/market-data-service.ts';
