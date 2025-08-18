'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, AlertCircle, Calendar } from 'lucide-react';
import { LicenseType } from '@prisma/client';

interface LicenseFormData {
  licenseType: LicenseType;
  licenseNumber: string;
  issuingAuthority: string;
  startDate: string;
  expiryDate: string;
  fileUrl?: string;
  fileName?: string;
  notes?: string;
}

interface FormState {
  success?: boolean;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
  license?: any;
}

const initialFormData: LicenseFormData = {
  licenseType: LicenseType.COMMERCIAL_DRIVING,
  licenseNumber: '',
  issuingAuthority: '',
  startDate: '',
  expiryDate: '',
  fileUrl: '',
  fileName: '',
  notes: '',
};

const licenseTypeOptions = [
  { value: LicenseType.COMMERCIAL_DRIVING, label: 'Commercial Driving' },
  { value: LicenseType.INTERNATIONAL_DRIVING, label: 'International Driving' },
  { value: LicenseType.CHAUFFEUR_LICENSE, label: 'Chauffeur License' },
  { value: LicenseType.PASSENGER_ENDORSEMENT, label: 'Passenger Endorsement' },
  { value: LicenseType.HAZMAT_ENDORSEMENT, label: 'Hazmat Endorsement' },
  { value: LicenseType.MOTORCYCLE_LICENSE, label: 'Motorcycle License' },
  { value: LicenseType.HEAVY_VEHICLE_LICENSE, label: 'Heavy Vehicle License' },
  { value: LicenseType.CROSS_BORDER_DRIVING, label: 'Cross-Border Driving' },
  { value: LicenseType.TAXI_LICENSE, label: 'Taxi License' },
  { value: LicenseType.BUS_LICENSE, label: 'Bus License' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Adding License...' : 'Add License'}
    </Button>
  );
}

async function createLicenseAction(vehicleId: string) {
  return async function(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
    try {
      const licenseData = {
        licenseType: formData.get('licenseType') as LicenseType,
        licenseNumber: formData.get('licenseNumber') as string,
        issuingAuthority: formData.get('issuingAuthority') as string,
        startDate: formData.get('startDate') as string,
        expiryDate: formData.get('expiryDate') as string,
        fileUrl: formData.get('fileUrl') as string || undefined,
        fileName: formData.get('fileName') as string || undefined,
        notes: formData.get('notes') as string || undefined,
      };

      const response = await fetch(`/api/drivers/vehicles/${vehicleId}/licenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(licenseData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.error || 'Failed to add license',
        };
      }

      return {
        success: true,
        message: 'License added successfully!',
        license: result.license,
      };
    } catch (error) {
      console.error('Error creating license:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  };
}

export default function LicenseForm({ 
  vehicleId, 
  onSuccess, 
  onCancel 
}: { 
  vehicleId: string;
  onSuccess?: (license: any) => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<LicenseFormData>(initialFormData);
  const [state, formAction, pending] = useActionState(createLicenseAction(vehicleId), undefined);

  const handleInputChange = (name: keyof LicenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle successful form submission
  if (state?.success && onSuccess && state.license) {
    onSuccess(state.license);
  }

  // Calculate days until expiry for visual feedback
  const getDaysUntilExpiry = () => {
    if (!formData.expiryDate) return null;
    const today = new Date();
    const expiry = new Date(formData.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Add Vehicle License
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {/* Status Alert */}
          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* License Type */}
          <div>
            <Label htmlFor="licenseType">License Type *</Label>
            <Select 
              name="licenseType" 
              value={formData.licenseType} 
              onValueChange={(value) => handleInputChange('licenseType', value as LicenseType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select license type" />
              </SelectTrigger>
              <SelectContent>
                {licenseTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* License Number and Issuing Authority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter license number"
                required
              />
            </div>
            <div>
              <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
              <Input
                id="issuingAuthority"
                name="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={(e) => handleInputChange('issuingAuthority', e.target.value)}
                placeholder="e.g., Transport Department"
                required
              />
            </div>
          </div>

          {/* Start Date and Expiry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="expiryDate" className="flex items-center gap-2">
                Expiry Date *
                <Calendar className="h-4 w-4" />
              </Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                required
              />
              {daysUntilExpiry !== null && (
                <div className={`text-xs mt-1 ${
                  daysUntilExpiry < 0 ? 'text-red-600' : 
                  daysUntilExpiry <= 30 ? 'text-orange-600' : 
                  'text-green-600'
                }`}>
                  {daysUntilExpiry < 0 
                    ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                    : daysUntilExpiry === 0 
                    ? 'Expires today'
                    : `Expires in ${daysUntilExpiry} days`
                  }
                </div>
              )}
            </div>
          </div>

          {/* Document Upload (Optional) */}
          <div>
            <Label htmlFor="fileUrl">Document URL (Optional)</Label>
            <Input
              id="fileUrl"
              name="fileUrl"
              type="url"
              value={formData.fileUrl}
              onChange={(e) => handleInputChange('fileUrl', e.target.value)}
              placeholder="https://example.com/license-document.pdf"
            />
          </div>

          <div>
            <Label htmlFor="fileName">Document File Name (Optional)</Label>
            <Input
              id="fileName"
              name="fileName"
              value={formData.fileName}
              onChange={(e) => handleInputChange('fileName', e.target.value)}
              placeholder="license-document.pdf"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or comments about this license..."
              rows={3}
            />
          </div>

          {/* Expiry Warning */}
          {daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This license will expire in {daysUntilExpiry} days. Consider renewing it soon.
              </AlertDescription>
            </Alert>
          )}

          {daysUntilExpiry !== null && daysUntilExpiry < 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This license has already expired. You should not add an expired license unless for record-keeping purposes.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <div className="flex-1">
              <SubmitButton />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}