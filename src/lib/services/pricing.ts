import { VehicleType } from '@prisma/client';

interface Location {
  address: string;
  lat: number;
  lng: number;
  type: 'HK' | 'CHINA';
}

interface PricingRequest {
  pickup: Location;
  dropoff: Location;
  vehicleType: string;
  scheduledDate: Date;
}

interface PricingResult {
  basePrice: number;
  surcharges: {
    borderFee?: number;
    peakHour?: number;
    distanceSurcharge?: number;
    timeSurcharge?: number;
  };
  totalPrice: number;
  distance: number;
  estimatedDuration: number;
}

// Base pricing per vehicle type (HKD per km)
const VEHICLE_RATES = {
  BUSINESS: 12,
  EXECUTIVE: 18,
  LUXURY: 25,
  SUV: 20,
  VAN: 15,
};

// Surcharge rates
const SURCHARGES = {
  BORDER_FEE: 200, // Fixed border crossing fee
  PEAK_HOUR_MULTIPLIER: 1.3, // 30% increase during peak hours
  DISTANCE_THRESHOLD: 50, // km
  LONG_DISTANCE_RATE: 0.8, // 20% discount for long distances
  NIGHT_SURCHARGE: 100, // 10 PM - 6 AM
  WEEKEND_SURCHARGE: 50, // Saturday & Sunday
};

export async function calculateBookingPrice(request: PricingRequest): Promise<PricingResult> {
  try {
    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      request.pickup.lat,
      request.pickup.lng,
      request.dropoff.lat,
      request.dropoff.lng
    );

    // Estimate duration (average 40 km/h including border crossing)
    let estimatedDuration = Math.round((distance / 40) * 60); // minutes
    
    // Add border crossing time if cross-border trip
    const isCrossBorder = request.pickup.type !== request.dropoff.type;
    if (isCrossBorder) {
      estimatedDuration += 60; // Add 1 hour for border crossing
    }

    // Calculate base price
    const rate = VEHICLE_RATES[request.vehicleType as keyof typeof VEHICLE_RATES] || VEHICLE_RATES.BUSINESS;
    let basePrice = distance * rate;

    // Calculate surcharges
    const surcharges: any = {};
    let totalSurcharge = 0;

    // Border crossing fee
    if (isCrossBorder) {
      surcharges.borderFee = SURCHARGES.BORDER_FEE;
      totalSurcharge += SURCHARGES.BORDER_FEE;
    }

    // Peak hour surcharge (7-9 AM, 5-7 PM on weekdays)
    const hour = request.scheduledDate.getHours();
    const day = request.scheduledDate.getDay();
    const isPeakHour = (day >= 1 && day <= 5) && 
      ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19));

    if (isPeakHour) {
      const peakSurcharge = basePrice * (SURCHARGES.PEAK_HOUR_MULTIPLIER - 1);
      surcharges.peakHour = peakSurcharge;
      totalSurcharge += peakSurcharge;
    }

    // Long distance discount
    if (distance > SURCHARGES.DISTANCE_THRESHOLD) {
      const discountAmount = basePrice * (1 - SURCHARGES.LONG_DISTANCE_RATE);
      surcharges.distanceSurcharge = -discountAmount;
      totalSurcharge -= discountAmount;
    }

    // Night surcharge (10 PM - 6 AM)
    if (hour >= 22 || hour <= 6) {
      surcharges.timeSurcharge = SURCHARGES.NIGHT_SURCHARGE;
      totalSurcharge += SURCHARGES.NIGHT_SURCHARGE;
    }

    // Weekend surcharge
    if (day === 0 || day === 6) {
      surcharges.timeSurcharge = (surcharges.timeSurcharge || 0) + SURCHARGES.WEEKEND_SURCHARGE;
      totalSurcharge += SURCHARGES.WEEKEND_SURCHARGE;
    }

    const totalPrice = Math.round(basePrice + totalSurcharge);

    return {
      basePrice: Math.round(basePrice),
      surcharges,
      totalPrice,
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      estimatedDuration,
    };
  } catch (error) {
    console.error('Pricing calculation error:', error);
    throw new Error('Failed to calculate pricing');
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

// Get price estimate for frontend
export async function getPriceEstimate(
  pickup: Location,
  dropoff: Location,
  vehicleType: string
): Promise<{ minPrice: number; maxPrice: number; distance: number }> {
  const baseRequest: PricingRequest = {
    pickup,
    dropoff,
    vehicleType,
    scheduledDate: new Date(), // Use current time as baseline
  };

  // Calculate base price
  const baseResult = await calculateBookingPrice(baseRequest);

  // Calculate price range (considering potential surcharges)
  const minPrice = baseResult.basePrice;
  const maxPrice = Math.round(baseResult.basePrice * 1.5); // 50% markup for peak times

  return {
    minPrice,
    maxPrice,
    distance: baseResult.distance,
  };
}