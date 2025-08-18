'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Button } from '@/components/ui/Button';

export const RoleAssigner: React.FC = () => {
  const { user } = useAuth();
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState('');

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const assignRole = async (role: UserType) => {
    if (!user) return;

    try {
      setIsAssigning(true);
      setMessage('');

      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          role: role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully assigned ${role} role!`);
        // Refresh auth context to get updated roles
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      setMessage('❌ Network error occurred');
    } finally {
      setIsAssigning(false);
    }
  };

  const userRoles = user?.roles?.map(r => r.role) || [];

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border border-gray-200 max-w-sm">
      <div className="text-sm font-semibold text-gray-800 mb-2">
        🛠️ Dev Tool - Role Assigner
      </div>
      
      <div className="text-xs text-gray-600 mb-3">
        Current roles: {userRoles.join(', ') || 'None'}
      </div>

      <div className="space-y-2">
        {Object.values(UserType).filter(role => !userRoles.includes(role)).map((role) => (
          <Button
            key={role}
            variant="secondary"
            size="sm"
            onClick={() => assignRole(role)}
            disabled={isAssigning}
            className="w-full text-xs"
          >
            Add {role} role
          </Button>
        ))}
      </div>

      {message && (
        <div className="text-xs mt-2 p-2 bg-gray-100 rounded">
          {message}
        </div>
      )}
    </div>
  );
};