'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseModal } from '@/components/ui/modals/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { VehicleType } from '@prisma/client';
import { addVehicleAction } from '@/app/actions/vehicle';
import { validateVehiclePhotos } from '@/lib/utils/vehicleValidation';
import { DynamicDataService } from '@/lib/services/dynamic-data-service';
import type { DynamicListItem } from '@/lib/services/dynamic-data-service';

interface IconProps {
    className?: string;
}

// Icons
const CarIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
  </svg>
);

const CheckListIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
  </svg>
);

const PhotoIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
  </svg>
);

const UploadIcon: React.FC<IconProps> = ({className}) => (
  <svg className="h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

// Types
export interface VehicleFormData {
  // Basic Information
  make: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
  vin?: string;
  
  // Classification
  vehicleType: VehicleType;
  capacity: string;
  fuelType?: string;
  
  // Features & Equipment
  features: string[];
  specialEquipment: string[];
  
  // Documentation
  insuranceExpiry: string;
  inspectionExpiry: string;
  
  // Photos
  photos: File[];
}


interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (vehicle: any) => void;
}

interface StepProps {
  data: VehicleFormData;
  onChange: (data: Partial<VehicleFormData>) => void;
  errors?: { [key: string]: string[] };
}

// Constants
const STEPS = [
  { id: 1, title: 'Basic Information', icon: CarIcon },
  { id: 2, title: 'Classification', icon: SettingsIcon },
  { id: 3, title: 'Features & Equipment', icon: CheckListIcon },
  { id: 4, title: 'Documentation', icon: CalendarIcon },
  { id: 5, title: 'Photos', icon: PhotoIcon },
];

// Dynamic data will be loaded from API
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

// Initial form data
const initialFormData: VehicleFormData = {
  make: '',
  model: '',
  year: '',
  color: '',
  plateNumber: '',
  vin: '',
  vehicleType: VehicleType.BUSINESS,
  capacity: '',
  fuelType: '',
  features: [],
  specialEquipment: [],
  insuranceExpiry: '',
  inspectionExpiry: '',
  photos: [],
};

// Step 1: Basic Information
function BasicInformationStep({ data, onChange, errors, dynamicData }: StepProps & { dynamicData: DynamicData }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
        <CarIcon />
        <span className="ml-2">Basic Vehicle Information</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Vehicle Make *"
          name="make"
          value={data.make}
          onChange={(e) => onChange({ make: e.target.value })}
          placeholder="e.g., Toyota, Ford, BMW"
          error={errors?.make?.[0]}
        />
        
        <Input
          label="Vehicle Model *"
          name="model"
          value={data.model}
          onChange={(e) => onChange({ model: e.target.value })}
          placeholder="e.g., Camry, F-150, X3"
          error={errors?.model?.[0]}
        />
        
        <Input
          label="Year *"
          name="year"
          type="number"
          min="1900"
          max="2030"
          value={data.year}
          onChange={(e) => onChange({ year: e.target.value })}
          placeholder="2024"
          error={errors?.year?.[0]}
        />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-charcoal">Color *</label>
          <Select value={data.color} onValueChange={(value) => onChange({ color: value })}>
            <SelectTrigger className="min-h-[44px]">
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
          {errors?.color && <p className="text-sm text-red-600" role="alert">{errors.color[0]}</p>}
        </div>
        
        <Input
          label="License Plate *"
          name="plateNumber"
          value={data.plateNumber}
          onChange={(e) => onChange({ plateNumber: e.target.value.toUpperCase() })}
          placeholder="ABC-1234"
          error={errors?.plateNumber?.[0]}
          className="uppercase"
        />
        
        <Input
          label="VIN (Optional)"
          name="vin"
          value={data.vin}
          maxLength={17}
          onChange={(e) => onChange({ vin: e.target.value.toUpperCase() })}
          placeholder="17-character VIN"
          className="uppercase"
        />
      </div>
    </div>
  );
}

