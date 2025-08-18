'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface DriverProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  languages: string[];
  license: {
    number: string;
    expiryDate: string;
    class: string;
    crossBorderPermit: boolean;
    crossBorderExpiryDate?: string;
  };
  experience: {
    yearsOfExperience: number;
    totalTrips: number;
    avgRating: number;
    ratingCount: number;
    specializations: string[];
  };
  availability: {
    workingHours: {
      monday: { start: string; end: string; available: boolean };
      tuesday: { start: string; end: string; available: boolean };
      wednesday: { start: string; end: string; available: boolean };
      thursday: { start: string; end: string; available: boolean };
      friday: { start: string; end: string; available: boolean };
      saturday: { start: string; end: string; available: boolean };
      sunday: { start: string; end: string; available: boolean };
    };
    maxTripsPerDay: number;
    preferredRoutes: string[];
  };
  performance: {
    onTimeRate: number;
    completionRate: number;
    clientSatisfaction: number;
    totalEarnings: number;
    thisMonthEarnings: number;
  };
}

const DriverProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<DriverProfileData>({
    id: user?.id || '1',
    name: user?.name || 'John Wong',
    email: user?.email || 'john.wong@example.com',
    phone: '+852-9876-5432',
    profilePhoto: undefined,
    dateOfBirth: '1985-06-15',
    address: 'Flat 12A, Tower 3, Harbour View Estate, Tsuen Wan, Hong Kong',
    emergencyContact: {
      name: 'Maria Wong',
      phone: '+852-9123-4567',
      relationship: 'Spouse',
    },
    languages: ['English', 'Cantonese', 'Mandarin'],
    license: {
      number: 'DL-HK-2018-123456',
      expiryDate: '2026-06-15',
      class: 'Class 1 & 2',
      crossBorderPermit: true,
      crossBorderExpiryDate: '2025-12-31',
    },
    experience: {
      yearsOfExperience: 8,
      totalTrips: 2847,
      avgRating: 4.89,
      ratingCount: 2654,
      specializations: ['Cross-border routes', 'Executive service', 'Airport transfers'],
    },
    availability: {
      workingHours: {
        monday: { start: '07:00', end: '19:00', available: true },
        tuesday: { start: '07:00', end: '19:00', available: true },
        wednesday: { start: '07:00', end: '19:00', available: true },
        thursday: { start: '07:00', end: '19:00', available: true },
        friday: { start: '07:00', end: '19:00', available: true },
        saturday: { start: '08:00', end: '18:00', available: true },
        sunday: { start: '09:00', end: '17:00', available: false },
      },
      maxTripsPerDay: 6,
      preferredRoutes: ['Hong Kong ↔ Shenzhen', 'Hong Kong ↔ Guangzhou', 'Airport transfers'],
    },
    performance: {
      onTimeRate: 98.7,
      completionRate: 99.2,
      clientSatisfaction: 4.89,
      totalEarnings: 485960,
      thisMonthEarnings: 28450,
    },
  });

  const handleSave = () => {
    // In real app, this would make an API call
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
    // Show success toast
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
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
              <h1 className="text-3xl font-bold text-charcoal">Driver Profile</h1>
              <p className="text-gray-600">Manage your personal information and professional details</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-charcoal">Your Profile</h2>
            <p className="text-gray-600 mt-1">Keep your information up to date to provide the best service</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-title-lg font-semibold text-charcoal">Basic Information</h3>
                  <div className="flex items-center space-x-4">
                    {/* Availability Status Toggle */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-body-sm text-gray-600">Status:</span>
                        <select className="px-3 py-1 text-body-sm border border-gray-300 rounded-md bg-white">
                          <option value="available">🟢 Available</option>
                          <option value="busy">🟡 On Trip</option>
                          <option value="offline">🔴 Offline</option>
                        </select>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-hot-pink to-deep-pink rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl font-bold">
                          {profileData.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <button className="absolute bottom-0 right-0 w-6 h-6 bg-electric-blue hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs transition-colors">
                        📷
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-body-md text-charcoal font-medium">{profileData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-body-md text-charcoal font-medium">{profileData.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <Input
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-body-md text-charcoal font-medium">{profileData.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    ) : (
                      <p className="text-body-md text-charcoal font-medium">
                        {new Date(profileData.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  {isEditing ? (
                    <Input
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="text-body-md text-charcoal font-medium">{profileData.address}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#FFF0F5] text-[#FF69B4] rounded-full text-sm font-medium"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* License Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">License & Permits</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <p className="text-body-md text-charcoal font-medium">{profileData.license.number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Class</label>
                    <p className="text-body-md text-charcoal font-medium">{profileData.license.class}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry</label>
                    <p className="text-body-md text-charcoal font-medium">
                      {new Date(profileData.license.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cross-Border Permit</label>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        profileData.license.crossBorderPermit
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      )}>
                        {profileData.license.crossBorderPermit ? '✅ Active' : '❌ Inactive'}
                      </span>
                      {profileData.license.crossBorderPermit && (
                        <span className="text-sm text-gray-600">
                          Expires: {new Date(profileData.license.crossBorderExpiryDate!).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Emergency Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Emergency Contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    {isEditing ? (
                      <Input
                        value={profileData.emergencyContact.name}
                        onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                        placeholder="Emergency contact name"
                      />
                    ) : (
                      <p className="text-body-md text-charcoal font-medium">{profileData.emergencyContact.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <Input
                        value={profileData.emergencyContact.phone}
                        onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                        placeholder="Emergency contact phone"
                      />
                    ) : (
                      <p className="text-body-md text-charcoal font-medium">{profileData.emergencyContact.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    {isEditing ? (
                      <Input
                        value={profileData.emergencyContact.relationship}
                        onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                        placeholder="Relationship"
                      />
                    ) : (
                      <p className="text-body-md text-charcoal font-medium">{profileData.emergencyContact.relationship}</p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Performance & Experience */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Performance Metrics</h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#FF69B4] mb-1">
                      {profileData.experience.avgRating}⭐
                    </div>
                    <div className="text-sm text-gray-600">
                      {profileData.experience.ratingCount.toLocaleString()} reviews
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">On-time Rate</span>
                      <span className="text-sm font-semibold">{profileData.performance.onTimeRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-semibold">{profileData.performance.completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Trips</span>
                      <span className="text-sm font-semibold">{profileData.experience.totalTrips.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Experience</span>
                      <span className="text-sm font-semibold">{profileData.experience.yearsOfExperience} years</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Specializations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Specializations</h3>
                
                <div className="space-y-2">
                  {profileData.experience.specializations.map((spec, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-[#FF69B4] rounded-full"></span>
                      <span className="text-sm text-charcoal">{spec}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Earnings Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Earnings Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-[#FF69B4]">
                      HK${profileData.performance.thisMonthEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">This month</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-charcoal">
                      HK${profileData.performance.totalEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total lifetime earnings</div>
                  </div>
                </div>

                <Button variant="secondary" size="sm" className="w-full mt-4">
                  View Detailed Earnings
                </Button>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Button variant="secondary" size="sm" className="w-full">
                    📄 Update Documents
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full">
                    🚙 Vehicle Information
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full">
                    ⏰ Working Hours
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full">
                    🆘 Emergency Protocols
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(DriverProfilePage, [UserType.DRIVER]);