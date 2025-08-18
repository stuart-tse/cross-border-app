import { NextRequest, NextResponse } from 'next/server';
import { getPriceEstimate } from '@/lib/services/pricing';
import { z } from 'zod';

const estimateSchema = z.object({
  pickup: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    type: z.enum(['HK', 'CHINA']),
  }),
  dropoff: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    type: z.enum(['HK', 'CHINA']),
  }),
  vehicleType: z.enum(['BUSINESS', 'EXECUTIVE', 'LUXURY', 'SUV', 'VAN']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = estimateSchema.parse(body);

    const { pickup, dropoff, vehicleType } = validatedData;

    const estimate = await getPriceEstimate(pickup, dropoff, vehicleType);

    // Add additional details
    const isCrossBorder = pickup.type !== dropoff.type;
    const estimatedTime = Math.round((estimate.distance / 40) * 60); // minutes
    const borderTime = isCrossBorder ? 60 : 0; // additional border crossing time

    return NextResponse.json({
      pricing: {
        minPrice: estimate.minPrice,
        maxPrice: estimate.maxPrice,
        currency: 'HKD',
        priceRange: `HK$${estimate.minPrice} - HK$${estimate.maxPrice}`,
      },
      journey: {
        distance: estimate.distance,
        estimatedDuration: estimatedTime + borderTime,
        isCrossBorder,
        borderCrossingTime: borderTime,
      },
      breakdown: {
        baseRate: `HK$${Math.round(estimate.minPrice / estimate.distance)}/km`,
        borderFee: isCrossBorder ? 'HK$200' : 'N/A',
        surcharges: 'Peak hours +30%, Night +HK$100, Weekend +HK$50',
      },
      recommendations: {
        bestTime: isCrossBorder 
          ? 'Avoid peak hours (7-9 AM, 5-7 PM) for faster border crossing'
          : 'Off-peak hours recommended for better rates',
        notes: [
          'Prices may vary based on real-time demand',
          'Additional waiting time charges may apply',
          isCrossBorder ? 'Valid travel documents required for border crossing' : '',
        ].filter(Boolean),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Price estimation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}