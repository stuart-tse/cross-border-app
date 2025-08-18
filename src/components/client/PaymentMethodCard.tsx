'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'DIGITAL_WALLET' | 'BANK_ACCOUNT';
  last4Digits?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  walletType?: string;
  billingAddress?: any;
  isDefault: boolean;
  createdAt: string;
}

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onEdit: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onEdit,
  onDelete,
  onSetDefault,
  isLoading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    cardholderName: paymentMethod.cardholderName || '',
    expiryMonth: paymentMethod.expiryMonth || '',
    expiryYear: paymentMethod.expiryYear || '',
    billingAddress: paymentMethod.billingAddress || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Hong Kong'
    }
  });

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
      case 'american express':
        return '💳';
      default:
        return '💳';
    }
  };

  const getWalletIcon = (walletType?: string) => {
    switch (walletType?.toLowerCase()) {
      case 'wechat':
      case 'wechat pay':
        return '💬';
      case 'alipay':
        return '🅰️';
      case 'apple pay':
        return '🍎';
      case 'google pay':
        return '🔍';
      default:
        return '💰';
    }
  };

  const handleSave = async () => {
    try {
      await onEdit(paymentMethod.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(paymentMethod.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const handleSetDefault = async () => {
    try {
      await onSetDefault(paymentMethod.id);
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const formatExpiryDate = () => {
    if (!paymentMethod.expiryMonth || !paymentMethod.expiryYear) return '';
    return `${paymentMethod.expiryMonth.toString().padStart(2, '0')}/${paymentMethod.expiryYear.toString().slice(-2)}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <Card className={cn(
        'p-6 transition-all duration-200',
        paymentMethod.isDefault && 'ring-2 ring-hot-pink ring-opacity-50',
        isEditing && 'shadow-lg'
      )}>
        {paymentMethod.isDefault && (
          <div className="absolute -top-2 -right-2 bg-hot-pink text-white text-xs px-2 py-1 rounded-full">
            Default
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {paymentMethod.type === 'DIGITAL_WALLET' 
                ? getWalletIcon(paymentMethod.walletType)
                : getCardIcon(paymentMethod.cardBrand)
              }
            </div>
            <div>
              <h3 className="text-title-sm font-semibold text-charcoal">
                {paymentMethod.type === 'DIGITAL_WALLET' 
                  ? paymentMethod.walletType
                  : `${paymentMethod.cardBrand} ${paymentMethod.type === 'CREDIT_CARD' ? 'Credit' : 'Debit'}`
                }
              </h3>
              <p className="text-body-sm text-gray-600">
                {paymentMethod.type === 'DIGITAL_WALLET' 
                  ? paymentMethod.walletType
                  : `•••• •••• •••• ${paymentMethod.last4Digits}`
                }
              </p>
              {paymentMethod.type !== 'DIGITAL_WALLET' && (
                <p className="text-body-sm text-gray-500">
                  Expires {formatExpiryDate()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!paymentMethod.isDefault && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSetDefault}
                disabled={isLoading}
                className="text-body-sm"
              >
                Set Default
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
              className="text-error-red hover:text-error-red hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {paymentMethod.type !== 'DIGITAL_WALLET' && (
                    <>
                      <Input
                        label="Cardholder Name"
                        value={formData.cardholderName}
                        onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                        placeholder="Name on card"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Expiry Month"
                          type="number"
                          value={formData.expiryMonth}
                          onChange={(e) => setFormData({ ...formData, expiryMonth: parseInt(e.target.value) || '' })}
                          placeholder="MM"
                          min="1"
                          max="12"
                        />
                        <Input
                          label="Expiry Year"
                          type="number"
                          value={formData.expiryYear}
                          onChange={(e) => setFormData({ ...formData, expiryYear: parseInt(e.target.value) || '' })}
                          placeholder="YYYY"
                          min={new Date().getFullYear()}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Billing Address */}
                <div className="mb-4">
                  <h4 className="text-body-md font-medium text-charcoal mb-2">Billing Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Street Address"
                      value={formData.billingAddress.street}
                      onChange={(e) => setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, street: e.target.value }
                      })}
                      placeholder="123 Main Street"
                    />
                    
                    <Input
                      label="City"
                      value={formData.billingAddress.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, city: e.target.value }
                      })}
                      placeholder="Hong Kong"
                    />
                    
                    <Input
                      label="State/Region"
                      value={formData.billingAddress.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, state: e.target.value }
                      })}
                      placeholder="Hong Kong"
                    />
                    
                    <Input
                      label="Postal Code"
                      value={formData.billingAddress.zipCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, zipCode: e.target.value }
                      })}
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-hot-pink to-deep-pink"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 m-4 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-title-md font-semibold text-charcoal mb-2">
                  Delete Payment Method
                </h3>
                <p className="text-body-md text-gray-600 mb-6">
                  Are you sure you want to delete this payment method? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="bg-error-red hover:bg-red-700"
                  >
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};