'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCropAnalysis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { CropAnalysisOutput } from '@/ai/flows/crop-analysis';
import { Loader2, CalendarDays, Droplets, Mountain, DollarSign, TrendingUp, LucideProps } from 'lucide-react';
import { findImage } from '@/lib/placeholder-images';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '../ui/badge';

type CropInfoItemProps = {
  icon: React.ElementType<LucideProps>;
  label: string;
  value: string | undefined;
}

const CropInfoItem = ({ icon: Icon, label, value }: CropInfoItemProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center">
      <Icon className="mr-2 h-4 w-4 text-primary" />
      <div>
        <p className="font-semibold">{t(label)}</p>
        <p className="text-muted-foreground">{value ? t(value) : t('N/A')}</p>
      </div>
    </div>
  );
};

type CropCardProps = {
  crop: CropAnalysisOutput['crops'][0];
}

const CropCard = ({ crop }: CropCardProps) => {
  const { t } = useTranslation();
  const placeholderImage = findImage(crop.name);
  const imageUrl = placeholderImage?.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(crop.name)}/600/400`;

  const getDemandBadgeVariant = (demand: string) => {
    switch (demand?.toLowerCase()) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden">
      <div className="md:w-1/3">
        <Image
          src={imageUrl}
          alt={`Image of ${t(crop.name)}`}
          width={600}
          height={400}
          className="rounded-t-lg md:rounded-l-lg md:rounded-t-none object-cover w-full h-full aspect-[3/2] md:aspect-auto"
          data-ai-hint={crop.imageDescription}
        />
      </div>
      <div className="md:w-2/3 flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{t(crop.name)}</CardTitle>
            <Badge variant={getDemandBadgeVariant(crop.marketDemand)}>
              <TrendingUp className="mr-1 h-3 w-3" />
              {t(crop.marketDemand)} {t('Demand')}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground pt-1">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>{t(crop.productionMonths)}</span>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm flex-grow">
          <CropInfoItem icon={Droplets} label="Water Needs" value={crop.waterNeeds} />
          <CropInfoItem icon={Mountain} label="Soil" value={crop.soilPreference} />
          <div className="col-span-2">
            <CropInfoItem icon={DollarSign} label="Market Price" value={crop.marketPrice} />
          </div>
        </CardContent>
      </div>
    </Card>
  );
};


export function CropAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CropAnalysisOutput | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  async function handleGetAnalysis() {
    setIsLoading(true);
    setResult(null);

    const { data, error } = await getCropAnalysis();

    if (error) {
      toast({
        title: t('Error'),
        description: t(error),
        variant: 'destructive',
      });
    } else {
      setResult(data);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    if (!result) {
      handleGetAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('Crop Production Analysis')}</CardTitle>
          <CardDescription>
            {t('A list of common crops, their production months, and market data.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGetAnalysis}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('Refresh Crop Analysis')}
          </Button>
        </CardContent>
      </Card>

      {isLoading && !result && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('Fetching crop analysis...')}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>{t('Crop Data')}</CardTitle>
            <CardDescription>
              {t('A list of common crops with their production and market details.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {result.crops.map((crop, index) => (
                <CropCard key={index} crop={crop} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
