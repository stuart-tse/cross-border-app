'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface EarningsData {
  date: string;
  amount: number;
}

interface EarningsChartProps {
  data: EarningsData[];
}

export default function EarningsChart({ data }: EarningsChartProps) {
  const maxAmount = Math.max(...data.map(d => d.amount));
  
  return (
    <Card className="tesla-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-title-lg font-semibold text-charcoal">Earnings Trend</h3>
        <span className="text-body-sm text-gray-500">Last 7 days</span>
      </div>
      
      {/* Simple bar chart visualization */}
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.amount / maxAmount) * 100;
          return (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-body-sm text-gray-600">
                {new Date(item.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex-1 relative">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-hot-pink to-deep-pink h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-20 text-right text-body-sm font-semibold text-hot-pink">
                HK${item.amount.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-title-sm font-bold text-charcoal">
            HK${data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
          </div>
          <div className="text-body-sm text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className="text-title-sm font-bold text-charcoal">
            HK${Math.round(data.reduce((sum, item) => sum + item.amount, 0) / data.length).toLocaleString()}
          </div>
          <div className="text-body-sm text-gray-500">Average</div>
        </div>
        <div className="text-center">
          <div className="text-title-sm font-bold text-success-green">
            +12%
          </div>
          <div className="text-body-sm text-gray-500">Growth</div>
        </div>
      </div>
    </Card>
  );
}