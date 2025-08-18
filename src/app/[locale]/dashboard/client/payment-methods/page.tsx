'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { PaymentMethodCard } from '@/components/client/PaymentMethodCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SimpleToast } from '@/components/ui/SimpleToast';
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

const ClientPaymentMethodsPage: React.FC = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'CREDIT_CARD' as 'CREDIT_CARD' | 'DEBIT_CARD' | 'DIGITAL_WALLET',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    walletType: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Hong Kong'
    }
  });

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('/api/client/payment-methods');
        if (response.ok) {
          const data = await response.json();
          setPaymentMethods(data.paymentMethods);
        } else {
          throw new Error('Failed to fetch payment methods');
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setToast({ type: 'error', message: 'Failed to load payment methods' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleAddPaymentMethod = async () => {
    setIsProcessing(true);
    try {
      // In a real app, you would integrate with a payment processor here
      // For demo purposes, we'll simulate processing
      const paymentData = {
        type: newPaymentMethod.type,
        last4Digits: newPaymentMethod.cardNumber.slice(-4),
        cardBrand: getCardBrand(newPaymentMethod.cardNumber),
        expiryMonth: parseInt(newPaymentMethod.expiryMonth),
        expiryYear: parseInt(newPaymentMethod.expiryYear),
        cardholderName: newPaymentMethod.cardholderName,
        walletType: newPaymentMethod.walletType || undefined,
        billingAddress: newPaymentMethod.billingAddress,
        // In production, you'd get these from your payment processor
        tokenId: `tok_${Date.now()}`,
        fingerprint: `fp_${Date.now()}`,
        isDefault: paymentMethods.length === 0 // First method becomes default
      };

      const response = await fetch('/api/client/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods([...paymentMethods, data.paymentMethod]);
        setNewPaymentMethod({
          type: 'CREDIT_CARD',
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          cardholderName: '',
          walletType: '',
          billingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Hong Kong'
          }
        });
        setShowAddForm(false);
        setToast({ type: 'success', message: 'Payment method added successfully' });
      } else {
        throw new Error('Failed to add payment method');
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      setToast({ type: 'error', message: 'Failed to add payment method' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPaymentMethod = async (id: string, data: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/client/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setPaymentMethods(methods =>
          methods.map(method =>
            method.id === id ? updatedData.paymentMethod : method
          )
        );
        setToast({ type: 'success', message: 'Payment method updated successfully' });
      } else {
        throw new Error('Failed to update payment method');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      setToast({ type: 'error', message: 'Failed to update payment method' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/client/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPaymentMethods(methods => methods.filter(method => method.id !== id));
        setToast({ type: 'success', message: 'Payment method deleted successfully' });
      } else {
        throw new Error('Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setToast({ type: 'error', message: 'Failed to delete payment method' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    await handleEditPaymentMethod(id, { isDefault: true });
    // Update local state to reflect the change
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19); // Limit to 16 digits + 3 spaces
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-hot-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-md text-gray-600">Loading your payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-headline-md font-bold text-charcoal mb-2">Payment Methods</h1>
            <p className="text-body-lg text-gray-600">
              Manage your payment methods and billing information
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-hot-pink to-deep-pink"
          >
            Add Payment Method
          </Button>
        </motion.div>

        {/* Add Payment Method Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="p-6">
                <h2 className="text-title-lg font-semibold text-charcoal mb-6">
                  Add New Payment Method
                </h2>

                {/* Payment Type Selection */}
                <div className="mb-6">
                  <label className="block text-body-sm font-medium text-charcoal mb-2">
                    Payment Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
                      { value: 'DEBIT_CARD', label: 'Debit Card', icon: '💳' },
                      { value: 'DIGITAL_WALLET', label: 'Digital Wallet', icon: '💰' },
                      { value: 'BANK_ACCOUNT', label: 'Bank Account', icon: '🏦' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setNewPaymentMethod({ ...newPaymentMethod, type: type.value as any })}
                        className={cn(
                          'flex flex-col items-center p-4 border-2 rounded-lg transition-colors',
                          newPaymentMethod.type === type.value
                            ? 'border-hot-pink bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <span className="text-2xl mb-2">{type.icon}</span>
                        <span className="text-body-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Details (for card types) */}
                {(newPaymentMethod.type === 'CREDIT_CARD' || newPaymentMethod.type === 'DEBIT_CARD') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <Input
                        label="Card Number"
                        value={newPaymentMethod.cardNumber}
                        onChange={(e) => setNewPaymentMethod({
                          ...newPaymentMethod,
                          cardNumber: formatCardNumber(e.target.value)
                        })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <Input
                      label="Cardholder Name"
                      value={newPaymentMethod.cardholderName}
                      onChange={(e) => setNewPaymentMethod({
                        ...newPaymentMethod,
                        cardholderName: e.target.value
                      })}
                      placeholder="John Doe"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        label="Month"
                        type="number"
                        value={newPaymentMethod.expiryMonth}
                        onChange={(e) => setNewPaymentMethod({
                          ...newPaymentMethod,
                          expiryMonth: e.target.value
                        })}
                        placeholder="MM"
                        min="1"
                        max="12"
                      />
                      <Input
                        label="Year"
                        type="number"
                        value={newPaymentMethod.expiryYear}
                        onChange={(e) => setNewPaymentMethod({
                          ...newPaymentMethod,
                          expiryYear: e.target.value
                        })}
                        placeholder="YYYY"
                        min={new Date().getFullYear()}
                      />
                      <Input
                        label="CVV"
                        value={newPaymentMethod.cvv}
                        onChange={(e) => setNewPaymentMethod({
                          ...newPaymentMethod,
                          cvv: e.target.value
                        })}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}

                {/* Digital Wallet Details */}
                {newPaymentMethod.type === 'DIGITAL_WALLET' && (
                  <div className="mb-6">
                    <label className="block text-body-sm font-medium text-charcoal mb-2">
                      Wallet Type
                    </label>
                    <select
                      value={newPaymentMethod.walletType}
                      onChange={(e) => setNewPaymentMethod({
                        ...newPaymentMethod,
                        walletType: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent"
                    >
                      <option value="">Select Wallet Type</option>
                      <option value="WeChat Pay">WeChat Pay</option>
                      <option value="Alipay">Alipay</option>
                      <option value="Apple Pay">Apple Pay</option>
                      <option value="Google Pay">Google Pay</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                )}

                {/* Billing Address */}
                <div className="mb-6">
                  <h3 className="text-title-sm font-medium text-charcoal mb-4">Billing Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Street Address"
                        value={newPaymentMethod.billingAddress.street}
                        onChange={(e) => setNewPaymentMethod({
                          ...newPaymentMethod,
                          billingAddress: {
                            ...newPaymentMethod.billingAddress,
                            street: e.target.value
                          }
                        })}
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <Input
                      label="City"
                      value={newPaymentMethod.billingAddress.city}
                      onChange={(e) => setNewPaymentMethod({
                        ...newPaymentMethod,
                        billingAddress: {
                          ...newPaymentMethod.billingAddress,
                          city: e.target.value
                        }
                      })}
                      placeholder="Hong Kong"
                    />
                    
                    <Input
                      label="State/Region"
                      value={newPaymentMethod.billingAddress.state}
                      onChange={(e) => setNewPaymentMethod({
                        ...newPaymentMethod,
                        billingAddress: {
                          ...newPaymentMethod.billingAddress,
                          state: e.target.value
                        }
                      })}
                      placeholder="Hong Kong"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddForm(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddPaymentMethod}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-hot-pink to-deep-pink"
                  >
                    {isProcessing ? 'Adding...' : 'Add Payment Method'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-title-lg font-semibold text-charcoal mb-2">
                No Payment Methods Added
              </h3>
              <p className="text-body-md text-gray-600 mb-6">
                Add a payment method to start booking trips seamlessly
              </p>
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-hot-pink to-deep-pink"
              >
                Add Your First Payment Method
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PaymentMethodCard
                    paymentMethod={method}
                    onEdit={handleEditPaymentMethod}
                    onDelete={handleDeletePaymentMethod}
                    onSetDefault={handleSetDefault}
                    isLoading={isProcessing}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="text-electric-blue text-xl">🔒</div>
              <div>
                <h3 className="text-title-sm font-semibold text-charcoal mb-2">
                  Your Payment Information is Secure
                </h3>
                <p className="text-body-sm text-gray-600">
                  We use industry-standard encryption to protect your payment information. 
                  Your card details are never stored on our servers and are processed securely 
                  through our certified payment partners.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Toast Notification */}
        {toast && (
          <SimpleToast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default withAuth(ClientPaymentMethodsPage, [UserType.CLIENT]);