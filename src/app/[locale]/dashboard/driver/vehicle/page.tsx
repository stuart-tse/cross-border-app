'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { BaseCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface VehicleInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin: string;
  category: 'economy' | 'business' | 'executive' | 'luxury';
  capacity: {
    passengers: number;
    luggage: number;
  };
  features: string[];
  photos: string[];
  status: 'active' | 'maintenance' | 'inactive';
  mileage: number;
  fuelType: 'petrol' | 'hybrid' | 'electric';
}

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  coverage: string;
  premium: number;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired';
  claimsHistory: {
    date: string;
    type: string;
    amount: number;
    status: string;
  }[];
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  mileage: number;
  cost: number;
  location: string;
  nextServiceDue: string;
  nextServiceMileage: number;
  receipts: string[];
  status: 'completed' | 'scheduled' | 'overdue';
}

interface CrossBorderPermit {
  id: string;
  type: 'mainland_permit' | 'international_permit' | 'commercial_license' | 'customs_permit';
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  issuer: string;
  validRoutes: string[];
  status: 'active' | 'expiring' | 'expired' | 'renewal_required';
  renewalProcess: {
    documentsRequired: string[];
    estimatedCost: number;
    processingTime: string;
  };
}

const VehiclePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'insurance' | 'permits'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    id: 'vehicle-001',
    make: 'BMW',
    model: 'X5',
    year: 2023,
    color: 'Space Gray',
    licensePlate: 'HK-BC-1234',
    vin: 'WBAFR9C55BC123456',
    category: 'executive',
    capacity: {
      passengers: 6,
      luggage: 5,
    },
    features: [
      'Leather Interior',
      'GPS Navigation',
      'Wi-Fi Hotspot',
      'USB Charging Ports',
      'Climate Control',
      'Premium Sound System',
      'Child Safety Locks',
      'Tinted Windows'
    ],
    photos: [],
    status: 'active',
    mileage: 28450,
    fuelType: 'hybrid',
  });

  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo>({
    provider: 'AIA Insurance Hong Kong',
    policyNumber: 'AIA-CV-2024-567890',
    coverage: 'Comprehensive + Cross-Border',
    premium: 12800,
    expiryDate: '2024-12-31',
    status: 'active',
    claimsHistory: [
      {
        date: '2023-08-15',
        type: 'Minor collision repair',
        amount: 2500,
        status: 'Settled',
      },
      {
        date: '2023-03-22',
        type: 'Windshield replacement',
        amount: 800,
        status: 'Settled',
      },
    ],
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: 'maint-001',
      date: '2024-01-10',
      type: 'routine',
      description: 'Regular service - oil change, brake inspection, tire rotation',
      mileage: 28000,
      cost: 850,
      location: 'BMW Service Center - Admiralty',
      nextServiceDue: '2024-04-10',
      nextServiceMileage: 33000,
      receipts: [],
      status: 'completed',
    },
    {
      id: 'maint-002',
      date: '2023-10-15',
      type: 'inspection',
      description: 'Annual safety inspection and emissions test',
      mileage: 25200,
      cost: 450,
      location: 'HK Vehicle Inspection Center',
      nextServiceDue: '2024-10-15',
      nextServiceMileage: 0,
      receipts: [],
      status: 'completed',
    },
    {
      id: 'maint-003',
      date: '2024-02-20',
      type: 'routine',
      description: 'Upcoming service - brake pads replacement',
      mileage: 30000,
      cost: 1200,
      location: 'BMW Service Center - Admiralty',
      nextServiceDue: '2024-02-20',
      nextServiceMileage: 30000,
      receipts: [],
      status: 'scheduled',
    },
  ]);

  const [crossBorderPermits, setCrossBorderPermits] = useState<CrossBorderPermit[]>([
    {
      id: 'permit-001',
      type: 'mainland_permit',
      permitNumber: 'GD-HK-2024-001234',
      issueDate: '2023-12-01',
      expiryDate: '2025-11-30',
      issuer: 'Guangdong Public Security Bureau',
      validRoutes: ['Hong Kong ↔ Shenzhen', 'Hong Kong ↔ Guangzhou', 'Hong Kong ↔ Dongguan'],
      status: 'active',
      renewalProcess: {
        documentsRequired: [
          'Vehicle registration',
          'Driver license',
          'Insurance certificate',
          'Vehicle inspection report'
        ],
        estimatedCost: 3500,
        processingTime: '2-3 weeks',
      },
    },
    {
      id: 'permit-002',
      type: 'international_permit',
      permitNumber: 'IDP-HK-2024-567',
      issueDate: '2024-01-01',
      expiryDate: '2024-12-31',
      issuer: 'Hong Kong Transport Department',
      validRoutes: ['All international routes'],
      status: 'active',
      renewalProcess: {
        documentsRequired: [
          'Hong Kong driving license',
          'Passport copy',
          'Application form'
        ],
        estimatedCost: 350,
        processingTime: '5-7 business days',
      },
    },
    {
      id: 'permit-003',
      type: 'commercial_license',
      permitNumber: 'CL-HK-2024-890',
      issueDate: '2023-09-01',
      expiryDate: '2025-08-31',
      issuer: 'Hong Kong Transport Department',
      validRoutes: ['Commercial passenger transport'],
      status: 'active',
      renewalProcess: {
        documentsRequired: [
          'Medical certificate',
          'Criminal record check',
          'Vehicle fitness certificate',
          'Insurance certificate'
        ],
        estimatedCost: 800,
        processingTime: '3-4 weeks',
      },
    },
    {
      id: 'permit-004',
      type: 'customs_permit',
      permitNumber: 'CP-HK-2024-345',
      issueDate: '2024-01-15',
      expiryDate: '2024-07-15',
      issuer: 'Hong Kong Customs',
      validRoutes: ['Cross-border cargo transport'],
      status: 'expiring',
      renewalProcess: {
        documentsRequired: [
          'Business registration',
          'Vehicle registration',
          'Customs declaration'
        ],
        estimatedCost: 1200,
        processingTime: '1-2 weeks',
      },
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success-green bg-green-50 border-green-200';
      case 'expiring':
        return 'text-warning-amber bg-yellow-50 border-yellow-200';
      case 'expired':
      case 'overdue':
        return 'text-error-red bg-red-50 border-red-200';
      case 'renewal_required':
        return 'text-hot-pink bg-pink-50 border-pink-200';
      case 'maintenance':
        return 'text-electric-blue bg-blue-50 border-blue-200';
      case 'scheduled':
        return 'text-electric-blue bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-success-green bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMaintenanceTypeIcon = (type: string) => {
    switch (type) {
      case 'routine':
        return '🔧';
      case 'repair':
        return '🛠️';
      case 'inspection':
        return '🔍';
      case 'emergency':
        return '🚨';
      default:
        return '⚙️';
    }
  };

  const getPermitTypeIcon = (type: string) => {
    switch (type) {
      case 'mainland_permit':
        return '🌏';
      case 'international_permit':
        return '🌍';
      case 'commercial_license':
        return '🚛';
      case 'customs_permit':
        return '📋';
      default:
        return '📄';
    }
  };

  const formatCurrency = (amount: number) => {
    return `HK$${amount.toLocaleString()}`;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/driver"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Vehicle Management</h1>
              <p className="text-gray-600">Manage your vehicle information, maintenance, insurance, and cross-border permits</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Vehicle Overview', icon: '🚗' },
            { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
            { id: 'insurance', label: 'Insurance', icon: '🛡️' },
            { id: 'permits', label: 'Cross-Border Permits', icon: '📋' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all',
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-hot-pink font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Vehicle Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Vehicle Status Hero Card */}
            <BaseCard className="bg-gradient-to-br from-hot-pink/10 to-deep-pink/10 border-hot-pink/20" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-display-sm font-bold text-charcoal mb-3">
                    {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                  </h1>
                  <div className="flex items-center space-x-4 text-body-md mb-4">
                    <span className="text-gray-600">License: {vehicleInfo.licensePlate}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">{vehicleInfo.mileage.toLocaleString()} km</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600 capitalize">{vehicleInfo.fuelType}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={cn(
                      'px-3 py-2 rounded-full text-body-sm font-medium border-2',
                      getStatusColor(vehicleInfo.status)
                    )}>
                      {vehicleInfo.status === 'active' ? '✅ Active & Ready' : 
                       vehicleInfo.status === 'maintenance' ? '🔧 Under Maintenance' : '⏸️ Inactive'}
                    </span>
                    <span className="px-3 py-2 bg-electric-blue/10 text-electric-blue rounded-full text-body-sm font-medium border border-electric-blue/30">
                      {vehicleInfo.category.charAt(0).toUpperCase() + vehicleInfo.category.slice(1)} Class
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-3">
                  <Button 
                    className={isEditing ? "bg-gray-500 hover:bg-gray-600" : "bg-hot-pink hover:bg-deep-pink"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Vehicle Details'}
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm">📊 Analytics</Button>
                    <Button variant="secondary" size="sm">🔄 Sync Data</Button>
                  </div>
                </div>
              </div>
              
              {/* Quick stats bar */}
              <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-title-lg font-bold text-hot-pink">{vehicleInfo.capacity.passengers}</div>
                  <div className="text-body-sm text-gray-600">Max Passengers</div>
                </div>
                <div className="text-center">
                  <div className="text-title-lg font-bold text-electric-blue">{vehicleInfo.features.length}</div>
                  <div className="text-body-sm text-gray-600">Premium Features</div>
                </div>
                <div className="text-center">
                  <div className="text-title-lg font-bold text-success-green">
                    {Math.round((vehicleInfo.mileage - 25000) / 1000)}K
                  </div>
                  <div className="text-body-sm text-gray-600">Service Miles</div>
                </div>
                <div className="text-center">
                  <div className="text-title-lg font-bold text-warning-amber">
                    {new Date().getFullYear() - vehicleInfo.year}
                  </div>
                  <div className="text-body-sm text-gray-600">Years Old</div>
                </div>
              </div>
            </BaseCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Details */}
              <div className="lg:col-span-2">
                <BaseCard>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-title-lg font-semibold text-charcoal">Vehicle Specifications</h3>
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-hot-pink hover:bg-deep-pink text-white" size="sm">
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">Make & Model</label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={vehicleInfo.make}
                            onChange={(e) => setVehicleInfo({...vehicleInfo, make: e.target.value})}
                            placeholder="Make"
                          />
                          <Input
                            value={vehicleInfo.model}
                            onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                            placeholder="Model"
                          />
                        </div>
                      ) : (
                        <p className="text-body-md font-medium text-charcoal">
                          {vehicleInfo.make} {vehicleInfo.model}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">Year</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={vehicleInfo.year}
                          onChange={(e) => setVehicleInfo({...vehicleInfo, year: parseInt(e.target.value)})}
                        />
                      ) : (
                        <p className="text-body-md font-medium text-charcoal">{vehicleInfo.year}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">Color</label>
                      {isEditing ? (
                        <Input
                          value={vehicleInfo.color}
                          onChange={(e) => setVehicleInfo({...vehicleInfo, color: e.target.value})}
                        />
                      ) : (
                        <p className="text-body-md font-medium text-charcoal">{vehicleInfo.color}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">License Plate</label>
                      {isEditing ? (
                        <Input
                          value={vehicleInfo.licensePlate}
                          onChange={(e) => setVehicleInfo({...vehicleInfo, licensePlate: e.target.value})}
                        />
                      ) : (
                        <p className="text-body-md font-medium text-charcoal">{vehicleInfo.licensePlate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">VIN</label>
                      <p className="text-body-md font-medium text-charcoal">{vehicleInfo.vin}</p>
                    </div>

                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">Category</label>
                      <p className="text-body-md font-medium text-charcoal capitalize">
                        {vehicleInfo.category} Class
                      </p>
                    </div>

                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">Capacity</label>
                      <p className="text-body-md font-medium text-charcoal">
                        {vehicleInfo.capacity.passengers} passengers • {vehicleInfo.capacity.luggage} luggage
                      </p>
                    </div>

                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                      <p className="text-body-md font-medium text-charcoal capitalize">
                        {vehicleInfo.fuelType}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-body-sm font-medium text-gray-700 mb-3">Vehicle Features</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicleInfo.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-hot-pink rounded-full"></span>
                          <span className="text-body-sm text-charcoal">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </BaseCard>
              </div>

              {/* Quick Stats & Actions */}
              <div className="space-y-6">
                {/* Vehicle Photos */}
                <BaseCard>
                  <h4 className="text-title-sm font-semibold text-charcoal mb-4">Vehicle Photos</h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Placeholder photos */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">🚗</span>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">📷</span>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">📷</span>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">📷</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">
                    📷 Upload Photos
                  </Button>
                </BaseCard>

                {/* Quick Actions */}
                <BaseCard>
                  <h4 className="text-title-sm font-semibold text-charcoal mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      🔧 Schedule Maintenance
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      🛡️ View Insurance Details
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      📋 Check Permit Status
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      📊 Vehicle Performance Report
                    </Button>
                  </div>
                </BaseCard>

                {/* Status Summary */}
                <BaseCard>
                  <h4 className="text-title-sm font-semibold text-charcoal mb-4">Status Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-gray-600">Next Service</span>
                      <span className="text-body-sm font-medium text-electric-blue">
                        {new Date(maintenanceRecords.find(r => r.status === 'scheduled')?.nextServiceDue || '').toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-gray-600">Insurance Expires</span>
                      <span className="text-body-sm font-medium text-success-green">
                        {new Date(insuranceInfo.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-gray-600">Permits Status</span>
                      <span className="text-body-sm font-medium text-warning-amber">
                        {crossBorderPermits.filter(p => p.status === 'expiring').length} expiring soon
                      </span>
                    </div>
                  </div>
                </BaseCard>
              </div>
            </div>
          </motion.div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <motion.div
            key="maintenance"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-title-lg font-semibold text-charcoal">Maintenance History & Schedule</h2>
              <Button variant="primary">🔧 Schedule Service</Button>
            </div>

            {/* Maintenance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <BaseCard className="text-center" padding="md">
                <div className="text-headline-md font-bold text-hot-pink">
                  {formatCurrency(maintenanceRecords.reduce((sum, r) => sum + r.cost, 0))}
                </div>
                <div className="text-body-sm text-gray-600">Total Maintenance Cost</div>
              </BaseCard>

              <BaseCard className="text-center" padding="md">
                <div className="text-headline-md font-bold text-electric-blue">
                  {maintenanceRecords.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-body-sm text-gray-600">Services Completed</div>
              </BaseCard>

              <BaseCard className="text-center" padding="md">
                <div className="text-headline-md font-bold text-warning-amber">
                  {maintenanceRecords.filter(r => r.status === 'scheduled').length}
                </div>
                <div className="text-body-sm text-gray-600">Scheduled Services</div>
              </BaseCard>

              <BaseCard className="text-center" padding="md">
                <div className="text-headline-md font-bold text-success-green">
                  {Math.round((vehicleInfo.mileage - 25000) / 3000)}
                </div>
                <div className="text-body-sm text-gray-600">Services Since Purchase</div>
              </BaseCard>
            </div>

            {/* Maintenance Records */}
            <BaseCard>
              <h3 className="text-title-lg font-semibold text-charcoal mb-6">Maintenance Records</h3>
              
              <div className="space-y-4">
                {maintenanceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getMaintenanceTypeIcon(record.type)}</div>
                        <div>
                          <h4 className="text-title-sm font-semibold text-charcoal">{record.description}</h4>
                          <p className="text-body-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString()} • {record.mileage.toLocaleString()} km
                          </p>
                          <p className="text-body-sm text-gray-600">{record.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-title-md font-bold text-charcoal">
                          {formatCurrency(record.cost)}
                        </div>
                        <div className={cn(
                          'px-2 py-1 rounded-full text-caption font-medium border',
                          getStatusColor(record.status)
                        )}>
                          {record.status === 'completed' ? '✅ Completed' :
                           record.status === 'scheduled' ? '📅 Scheduled' : '⚠️ Overdue'}
                        </div>
                      </div>
                    </div>

                    {record.status === 'scheduled' && (
                      <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-sm">
                          <div>
                            <span className="text-gray-600">Scheduled Date:</span>
                            <div className="font-medium text-charcoal">
                              {new Date(record.nextServiceDue).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Estimated Mileage:</span>
                            <div className="font-medium text-charcoal">
                              {record.nextServiceMileage.toLocaleString()} km
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </BaseCard>
          </motion.div>
        )}

        {/* Insurance Tab */}
        {activeTab === 'insurance' && (
          <motion.div
            key="insurance"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-title-lg font-semibold text-charcoal">Insurance Information</h2>
              <Button variant="primary">🛡️ Update Policy</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Policy */}
              <BaseCard>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Current Policy</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                    <p className="text-title-sm font-semibold text-charcoal">{insuranceInfo.provider}</p>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 mb-1">Policy Number</label>
                    <p className="text-body-md font-medium text-charcoal">{insuranceInfo.policyNumber}</p>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 mb-1">Coverage Type</label>
                    <p className="text-body-md font-medium text-charcoal">{insuranceInfo.coverage}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-1">Annual Premium</label>
                      <p className="text-title-md font-bold text-hot-pink">
                        {formatCurrency(insuranceInfo.premium)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <p className="text-body-md font-medium text-charcoal">
                        {new Date(insuranceInfo.expiryDate).toLocaleDateString()}
                      </p>
                      <p className="text-caption text-gray-500">
                        {getDaysUntilExpiry(insuranceInfo.expiryDate)} days remaining
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    'p-3 rounded-lg border',
                    getStatusColor(insuranceInfo.status)
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {insuranceInfo.status === 'active' ? '✅ Policy Active' :
                         insuranceInfo.status === 'expiring' ? '⚠️ Expiring Soon' : '❌ Policy Expired'}
                      </span>
                      {insuranceInfo.status === 'expiring' && (
                        <Button variant="secondary" size="sm">Renew Now</Button>
                      )}
                    </div>
                  </div>
                </div>
              </BaseCard>

              {/* Coverage Details */}
              <BaseCard>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Coverage Details</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { coverage: 'Third Party Liability', limit: 'HK$10,000,000', included: true },
                      { coverage: 'Own Damage', limit: 'Market Value', included: true },
                      { coverage: 'Cross-Border Coverage', limit: 'Full Coverage', included: true },
                      { coverage: 'Personal Accident', limit: 'HK$500,000', included: true },
                      { coverage: 'Medical Expenses', limit: 'HK$50,000', included: true },
                      { coverage: 'Emergency Roadside', limit: '24/7 Service', included: true },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-success-green">✅</span>
                          <span className="text-body-sm font-medium text-charcoal">{item.coverage}</span>
                        </div>
                        <span className="text-body-sm text-gray-600">{item.limit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </BaseCard>
            </div>

            {/* Claims History */}
            <BaseCard>
              <h3 className="text-title-lg font-semibold text-charcoal mb-6">Claims History</h3>
              
              {insuranceInfo.claimsHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🛡️</div>
                  <h4 className="text-title-md font-semibold text-charcoal mb-2">No Claims History</h4>
                  <p className="text-body-md text-gray-600">
                    Great driving record! No insurance claims have been filed.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insuranceInfo.claimsHistory.map((claim, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-body-md font-medium text-charcoal">{claim.type}</h4>
                        <p className="text-body-sm text-gray-600">
                          {new Date(claim.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-body-md font-semibold text-charcoal">
                          {formatCurrency(claim.amount)}
                        </div>
                        <span className="px-2 py-1 bg-success-green/10 text-success-green rounded-full text-caption">
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BaseCard>
          </motion.div>
        )}

        {/* Cross-Border Permits Tab */}
        {activeTab === 'permits' && (
          <motion.div
            key="permits"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-title-lg font-semibold text-charcoal">Cross-Border Permits & Licenses</h2>
              <Button variant="primary">📋 Apply for New Permit</Button>
            </div>

            {/* Permits Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <BaseCard className="text-center bg-gradient-to-br from-success-green/10 to-success-green/20 border-success-green/30" padding="md">
                <div className="text-headline-md font-bold text-success-green">
                  {crossBorderPermits.filter(p => p.status === 'active').length}
                </div>
                <div className="text-body-sm text-gray-600">Active Permits</div>
              </BaseCard>

              <BaseCard className="text-center bg-gradient-to-br from-warning-amber/10 to-warning-amber/20 border-warning-amber/30" padding="md">
                <div className="text-headline-md font-bold text-warning-amber">
                  {crossBorderPermits.filter(p => p.status === 'expiring').length}
                </div>
                <div className="text-body-sm text-gray-600">Expiring Soon</div>
              </BaseCard>

              <BaseCard className="text-center bg-gradient-to-br from-error-red/10 to-error-red/20 border-error-red/30" padding="md">
                <div className="text-headline-md font-bold text-error-red">
                  {crossBorderPermits.filter(p => p.status === 'expired').length}
                </div>
                <div className="text-body-sm text-gray-600">Expired</div>
              </BaseCard>

              <BaseCard className="text-center bg-gradient-to-br from-hot-pink/10 to-deep-pink/10 border-hot-pink/30" padding="md">
                <div className="text-headline-md font-bold text-hot-pink">
                  {crossBorderPermits.filter(p => p.status === 'renewal_required').length}
                </div>
                <div className="text-body-sm text-gray-600">Need Renewal</div>
              </BaseCard>
            </div>

            {/* Permits List */}
            <div className="space-y-4">
              {crossBorderPermits.map((permit) => (
                <BaseCard key={permit.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{getPermitTypeIcon(permit.type)}</div>
                      <div>
                        <h3 className="text-title-md font-semibold text-charcoal">
                          {permit.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-body-sm text-gray-600">
                          Permit #: {permit.permitNumber}
                        </p>
                        <p className="text-body-sm text-gray-600">
                          Issued by: {permit.issuer}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        'px-3 py-1 rounded-full text-body-sm font-medium border mb-2',
                        getStatusColor(permit.status)
                      )}>
                        {permit.status === 'active' ? '✅ Active' :
                         permit.status === 'expiring' ? '⚠️ Expiring Soon' :
                         permit.status === 'expired' ? '❌ Expired' : '🔄 Renewal Required'}
                      </div>
                      <p className="text-body-sm text-gray-600">
                        Expires: {new Date(permit.expiryDate).toLocaleDateString()}
                      </p>
                      <p className="text-caption text-gray-500">
                        {getDaysUntilExpiry(permit.expiryDate)} days remaining
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-body-md font-semibold text-charcoal mb-2">Valid Routes</h4>
                      <div className="space-y-1">
                        {permit.validRoutes.map((route, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-electric-blue rounded-full"></span>
                            <span className="text-body-sm text-charcoal">{route}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-body-md font-semibold text-charcoal mb-2">Renewal Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-body-sm text-gray-600">Estimated Cost:</span>
                          <span className="text-body-sm font-medium text-charcoal">
                            {formatCurrency(permit.renewalProcess.estimatedCost)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-body-sm text-gray-600">Processing Time:</span>
                          <span className="text-body-sm font-medium text-charcoal">
                            {permit.renewalProcess.processingTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(permit.status === 'expiring' || permit.status === 'renewal_required') && (
                    <div className="mt-4 p-3 bg-warning-amber/10 border border-warning-amber/30 rounded-lg">
                      <h4 className="text-body-md font-semibold text-charcoal mb-2">
                        📋 Documents Required for Renewal
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permit.renewalProcess.documentsRequired.map((doc, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-warning-amber rounded-full"></span>
                            <span className="text-body-sm text-charcoal">{doc}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-3 mt-4">
                        <Button variant="secondary" size="sm">
                          📋 View Requirements
                        </Button>
                        <Button variant="primary" size="sm">
                          🔄 Start Renewal Process
                        </Button>
                      </div>
                    </div>
                  )}
                </BaseCard>
              ))}
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(VehiclePage, [UserType.DRIVER]);