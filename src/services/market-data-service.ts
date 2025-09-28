'use server';

import marketData from '@/lib/market-data.json';

const cropPrices: Record<string, string> = marketData.prices;

export async function getMarketPrice(cropName: string): Promise<string> {
  const price = cropPrices[cropName.toLowerCase().replace(/ /g, '_')];
  return price || 'Not available';
}
