'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useHydration } from '@/lib/hooks/useHydration';

interface MetricData {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: 'pink' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

interface AdminMetricsProps {
  className?: string;
}

const AdminMetrics: React.FC<AdminMetricsProps> = ({ className }) => {
  const hasHydrated = useHydration();
  
  // Static metrics that don't change on each render
  const metrics: MetricData[] = [
    {
      label: 'Total Users',
      value: 1247,
      change: 12,
      changeLabel: '+12% this month',
      icon: '👤',
      color: 'pink'
    },
    {
      label: 'Active Drivers',
      value: 89,
      change: 5,
      changeLabel: '+5 new this week',
      icon: '🚗',
      color: 'blue'
    },
    {
      label: 'Completed Trips',
      value: 8562,
      change: 8,
      changeLabel: '+8% this month',
      icon: '✅',
      color: 'green'
    },
    {
      label: 'Monthly Revenue',
      value: 'HK$2.5M',
      change: 15,
      changeLabel: '+15% this month',
      icon: '💰',
      color: 'green'
    },
    {
      label: 'Pending Approvals',
      value: 23,
      change: -3,
      changeLabel: '3 completed today',
      icon: '⏳',
      color: 'yellow'
    },
    {
      label: 'Support Tickets',
      value: 7,
      change: 2,
      changeLabel: '2 new today',
      icon: '🎫',
      color: 'red'
    }
  ];

  // Initialize with static values to prevent hydration mismatch
  const [liveMetrics, setLiveMetrics] = useState({
    activeUsers: 267,
    onlineDrivers: 45,
    responseTime: 89
  });

  // Simulate real-time updates only on client side
  useEffect(() => {
    if (!hasHydrated) return;
    
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        activeUsers: Math.max(200, Math.min(300, prev.activeUsers + Math.floor(Math.random() * 10) - 5)),
        onlineDrivers: Math.max(30, Math.min(60, prev.onlineDrivers + Math.floor(Math.random() * 6) - 3)),
        responseTime: Math.max(50, Math.min(150, prev.responseTime + Math.floor(Math.random() * 20) - 10))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [hasHydrated]);

  const getColorClasses = (color: MetricData['color']) => {
    switch (color) {
      case 'pink':
        return 'text-[#FF69B4] bg-[#FF69B4]/10 border-[#FF69B4]/20';
      case 'blue':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'purple':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="text-center hover:shadow-lg transition-all duration-200">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border text-xl',
                getColorClasses(metric.color)
              )}>
                <span aria-hidden="true">{metric.icon}</span>
              </div>
              
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                {metric.label}
              </div>
              
              <div className={cn('text-xs font-medium', getChangeColor(metric.change))}>
                {metric.changeLabel}
              </div>
              
              {/* Progress bar for visual indicator */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    metric.color === 'pink' && 'bg-[#FF69B4]',
                    metric.color === 'blue' && 'bg-blue-500',
                    metric.color === 'green' && 'bg-green-500',
                    metric.color === 'yellow' && 'bg-yellow-500',
                    metric.color === 'red' && 'bg-red-500',
                    metric.color === 'purple' && 'bg-purple-500'
                  )}
                  style={{ 
                    width: `${Math.min(100, Math.max(20, Math.abs(metric.change) * 5))}%` 
                  }}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Real-time Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Real-time System Metrics</h3>
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                hasHydrated ? "bg-green-400 animate-pulse" : "bg-gray-400"
              )} />
              <span className="text-sm text-gray-300">{hasHydrated ? 'Live' : 'Static'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Users */}
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF69B4] mb-2">
                {liveMetrics.activeUsers}
              </div>
              <div className="text-sm text-gray-300 mb-3">Active Users</div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Clients: {Math.floor(liveMetrics.activeUsers * 0.7)}</span>
                <span>Drivers: {Math.floor(liveMetrics.activeUsers * 0.3)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-[#FF69B4] h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(liveMetrics.activeUsers / 300) * 100}%` }}
                />
              </div>
            </div>

            {/* Online Drivers */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {liveMetrics.onlineDrivers}
              </div>
              <div className="text-sm text-gray-300 mb-3">Online Drivers</div>
              <div className="text-xs text-gray-400 mb-2">
                Available: {Math.floor(liveMetrics.onlineDrivers * 0.8)}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(liveMetrics.onlineDrivers / 60) * 100}%` }}
                />
              </div>
            </div>

            {/* Response Time */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {liveMetrics.responseTime}ms
              </div>
              <div className="text-sm text-gray-300 mb-3">Avg Response Time</div>
              <div className="text-xs text-gray-400 mb-2">
                Target: &lt;100ms
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={cn(
                    'h-2 rounded-full transition-all duration-1000',
                    liveMetrics.responseTime < 100 ? 'bg-green-400' : 'bg-yellow-400'
                  )}
                  style={{ width: `${Math.min(100, (liveMetrics.responseTime / 150) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* System Health Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span className="text-sm font-medium text-gray-700">Server Status</span>
          </div>
          <div className="text-lg font-bold text-green-600">Healthy</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span className="text-sm font-medium text-gray-700">Database</span>
          </div>
          <div className="text-lg font-bold text-green-600">Connected</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span className="text-sm font-medium text-gray-700">Uptime</span>
          </div>
          <div className="text-lg font-bold text-green-600">99.8%</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
            <span className="text-sm font-medium text-gray-700">Queue Status</span>
          </div>
          <div className="text-lg font-bold text-yellow-600">Busy</div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminMetrics;