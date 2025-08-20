'use client';

import React from 'react';
import { UniversalProfileData } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/Card';

interface DriverProfileTabProps {
  profile: UniversalProfileData;
  isEditing?: boolean;
  onSave?: (data: Partial<UniversalProfileData>) => Promise<void>;
  onCancel?: () => void;
  onChange?: () => void;
  isLoading?: boolean;
}

export const DriverProfileTab: React.FC<DriverProfileTabProps> = ({
  profile
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Driver Profile</h3>
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">🚗</span>
            <div className="text-sm">Driver profile features coming soon</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};