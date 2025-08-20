'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Upload, Plus, X, AlertCircle } from 'lucide-react';
import { VehicleType } from '@prisma/client';

interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
  vin?: string;
  vehicleType: VehicleType;
  capacity: string;
  features: string[];
  fuelType?: string;
  specialEquipment: string[];
  insuranceExpiry: string;
  inspectionExpiry: string;
  photos: string[];
}

interface FormState {
  success?: boolean;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
  vehicle?: any;
}

const initialFormData: VehicleFormData = {
  make: '',
  model: '',
  year: '',
  color: '',
  plateNumber: '',
  vin: '',
  vehicleType: VehicleType.BUSINESS,
  capacity: '',
  features: [],
  fuelType: '',
  specialEquipment: [],
  insuranceExpiry: '',
  inspectionExpiry: '',
  photos: [],
};

const vehicleFeatures = [
  'Air Conditioning',
  'GPS Navigation',
  'Bluetooth',
  'Wi-Fi',
  'USB Charging',
  'Leather Seats',
  'Sunroof',
  'Backup Camera',
  'Lane Assist',
  'Cruise Control',
  'Premium Sound',
  'Child Safety Locks',
];

const specialEquipmentOptions = [
  'Wheelchair Accessible',
  'Child Car Seats',
  'Cargo Rack',
  'Bike Rack',
  'Trailer Hitch',
  'Snow Chains',
  'Emergency Kit',
  'Fire Extinguisher',
  'First Aid Kit',
  'Extra Luggage Space',
];

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Vehicle...' : 'Create Vehicle'}
    </Button>
  );
}

async function createVehicleAction(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  try {
    const vehicleData = {
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: formData.get('year') as string,
      color: formData.get('color') as string,
      plateNumber: formData.get('plateNumber') as string,
      vin: formData.get('vin') as string || undefined,
      vehicleType: formData.get('vehicleType') as VehicleType,
      capacity: formData.get('capacity') as string,
      features: formData.getAll('features') as string[],
      fuelType: formData.get('fuelType') as string || undefined,
      specialEquipment: formData.getAll('specialEquipment') as string[],
      insuranceExpiry: formData.get('insuranceExpiry') as string,
      inspectionExpiry: formData.get('inspectionExpiry') as string,
      photos: formData.getAll('photos') as string[],
    };

    const response = await fetch('/api/drivers/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || 'Failed to create vehicle',
      };
    }

    return {
      success: true,
      message: 'Vehicle created successfully!',
      vehicle: result.vehicle,
    };
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

export default function VehicleRegistrationForm({ onSuccess }: { onSuccess?: (vehicle: any) => void }) {
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [state, formAction, pending] = useActionState(createVehicleAction, undefined);

  const handleInputChange = (name: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleArrayItem = (array: keyof VehicleFormData, item: string) => {
    setFormData(prev => ({
      ...prev,
      [array]: (prev[array] as string[]).includes(item)
        ? (prev[array] as string[]).filter(i => i !== item)
        : [...(prev[array] as string[]), item]
    }));
  };

  // Handle successful form submission
  if (state?.success && onSuccess && state.vehicle) {
    onSuccess(state.vehicle);
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden inputs for arrays */}
      {formData.features.map(feature => (
        <input key={feature} type="hidden" name="features" value={feature} />
      ))}
      {formData.specialEquipment.map(equipment => (
        <input key={equipment} type="hidden" name="specialEquipment" value={equipment} />
      ))}
      
      {/* Status Alert */}
      {state?.message && (
        <Alert variant={state.success ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Basic Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Basic Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                name="make"
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                placeholder="e.g., Toyota, Mercedes-Benz"
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., Camry, S-Class"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                placeholder="2020"
                min="1990"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            <div>
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="e.g., Black, White, Silver"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plateNumber">License Plate *</Label>
              <Input
                id="plateNumber"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => handleInputChange('plateNumber', e.target.value.toUpperCase())}
                placeholder="ABC123"
                required
              />
            </div>
            <div>
              <Label htmlFor="vin">VIN (Optional)</Label>
              <Input
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                placeholder="17-character vehicle identification number"
                maxLength={17}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select name="vehicleType" value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value as VehicleType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VehicleType.BUSINESS}>Business</SelectItem>
                  <SelectItem value={VehicleType.EXECUTIVE}>Executive</SelectItem>
                  <SelectItem value={VehicleType.LUXURY}>Luxury</SelectItem>
                  <SelectItem value={VehicleType.SUV}>SUV</SelectItem>
                  <SelectItem value={VehicleType.VAN}>Van</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Passenger Capacity *</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="4"
                min="1"
                max="20"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fuelType">Fuel Type (Optional)</Label>
            <Select name="fuelType" value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gas">Gas</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Features */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {vehicleFeatures.map(feature => (
              <div
                key={feature}
                className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                  formData.features.includes(feature)
                    ? 'bg-pink-50 border-pink-500 text-pink-700'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => toggleArrayItem('features', feature)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{feature}</span>
                  {formData.features.includes(feature) && (
                    <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Special Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {specialEquipmentOptions.map(equipment => (
              <div
                key={equipment}
                className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                  formData.specialEquipment.includes(equipment)
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => toggleArrayItem('specialEquipment', equipment)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{equipment}</span>
                  {formData.specialEquipment.includes(equipment) && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legal Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="insuranceExpiry">Insurance Expiry Date *</Label>
              <Input
                id="insuranceExpiry"
                name="insuranceExpiry"
                type="date"
                value={formData.insuranceExpiry}
                onChange={(e) => handleInputChange('insuranceExpiry', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="inspectionExpiry">Inspection Expiry Date *</Label>
              <Input
                id="inspectionExpiry"
                name="inspectionExpiry"
                type="date"
                value={formData.inspectionExpiry}
                onChange={(e) => handleInputChange('inspectionExpiry', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}