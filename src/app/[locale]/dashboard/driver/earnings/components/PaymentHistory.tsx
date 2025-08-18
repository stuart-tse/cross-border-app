'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Payment {
  id: string;
  date: string;
  type: 'earning' | 'payout' | 'fee';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'transferred' | 'processed';
}

interface PaymentHistoryProps {
  payments: Payment[];
}

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  const getPaymentTypeIcon = (type: Payment['type']) => {
    switch (type) {
      case 'earning': return '💰';
      case 'payout': return '📤';
      case 'fee': return '📊';
      default: return '💳';
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed', icon: '✅' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: '⏳' },
      transferred: { color: 'bg-blue-100 text-blue-800', text: 'Transferred', icon: '🔄' },
      processed: { color: 'bg-purple-100 text-purple-800', text: 'Processed', icon: '✨' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const color = isNegative ? 'text-red-600' : 'text-green-600';
    const prefix = isNegative ? '-' : '+';
    
    return (
      <span className={`font-semibold ${color}`}>
        {prefix}HK${absAmount.toLocaleString()}
      </span>
    );
  };

  return (
    <Card className="tesla-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-title-lg font-semibold text-charcoal">Payment History</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Filter</Button>
          <Button variant="secondary" size="sm">Export</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {payments.map((payment) => (
          <div 
            key={payment.id} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-xl">{getPaymentTypeIcon(payment.type)}</span>
              </div>
              <div>
                <h4 className="text-body-md font-semibold text-charcoal">
                  {payment.description}
                </h4>
                <p className="text-body-sm text-gray-600">{payment.date}</p>
              </div>
            </div>
            <div className="text-right flex items-center space-x-3">
              <div>
                <div className="text-title-md">
                  {formatAmount(payment.amount)}
                </div>
                {getStatusBadge(payment.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-title-md font-semibold text-charcoal mb-1">Total Earnings</h4>
            <div className="text-display-sm font-bold text-green-600">
              HK${payments
                .filter(p => p.amount > 0)
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </div>
            <div className="text-body-sm text-gray-600">This period</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-title-md font-semibold text-charcoal mb-1">Net Amount</h4>
            <div className="text-display-sm font-bold text-blue-600">
              HK${payments
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </div>
            <div className="text-body-sm text-gray-600">After fees</div>
          </div>
        </div>
      </div>
    </Card>
  );
}