// Step 2: Classification
function ClassificationStep({ data, onChange, errors, dynamicData }: StepProps & { dynamicData: DynamicData }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
        <SettingsIcon />
        <span className="ml-2">Vehicle Classification</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-charcoal">Vehicle Type *</label>
          <Select value={data.vehicleType} onValueChange={(value) => onChange({ vehicleType: value as VehicleType })}>
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VehicleType.BUSINESS}>Business</SelectItem>
              <SelectItem value={VehicleType.EXECUTIVE}>Executive</SelectItem>
              <SelectItem value={VehicleType.LUXURY}>Luxury</SelectItem>
              <SelectItem value={VehicleType.SUV}>SUV</SelectItem>
              <SelectItem value={VehicleType.VAN}>Van</SelectItem>
            </SelectContent>
          </Select>
          {errors?.vehicleType && <p className="text-sm text-red-600" role="alert">{errors.vehicleType[0]}</p>}
        </div>
        
        <Input
          label="Passenger Capacity *"
          name="capacity"
          type="number"
          min="1"
          max="50"
          value={data.capacity}
          onChange={(e) => onChange({ capacity: e.target.value })}
          placeholder="4"
          error={errors?.capacity?.[0]}
        />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-charcoal">Fuel Type</label>
          <Select value={data.fuelType} onValueChange={(value) => onChange({ fuelType: value })}>
            <SelectTrigger className="min-h-[44px]">
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
      </div>
    </div>
  );
}

