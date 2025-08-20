'use client';

import React from 'react';
import { UniversalProfileData } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/Card';

interface ProfileActivityProps {
  profile: UniversalProfileData;
  isEditing?: boolean;
  onSave?: (data: Partial<UniversalProfileData>) => Promise<void>;
  onCancel?: () => void;
  onChange?: () => void;
  isLoading?: boolean;
}

export const ProfileActivity: React.FC<ProfileActivityProps> = ({
  profile
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Activity Feed</h3>
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">📈</span>
            <div className="text-sm">Activity tracking coming soon</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};