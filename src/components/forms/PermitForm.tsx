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
import { FileText, AlertCircle, Upload, Calendar } from 'lucide-react';
import { PermitType } from '@prisma/client';

interface PermitFormData {
  permitType: PermitType;
  permitNumber: string;
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
  permit?: any;
}

const initialFormData: PermitFormData = {
  permitType: PermitType.CUSTOMS_PERMIT,
  permitNumber: '',
  issuingAuthority: '',
  startDate: '',
  expiryDate: '',
  fileUrl: '',
  fileName: '',
  notes: '',
};

const permitTypeOptions = [
  { value: PermitType.CUSTOMS_PERMIT, label: 'Customs Permit' },
  { value: PermitType.CROSS_BORDER_PERMIT, label: 'Cross-Border Permit' },
  { value: PermitType.TRANSIT_PERMIT, label: 'Transit Permit' },
  { value: PermitType.TEMPORARY_IMPORT, label: 'Temporary Import' },
  { value: PermitType.EXPORT_PERMIT, label: 'Export Permit' },
  { value: PermitType.SPECIAL_CARGO, label: 'Special Cargo' },
  { value: PermitType.OVERSIZE_LOAD, label: 'Oversize Load' },
  { value: PermitType.HAZMAT_PERMIT, label: 'Hazmat Permit' },
  { value: PermitType.PASSENGER_TRANSPORT, label: 'Passenger Transport' },
  { value: PermitType.COMMERCIAL_TRANSPORT, label: 'Commercial Transport' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Adding Permit...' : 'Add Permit'}
    </Button>
  );
}

async function createPermitAction(vehicleId: string) {
  return async function(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
    try {
      const permitData = {
        permitType: formData.get('permitType') as PermitType,
        permitNumber: formData.get('permitNumber') as string,
        issuingAuthority: formData.get('issuingAuthority') as string,
        startDate: formData.get('startDate') as string,
        expiryDate: formData.get('expiryDate') as string,
        fileUrl: formData.get('fileUrl') as string || undefined,
        fileName: formData.get('fileName') as string || undefined,
        notes: formData.get('notes') as string || undefined,
      };

      const response = await fetch(`/api/drivers/vehicles/${vehicleId}/permits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permitData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.error || 'Failed to add permit',
        };
      }

      return {
        success: true,
        message: 'Permit added successfully!',
        permit: result.permit,
      };
    } catch (error) {
      console.error('Error creating permit:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  };
}

export default function PermitForm({ 
  vehicleId, 
  onSuccess, 
  onCancel 
}: { 
  vehicleId: string;
  onSuccess?: (permit: any) => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<PermitFormData>(initialFormData);
  const [state, formAction, pending] = useActionState(createPermitAction(vehicleId), undefined);

  const handleInputChange = (name: keyof PermitFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle successful form submission
  if (state?.success && onSuccess && state.permit) {
    onSuccess(state.permit);
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
          <FileText className="h-5 w-5" />
          Add Vehicle Permit
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

          {/* Permit Type */}
          <div>
            <Label htmlFor="permitType">Permit Type *</Label>
            <Select 
              name="permitType" 
              value={formData.permitType} 
              onValueChange={(value) => handleInputChange('permitType', value as PermitType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select permit type" />
              </SelectTrigger>
              <SelectContent>
                {permitTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permit Number and Issuing Authority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="permitNumber">Permit Number *</Label>
              <Input
                id="permitNumber"
                name="permitNumber"
                value={formData.permitNumber}
                onChange={(e) => handleInputChange('permitNumber', e.target.value)}
                placeholder="Enter permit number"
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
                placeholder="e.g., Hong Kong Customs"
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
              placeholder="https://example.com/permit-document.pdf"
            />
          </div>

          <div>
            <Label htmlFor="fileName">Document File Name (Optional)</Label>
            <Input
              id="fileName"
              name="fileName"
              value={formData.fileName}
              onChange={(e) => handleInputChange('fileName', e.target.value)}
              placeholder="permit-document.pdf"
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
              placeholder="Additional notes or comments about this permit..."
              rows={3}
            />
          </div>

          {/* Expiry Warning */}
          {daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This permit will expire in {daysUntilExpiry} days. Consider renewing it soon.
              </AlertDescription>
            </Alert>
          )}

          {daysUntilExpiry !== null && daysUntilExpiry < 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This permit has already expired. You should not add an expired permit unless for record-keeping purposes.
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