// Step 3: Features & Equipment
function FeaturesEquipmentStep({ data, onChange, dynamicData }: StepProps & { dynamicData: DynamicData }) {
  const toggleFeature = (feature: string) => {
    const newFeatures = data.features.includes(feature)
      ? data.features.filter(f => f !== feature)
      : [...data.features, feature];
    onChange({ features: newFeatures });
  };

  const toggleEquipment = (equipment: string) => {
    const newEquipment = data.specialEquipment.includes(equipment)
      ? data.specialEquipment.filter(e => e !== equipment)
      : [...data.specialEquipment, equipment];
    onChange({ specialEquipment: newEquipment });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
        <CheckListIcon />
        <span className="ml-2">Features & Equipment</span>
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Vehicle Features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dynamicData.vehicleFeatures.map(feature => (
              <label key={feature.key} className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.features.includes(feature.value || feature.key)}
                  onChange={() => toggleFeature(feature.value || feature.key)}
                  className="w-4 h-4 text-[#FF69B4] border-gray-300 rounded focus:ring-[#FF69B4]"
                />
                <div className="flex items-center space-x-1">
                  {feature.icon && <span>{feature.icon}</span>}
                  <span>{feature.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Special Equipment</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dynamicData.specialEquipment.map(equipment => (
              <label key={equipment.key} className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.specialEquipment.includes(equipment.value || equipment.key)}
                  onChange={() => toggleEquipment(equipment.value || equipment.key)}
                  className="w-4 h-4 text-[#FF69B4] border-gray-300 rounded focus:ring-[#FF69B4]"
                />
                <div className="flex items-center space-x-1">
                  {equipment.icon && <span>{equipment.icon}</span>}
                  <span>{equipment.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Documentation
function DocumentationStep({ data, onChange, errors }: StepProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
        <CalendarIcon />
        <span className="ml-2">Required Documentation</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Insurance Expiry Date *"
          name="insuranceExpiry"
          type="date"
          value={data.insuranceExpiry}
          onChange={(e) => onChange({ insuranceExpiry: e.target.value })}
          error={errors?.insuranceExpiry?.[0]}
        />
        
        <Input
          label="Inspection Expiry Date *"
          name="inspectionExpiry"
          type="date"
          value={data.inspectionExpiry}
          onChange={(e) => onChange({ inspectionExpiry: e.target.value })}
          error={errors?.inspectionExpiry?.[0]}
        />
      </div>
    </div>
  );
}

// Step 5: Photos
function PhotosStep({ data, onChange }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate photos before adding
    const validationErrors = validateVehiclePhotos(files);
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }
    
    onChange({ photos: [...data.photos, ...files] });
  };

  const removePhoto = (index: number) => {
    const newPhotos = data.photos.filter((_, i) => i !== index);
    onChange({ photos: newPhotos });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
        <PhotoIcon />
        <span className="ml-2">Vehicle Photos</span>
      </h3>
      
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF69B4] transition-colors cursor-pointer"
        onClick={handleUploadClick}
      >
        <UploadIcon className="mx-auto text-gray-400" />
        <div className="mt-4">
          <span className="mt-2 block text-sm font-medium text-charcoal">Upload vehicle photos</span>
          <span className="mt-1 block text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">Recommended: Front, Back, Sides, Interior</p>
      </div>

      {/* Photo Previews */}
      {data.photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.photos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Vehicle photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                aria-label={`Remove photo ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Component
export default function AddVehicleModal({ isOpen, onClose, onSuccess }: AddVehicleModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [state, formAction] = useActionState(addVehicleAction, undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicData, setDynamicData] = useState<DynamicData>(initialDynamicData);
  const [dataLoading, setDataLoading] = useState(true);

  const totalSteps = STEPS.length;
  const progress = (currentStep / totalSteps) * 100;

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

    if (isOpen) {
      loadDynamicData();
    }
  }, [isOpen]);

  const handleDataChange = useCallback((data: Partial<VehicleFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create FormData for submission
      const submitData = new FormData();
      
      // Append basic data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'features' || key === 'specialEquipment') {
          (value as string[]).forEach(item => submitData.append(key, item));
        } else if (key === 'photos') {
          (value as File[]).forEach(file => submitData.append(key, file));
        } else if (value) {
          submitData.append(key, String(value));
        }
      });

      formAction(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.make && formData.model && formData.year && formData.color && formData.plateNumber;
      case 2:
        return formData.vehicleType && formData.capacity;
      case 3:
        return true; // Features are optional
      case 4:
        return formData.insuranceExpiry && formData.inspectionExpiry;
      case 5:
        return true; // Photos are optional but recommended
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    if (dataLoading) {
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-[#FF69B4] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      );
    }

    const stepProps = {
      data: formData,
      onChange: handleDataChange,
      errors: state?.errors,
      dynamicData,
    };

    switch (currentStep) {
      case 1:
        return <BasicInformationStep {...stepProps} />;
      case 2:
        return <ClassificationStep {...stepProps} />;
      case 3:
        return <FeaturesEquipmentStep {...stepProps} />;
      case 4:
        return <DocumentationStep {...stepProps} />;
      case 5:
        return <PhotosStep {...stepProps} />;
      default:
        return null;
    }
  };

  // Handle successful submission
  React.useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess(state.vehicle);
      handleClose();
    }
  }, [state?.success, onSuccess]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Vehicle"
      description="Register a new vehicle for cross-border transportation"
      size="xl"
      className="max-h-[90vh]"
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#FF69B4] font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-gray-500">{STEPS[currentStep - 1]?.title}</span>
          </div>
          <ProgressBar value={progress} color="hot-pink" size="sm" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const IconComponent = step.icon;

            return (
              <motion.div
                key={step.id}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive && 'bg-[#FF69B4] text-white',
                  isCompleted && 'bg-green-100 text-green-700',
                  !isActive && !isCompleted && 'bg-gray-100 text-gray-500'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent />
                <span className="hidden md:inline">{step.title}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Error Message */}
        {state?.message && !state.success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{state.message}</p>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || dataLoading}
          >
            Save as Draft
          </Button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={isLoading || dataLoading}
              >
                Previous
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoading || dataLoading}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading || dataLoading}
                isLoading={isLoading}
                leftIcon={<PlusIcon />}
              >
                Add Vehicle
              </Button>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}