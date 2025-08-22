'use client';

import { useState, useEffect } from 'react';
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
import { DynamicDataService } from '@/lib/services/dynamic-data-service';
import type { DynamicListItem } from '@/lib/services/dynamic-data-service';

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

interface DynamicData {
  vehicleFeatures: DynamicListItem[];
  specialEquipment: DynamicListItem[];
  colors: DynamicListItem[];
  fuelTypes: DynamicListItem[];
}

const initialDynamicData: DynamicData = {
  vehicleFeatures: [],
  specialEquipment: [],
  colors: [],
  fuelTypes: [],
};

function SubmitButton({ dataLoading }: { dataLoading: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending || dataLoading}>
      {pending ? 'Creating Vehicle...' : dataLoading ? 'Loading Data...' : 'Create Vehicle'}
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
  const [dynamicData, setDynamicData] = useState<DynamicData>(initialDynamicData);
  const [dataLoading, setDataLoading] = useState(true);

  // Load dynamic data on component mount
  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        setDataLoading(true);
        
        const [vehicleFeatures, specialEquipment, colors, fuelTypes] = await Promise.all([
          DynamicDataService.getListItems('VEHICLE_FEATURES'),
          DynamicDataService.getListItems('SPECIAL_EQUIPMENT'),
          DynamicDataService.getListItems('COLORS'),
          DynamicDataService.getListItems('FUEL_TYPES'),
        ]);
        
        setDynamicData({
          vehicleFeatures,
          specialEquipment,
          colors,
          fuelTypes,
        });
      } catch (error) {
        console.error('Error loading dynamic data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadDynamicData();
  }, []);

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
              <Select name="color" value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {dynamicData.colors.map(color => (
                    <SelectItem key={color.key} value={color.value || color.key}>
                      <div className="flex items-center space-x-2">
                        {color.color && (
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.color }}
                          />
                        )}
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {dynamicData.fuelTypes.map(fuel => (
                  <SelectItem key={fuel.key} value={fuel.value || fuel.key}>
                    <div className="flex items-center space-x-2">
                      {fuel.icon && <span>{fuel.icon}</span>}
                      <span>{fuel.label}</span>
                    </div>
                  </SelectItem>
                ))}
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
          {dataLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-[#FF69B4] border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading features...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {dynamicData.vehicleFeatures.map(feature => {
                const featureValue = feature.value || feature.key;
                return (
                  <div
                    key={feature.key}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.features.includes(featureValue)
                        ? 'bg-pink-50 border-pink-500 text-pink-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleArrayItem('features', featureValue)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {feature.icon && <span className="text-sm">{feature.icon}</span>}
                        <span className="text-sm">{feature.label}</span>
                      </div>
                      {formData.features.includes(featureValue) && (
                        <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Special Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-[#FF69B4] border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading equipment...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {dynamicData.specialEquipment.map(equipment => {
                const equipmentValue = equipment.value || equipment.key;
                return (
                  <div
                    key={equipment.key}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.specialEquipment.includes(equipmentValue)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleArrayItem('specialEquipment', equipmentValue)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {equipment.icon && <span className="text-sm">{equipment.icon}</span>}
                        <span className="text-sm">{equipment.label}</span>
                      </div>
                      {formData.specialEquipment.includes(equipmentValue) && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
        <SubmitButton dataLoading={dataLoading} />
      </div>
    </form>
  );
}