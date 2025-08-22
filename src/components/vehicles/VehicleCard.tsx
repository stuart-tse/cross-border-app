'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Car, 
  AlertTriangle, 
  Calendar, 
  Edit, 
  Trash2, 
  FileText, 
  CreditCard, 
  Plus,
  Eye,
  CheckCircle
} from 'lucide-react';
import { VehicleType, PermitType, LicenseType, DocumentStatus } from '@prisma/client';
import PermitForm from '@/components/forms/PermitForm';
import LicenseForm from '@/components/forms/LicenseForm';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vin?: string;
  vehicleType: VehicleType;
  capacity: number;
  isActive: boolean;
  features: string[];
  fuelType?: string;
  specialEquipment: string[];
  insuranceExpiry: string;
  inspectionExpiry: string;
  photos: string[];
  hasExpiringDocuments: boolean;
  permits: VehiclePermit[];
  licenses: VehicleLicense[];
  expiringPermits?: VehiclePermit[];
  expiringLicenses?: VehicleLicense[];
}

interface VehiclePermit {
  id: string;
  permitType: PermitType;
  permitNumber: string;
  issuingAuthority: string;
  startDate: string;
  expiryDate: string;
  fileUrl?: string;
  fileName?: string;
  status: DocumentStatus;
  notes?: string;
  isExpiring?: boolean;
  isExpired?: boolean;
  daysUntilExpiry?: number;
}

interface VehicleLicense {
  id: string;
  licenseType: LicenseType;
  licenseNumber: string;
  issuingAuthority: string;
  startDate: string;
  expiryDate: string;
  fileUrl?: string;
  fileName?: string;
  status: DocumentStatus;
  notes?: string;
  isExpiring?: boolean;
  isExpired?: boolean;
  daysUntilExpiry?: number;
}

const vehicleTypeColors = {
  [VehicleType.BUSINESS]: 'bg-blue-100 text-blue-800',
  [VehicleType.EXECUTIVE]: 'bg-purple-100 text-purple-800',
  [VehicleType.LUXURY]: 'bg-pink-100 text-pink-800',
  [VehicleType.SUV]: 'bg-green-100 text-green-800',
  [VehicleType.VAN]: 'bg-orange-100 text-orange-800',
};

const permitTypeLabels = {
  [PermitType.CUSTOMS_PERMIT]: 'Customs',
  [PermitType.CROSS_BORDER_PERMIT]: 'Cross-Border',
  [PermitType.TRANSIT_PERMIT]: 'Transit',
  [PermitType.TEMPORARY_IMPORT]: 'Temp Import',
  [PermitType.EXPORT_PERMIT]: 'Export',
  [PermitType.SPECIAL_CARGO]: 'Special Cargo',
  [PermitType.OVERSIZE_LOAD]: 'Oversize',
  [PermitType.HAZMAT_PERMIT]: 'Hazmat',
  [PermitType.PASSENGER_TRANSPORT]: 'Passenger',
  [PermitType.COMMERCIAL_TRANSPORT]: 'Commercial',
};

const licenseTypeLabels = {
  [LicenseType.COMMERCIAL_DRIVING]: 'Commercial',
  [LicenseType.INTERNATIONAL_DRIVING]: 'International',
  [LicenseType.CHAUFFEUR_LICENSE]: 'Chauffeur',
  [LicenseType.PASSENGER_ENDORSEMENT]: 'Passenger',
  [LicenseType.HAZMAT_ENDORSEMENT]: 'Hazmat',
  [LicenseType.MOTORCYCLE_LICENSE]: 'Motorcycle',
  [LicenseType.HEAVY_VEHICLE_LICENSE]: 'Heavy Vehicle',
  [LicenseType.CROSS_BORDER_DRIVING]: 'Cross-Border',
  [LicenseType.TAXI_LICENSE]: 'Taxi',
  [LicenseType.BUS_LICENSE]: 'Bus',
};

