import { z } from 'zod';

// Location schema
export const locationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().optional(),
  country: z.string().optional(),
});

// Route selection schema
export const routeSelectionSchema = z.object({
  from: locationSchema,
  to: locationSchema,
  distance: z.number().positive('Distance must be positive'),
  estimatedDuration: z.number().positive('Duration must be positive'),
});

// Vehicle selection schema
export const vehicleSelectionSchema = z.object({
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  vehicleName: z.string().min(1, 'Vehicle name is required'),
  category: z.enum(['business', 'executive', 'luxury']),
  capacity: z.number().positive('Capacity must be positive'),
  basePrice: z.number().positive('Price must be positive'),
});

// Date and time schema
export const dateTimeSchema = z.object({
  date: z.string().refine((val) => {
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'Date cannot be in the past'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
  timeZone: z.string().default('Asia/Hong_Kong'),
});

// Contact information schema
export const contactInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required').regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  wechatId: z.string().optional(),
  specialRequests: z.string().max(500, 'Special requests cannot exceed 500 characters').optional(),
});

// Passenger information schema
export const passengerInfoSchema = z.object({
  adultCount: z.number().min(1, 'At least one adult passenger is required').max(8, 'Maximum 8 passengers allowed'),
  childCount: z.number().min(0).max(4, 'Maximum 4 children allowed'),
  infantCount: z.number().min(0).max(2, 'Maximum 2 infants allowed'),
  luggageCount: z.number().min(0).max(10, 'Maximum 10 pieces of luggage allowed'),
});

// Pricing schema
export const pricingSchema = z.object({
  basePrice: z.number().positive('Base price must be positive'),
  distancePrice: z.number().min(0, 'Distance price cannot be negative'),
  timePrice: z.number().min(0, 'Time price cannot be negative'),
  surcharges: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).default([]),
  discounts: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).default([]),
  subtotal: z.number().positive('Subtotal must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative'),
  total: z.number().positive('Total amount must be positive'),
  currency: z.string().default('HKD'),
});

// Complete booking schema
export const bookingSchema = z.object({
  route: routeSelectionSchema,
  vehicle: vehicleSelectionSchema,
  dateTime: dateTimeSchema,
  contact: contactInfoSchema,
  passengers: passengerInfoSchema,
  pricing: pricingSchema,
  paymentMethod: z.enum(['card', 'cash', 'wechat', 'alipay']),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
  marketingOptIn: z.boolean().default(false),
});

// Quick booking schema (simplified)
export const quickBookingSchema = z.object({
  fromAddress: z.string().min(1, 'Pickup location is required'),
  toAddress: z.string().min(1, 'Destination is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  vehicleType: z.enum(['business', 'executive', 'luxury']).optional(),
});

// Booking update schema
export const bookingUpdateSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  dateTime: dateTimeSchema.optional(),
  contact: contactInfoSchema.partial().optional(),
  specialRequests: z.string().max(500).optional(),
});

// Price estimate schema
export const priceEstimateSchema = z.object({
  from: locationSchema,
  to: locationSchema,
  vehicleType: z.enum(['business', 'executive', 'luxury']),
  date: z.string(),
  time: z.string().optional(),
  passengerCount: z.number().min(1).max(8),
});

// Types derived from schemas
export type LocationData = z.infer<typeof locationSchema>;
export type RouteSelectionData = z.infer<typeof routeSelectionSchema>;
export type VehicleSelectionData = z.infer<typeof vehicleSelectionSchema>;
export type DateTimeData = z.infer<typeof dateTimeSchema>;
export type ContactInfoData = z.infer<typeof contactInfoSchema>;
export type PassengerInfoData = z.infer<typeof passengerInfoSchema>;
export type PricingData = z.infer<typeof pricingSchema>;
export type BookingData = z.infer<typeof bookingSchema>;
export type QuickBookingData = z.infer<typeof quickBookingSchema>;
export type BookingUpdateData = z.infer<typeof bookingUpdateSchema>;
export type PriceEstimateData = z.infer<typeof priceEstimateSchema>;