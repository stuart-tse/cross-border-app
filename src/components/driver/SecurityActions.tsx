'use client';

import React, { useState } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { 
  changePassword, 
  toggleTwoFactor, 
  requestDataDownload, 
  deleteDriverAccount,
  type DriverActionState 
} from '@/app/actions/driver';
import { Shield, Key, Download, Trash2, AlertTriangle } from 'lucide-react';

interface SecurityActionsProps {
  twoFactorEnabled: boolean;
  onTwoFactorToggle?: (enabled: boolean) => void;
}

export default function SecurityActions({ twoFactorEnabled, onTwoFactorToggle }: SecurityActionsProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // Server action states
  const [passwordState, passwordAction] = useActionState(
    changePassword,
    undefined
  );
  const [twoFactorState, twoFactorAction] = useActionState(
    toggleTwoFactor,
    undefined
  );
  const [dataDownloadState, dataDownloadAction] = useActionState(
    requestDataDownload,
    undefined
  );
  const [deleteAccountState, deleteAccountAction] = useActionState(
    deleteDriverAccount,
    undefined
  );

  const handlePasswordChange = () => {
    const formData = new FormData();
    formData.append('currentPassword', passwordData.currentPassword);
    formData.append('newPassword', passwordData.newPassword);
    formData.append('confirmPassword', passwordData.confirmPassword);
    
    passwordAction(formData);
  };

  const handleTwoFactorToggle = () => {
    const newEnabled = !twoFactorEnabled;
    const formData = new FormData();
    formData.append('enable', newEnabled.toString());
    
    twoFactorAction(formData);
    onTwoFactorToggle?.(newEnabled);
  };

  const handleDataDownload = (dataType: string = 'all') => {
    const formData = new FormData();
    formData.append('dataType', dataType);
    
    dataDownloadAction(formData);
    setShowDataModal(false);
  };

  const handleAccountDeletion = () => {
    const formData = new FormData();
    formData.append('confirmation', deleteConfirmation);
    formData.append('password', deletePassword);
    
    deleteAccountAction(formData);
  };

  const isPasswordValid = () => {
    return (
      passwordData.currentPassword.length > 0 &&
      passwordData.newPassword.length >= 8 &&
      passwordData.newPassword === passwordData.confirmPassword &&
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)
    );
  };

  const isDeleteValid = () => {
    return (
      deleteConfirmation === 'DELETE MY ACCOUNT' &&
      deletePassword.length > 0
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Password Section */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-body-md font-medium">Change password</div>
              <div className="text-body-sm text-gray-600">Last changed 3 months ago</div>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            isLoading={passwordState?.success === undefined && passwordState !== undefined}
          >
            Change
          </Button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-body-md font-medium">Two-factor authentication</div>
              <div className="text-body-sm text-gray-600">
                {twoFactorEnabled ? 'Enabled - Your account is protected' : 'Add extra security to your account'}
              </div>
            </div>
          </div>
          <Button 
            variant={twoFactorEnabled ? "outline" : "primary"}
            size="sm"
            onClick={handleTwoFactorToggle}
            isLoading={twoFactorState?.success === undefined && twoFactorState !== undefined}
          >
            {twoFactorEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {/* Data Download */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-body-md font-medium">Download my data</div>
              <div className="text-body-sm text-gray-600">Get a copy of your account data</div>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowDataModal(true)}
            isLoading={dataDownloadState?.success === undefined && dataDownloadState !== undefined}
          >
            Request
          </Button>
        </div>

        {/* Account Deletion */}
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-body-md font-medium text-red-900">Delete account</div>
              <div className="text-body-sm text-red-700">Permanently delete your account and all data</div>
            </div>
          </div>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            isLoading={deleteAccountState?.success === undefined && deleteAccountState !== undefined}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal 
        isOpen={showPasswordModal} 
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-charcoal mb-2">
              Current Password *
            </label>
            <Input
              id="current-password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-charcoal mb-2">
              New Password *
            </label>
            <Input
              id="new-password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full"
            />
            <div className="mt-2 space-y-1">
              <div className={cn(
                'text-xs',
                passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'
              )}>
                ✓ At least 8 characters
              </div>
              <div className={cn(
                'text-xs',
                /[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'
              )}>
                ✓ One uppercase letter
              </div>
              <div className={cn(
                'text-xs',
                /[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'
              )}>
                ✓ One lowercase letter
              </div>
              <div className={cn(
                'text-xs',
                /\d/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'
              )}>
                ✓ One number
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-charcoal mb-2">
              Confirm New Password *
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full"
            />
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <div className="flex space-x-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={!isPasswordValid()}
              isLoading={passwordState?.success === undefined && passwordState !== undefined}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Data Download Modal */}
      <Modal 
        isOpen={showDataModal} 
        onClose={() => setShowDataModal(false)}
        title="Download Your Data"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose what data you'd like to download:
          </p>
          
          <div className="space-y-3">
            {[
              { id: 'all', label: 'All Data', description: 'Complete account information, trips, earnings, and settings' },
              { id: 'profile', label: 'Profile Data', description: 'Personal information and account details' },
              { id: 'trips', label: 'Trip History', description: 'All completed trips and related information' },
              { id: 'earnings', label: 'Earnings Data', description: 'Payment history and earnings records' }
            ].map((option) => (
              <div key={option.id}>
                <Button
                  variant="outline"
                  onClick={() => handleDataDownload(option.id)}
                  className="w-full text-left justify-start h-auto p-4"
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </div>
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Your data will be prepared and sent to your registered email address within 24 hours.
            </p>
          </div>
        </div>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
          setDeletePassword('');
        }}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">This action cannot be undone</h4>
              <p className="text-sm text-red-700">
                Deleting your account will permanently remove all your data, including:
              </p>
            </div>
          </div>

          <ul className="text-sm text-gray-600 space-y-1 pl-4">
            <li>• Personal profile and contact information</li>
            <li>• Trip history and earnings records</li>
            <li>• Vehicle registrations and documents</li>
            <li>• Payment and banking information</li>
            <li>• Account settings and preferences</li>
          </ul>

          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Type "DELETE MY ACCOUNT" to confirm:
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Enter your password to confirm:
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex space-x-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleAccountDeletion}
              disabled={!isDeleteValid()}
              isLoading={deleteAccountState?.success === undefined && deleteAccountState !== undefined}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Messages */}
      {passwordState?.message && (
        <div className={cn(
          'mt-4 p-4 rounded-lg',
          passwordState.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {passwordState.message}
        </div>
      )}
      
      {twoFactorState?.message && (
        <div className={cn(
          'mt-4 p-4 rounded-lg',
          twoFactorState.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {twoFactorState.message}
        </div>
      )}
      
      {dataDownloadState?.message && (
        <div className={cn(
          'mt-4 p-4 rounded-lg',
          dataDownloadState.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {dataDownloadState.message}
        </div>
      )}
      
      {deleteAccountState?.message && (
        <div className={cn(
          'mt-4 p-4 rounded-lg',
          deleteAccountState.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {deleteAccountState.message}
        </div>
      )}
    </>
  );
}