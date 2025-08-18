'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'service' | 'feature' | 'testimonial';
  hover?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = true,
  children,
  className,
  ...props
}) => {
  const baseClasses = cn(
    'rounded-md transition-all duration-standard ease-primary',
    hover && 'hover:shadow-md hover:-translate-y-1'
  );

  const variantClasses = {
    default: 'bg-white border border-gray-200 p-6 shadow-sm',
    service: 'bg-white border border-light-gray p-6 shadow-sm',
    feature: 'bg-gray-50 p-8 text-center',
    testimonial: 'bg-white p-6 shadow-sm border border-gray-100',
  };

  const MotionCard = hover ? motion.div : 'div';

  const motionProps = hover ? {
    whileHover: { 
      y: -4,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      transition: { duration: 0.2 }
    }
  } : {};

  return (
    <MotionCard
      className={cn(baseClasses, variantClasses[variant], className)}
      {...(hover ? motionProps : {})}
      {...(props as any)}
    >
      {children}
    </MotionCard>
  );
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  price?: string;
  onBookNow?: () => void;
  onLearnMore?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  features,
  price,
  onBookNow,
  onLearnMore,
}) => {
  return (
    <Card variant="service" className="flex flex-col h-full">
      <div className="mb-4 text-chinese-red">
        {icon}
      </div>
      
      <h3 className="text-title-md font-semibold text-charcoal mb-3">
        {title}
      </h3>
      
      <p className="text-body-md text-gray-600 mb-5 flex-grow">
        {description}
      </p>
      
      <ul className="mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-body-sm text-gray-700">
            <span className="w-4 h-4 bg-success-green rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </span>
            {feature}
          </li>
        ))}
      </ul>
      
      {price && (
        <div className="mb-4 text-title-sm font-semibold text-chinese-red">
          {price}
        </div>
      )}
      
      <div className="flex gap-3 mt-auto">
        {onBookNow && (
          <Button
            variant="primary"
            size="sm"
            onClick={onBookNow}
            className="flex-1"
          >
            Book Now
          </Button>
        )}
        {onLearnMore && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onLearnMore}
            className="flex-1"
          >
            Learn More
          </Button>
        )}
      </div>
    </Card>
  );
};

interface VehicleCardProps {
  name: string;
  category: string;
  capacity: number;
  luggage: string;
  price: string;
  features: string[];
  image: string;
  onSelect?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  name,
  category,
  capacity,
  luggage,
  price,
  features,
  image,
  onSelect,
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-200 mb-4 overflow-hidden rounded-sm">
        <motion.img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="text-title-md font-semibold text-charcoal">{name}</h3>
          <p className="text-body-sm text-gray-500 capitalize">{category} class</p>
        </div>
        
        <div className="flex items-center gap-4 text-body-sm text-gray-600">
          <span>👥 {capacity} passengers</span>
          <span>🧳 {luggage}</span>
        </div>
        
        <div className="text-title-sm font-semibold text-chinese-red">
          {price}
        </div>
        
        <ul className="space-y-1">
          {features.slice(0, 3).map((feature, index) => (
            <li key={index} className="text-body-sm text-gray-600 flex items-center">
              <span className="w-1.5 h-1.5 bg-electric-blue rounded-full mr-2" />
              {feature}
            </li>
          ))}
        </ul>
        
        {onSelect && (
          <Button
            variant="primary"
            size="sm"
            onClick={onSelect}
            className="w-full"
          >
            Select & Book
          </Button>
        )}
      </div>
    </Card>
  );
};