export default function VehicleCard({ 
  vehicle, 
  onEditAction,
  onDeleteAction,
  onRefreshAction
}: { 
  vehicle: Vehicle;
  onEditAction: (vehicle: Vehicle) => void;
  onDeleteAction: (vehicleId: string) => void;
  onRefreshAction: () => void;
}) {
  const [showPermitForm, setShowPermitForm] = useState(false);
  const [showLicenseForm, setShowLicenseForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', color: 'bg-red-100 text-red-800', days: diffDays };
    if (diffDays <= 30) return { status: 'expiring', color: 'bg-orange-100 text-orange-800', days: diffDays };
    return { status: 'valid', color: 'bg-green-100 text-green-800', days: diffDays };
  };

  const insuranceStatus = getExpiryStatus(vehicle.insuranceExpiry);
  const inspectionStatus = getExpiryStatus(vehicle.inspectionExpiry);

  const handlePermitAdded = (permit: VehiclePermit) => {
    setShowPermitForm(false);
    onRefreshAction();
  };

  const handleLicenseAdded = (license: VehicleLicense) => {
    setShowLicenseForm(false);
    onRefreshAction();
  };

  return (
    <Card className={`relative ${!vehicle.isActive ? 'opacity-60' : ''}`}>
      {/* Alert Badge for Expiring Documents */}
      {vehicle.hasExpiringDocuments && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-red-500 text-white rounded-full p-1">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {vehicle.make} {vehicle.model}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={vehicleTypeColors[vehicle.vehicleType]}>
                {vehicle.vehicleType}
              </Badge>
              <span className="text-sm text-gray-600">
                {vehicle.year} • {vehicle.plateNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {vehicle.make} {vehicle.model} - {vehicle.plateNumber}
                  </DialogTitle>
                </DialogHeader>
                <VehicleDetails vehicle={vehicle} />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={() => onEditAction(vehicle)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDeleteAction(vehicle.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vehicle Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Color:</span> {vehicle.color}
          </div>
          <div>
            <span className="text-gray-600">Capacity:</span> {vehicle.capacity} passengers
          </div>
          {vehicle.fuelType && (
            <div>
              <span className="text-gray-600">Fuel:</span> {vehicle.fuelType}
            </div>
          )}
        </div>

        {/* Insurance & Inspection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Insurance:</span>
            <Badge className={insuranceStatus.color}>
              {insuranceStatus.status === 'expired' ? 'Expired' : 
               insuranceStatus.status === 'expiring' ? `${insuranceStatus.days} days` :
               'Valid'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Inspection:</span>
            <Badge className={inspectionStatus.color}>
              {inspectionStatus.status === 'expired' ? 'Expired' : 
               inspectionStatus.status === 'expiring' ? `${inspectionStatus.days} days` :
               'Valid'}
            </Badge>
          </div>
        </div>

        {/* Permits & Licenses Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {vehicle.permits.length} permits
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              {vehicle.licenses.length} licenses
            </span>
          </div>
          <div className="flex gap-2">
            <Dialog open={showPermitForm} onOpenChange={setShowPermitForm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Permit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <PermitForm
                  vehicleId={vehicle.id}
                  onSuccess={handlePermitAdded}
                  onCancel={() => setShowPermitForm(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showLicenseForm} onOpenChange={setShowLicenseForm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  License
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <LicenseForm
                  vehicleId={vehicle.id}
                  onSuccess={handleLicenseAdded}
                  onCancel={() => setShowLicenseForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Expiring Documents Warning */}
        {vehicle.hasExpiringDocuments && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Documents Expiring Soon</span>
            </div>
            {vehicle.expiringPermits && vehicle.expiringPermits.length > 0 && (
              <div className="mt-1 text-xs text-orange-700">
                Permits: {vehicle.expiringPermits.map(p => permitTypeLabels[p.permitType]).join(', ')}
              </div>
            )}
            {vehicle.expiringLicenses && vehicle.expiringLicenses.length > 0 && (
              <div className="mt-1 text-xs text-orange-700">
                Licenses: {vehicle.expiringLicenses.map(l => licenseTypeLabels[l.licenseType]).join(', ')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Detailed vehicle information component
function VehicleDetails({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="font-medium">Make:</span> {vehicle.make}</div>
          <div><span className="font-medium">Model:</span> {vehicle.model}</div>
          <div><span className="font-medium">Year:</span> {vehicle.year}</div>
          <div><span className="font-medium">Color:</span> {vehicle.color}</div>
          <div><span className="font-medium">Plate:</span> {vehicle.plateNumber}</div>
          {vehicle.vin && <div><span className="font-medium">VIN:</span> {vehicle.vin}</div>}
          <div><span className="font-medium">Type:</span> {vehicle.vehicleType}</div>
          <div><span className="font-medium">Capacity:</span> {vehicle.capacity}</div>
          {vehicle.fuelType && <div><span className="font-medium">Fuel:</span> {vehicle.fuelType}</div>}
        </div>
      </div>

      {/* Features */}
      {vehicle.features.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Features</h3>
          <div className="flex flex-wrap gap-2">
            {vehicle.features.map(feature => (
              <Badge key={feature} variant="secondary">{feature}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Special Equipment */}
      {vehicle.specialEquipment.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Special Equipment</h3>
          <div className="flex flex-wrap gap-2">
            {vehicle.specialEquipment.map(equipment => (
              <Badge key={equipment} variant="outline">{equipment}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Permits */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Permits ({vehicle.permits.length})</h3>
        {vehicle.permits.length > 0 ? (
          <div className="space-y-3">
            {vehicle.permits.map(permit => (
              <PermitCard key={permit.id} permit={permit} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No permits added yet.</p>
        )}
      </div>

      {/* Licenses */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Licenses ({vehicle.licenses.length})</h3>
        {vehicle.licenses.length > 0 ? (
          <div className="space-y-3">
            {vehicle.licenses.map(license => (
              <LicenseCard key={license.id} license={license} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No licenses added yet.</p>
        )}
      </div>
    </div>
  );
}

function PermitCard({ permit }: { permit: VehiclePermit }) {
  const expiryStatus = getExpiryStatus(permit.expiryDate);

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium">{permitTypeLabels[permit.permitType]}</span>
          <Badge className={getStatusColor(permit.status)}>
            {permit.status}
          </Badge>
        </div>
        <Badge className={expiryStatus.color}>
          {expiryStatus.status === 'expired' ? 'Expired' : 
           expiryStatus.status === 'expiring' ? `${expiryStatus.days} days` :
           'Valid'}
        </Badge>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <div><span className="font-medium">Number:</span> {permit.permitNumber}</div>
        <div><span className="font-medium">Authority:</span> {permit.issuingAuthority}</div>
        <div><span className="font-medium">Valid:</span> {new Date(permit.startDate).toLocaleDateString()} - {new Date(permit.expiryDate).toLocaleDateString()}</div>
        {permit.notes && <div><span className="font-medium">Notes:</span> {permit.notes}</div>}
      </div>
    </div>
  );
}

function LicenseCard({ license }: { license: VehicleLicense }) {
  const expiryStatus = getExpiryStatus(license.expiryDate);

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span className="font-medium">{licenseTypeLabels[license.licenseType]}</span>
          <Badge className={getStatusColor(license.status)}>
            {license.status}
          </Badge>
        </div>
        <Badge className={expiryStatus.color}>
          {expiryStatus.status === 'expired' ? 'Expired' : 
           expiryStatus.status === 'expiring' ? `${expiryStatus.days} days` :
           'Valid'}
        </Badge>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <div><span className="font-medium">Number:</span> {license.licenseNumber}</div>
        <div><span className="font-medium">Authority:</span> {license.issuingAuthority}</div>
        <div><span className="font-medium">Valid:</span> {new Date(license.startDate).toLocaleDateString()} - {new Date(license.expiryDate).toLocaleDateString()}</div>
        {license.notes && <div><span className="font-medium">Notes:</span> {license.notes}</div>}
      </div>
    </div>
  );
}

function getExpiryStatus(expiryDate: string) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { status: 'expired', color: 'bg-red-100 text-red-800', days: diffDays };
  if (diffDays <= 30) return { status: 'expiring', color: 'bg-orange-100 text-orange-800', days: diffDays };
  return { status: 'valid', color: 'bg-green-100 text-green-800', days: diffDays };
}

function getStatusColor(status: DocumentStatus) {
  switch (status) {
    case DocumentStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case DocumentStatus.EXPIRED:
      return 'bg-red-100 text-red-800';
    case DocumentStatus.SUSPENDED:
      return 'bg-orange-100 text-orange-800';
    case DocumentStatus.REVOKED:
      return 'bg-red-100 text-red-800';
    case DocumentStatus.PENDING_RENEWAL:
      return 'bg-yellow-100 text-yellow-800';
    case DocumentStatus.UNDER_REVIEW:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}