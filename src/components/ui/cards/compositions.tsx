'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BaseCard } from './BaseCard';
import { CardHeader, CardBody, CardActions } from './CardContent';
import { Button } from '../Button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Service Card Composition
interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  price?: string;
  onBookNow?: () => void;
  onLearnMore?: () => void;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  features,
  price,
  onBookNow,
  onLearnMore,
  className
}) => {
  return (
    <BaseCard variant="service" className={cn('flex flex-col h-full', className)}>
      <div className="mb-4 text-chinese-red">
        {icon}
      </div>
      
      <CardHeader
        title={title}
        subtitle={description}
      />
      
      <CardBody className="flex-grow">
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
      </CardBody>
      
      <CardActions className="mt-auto">
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
      </CardActions>
    </BaseCard>
  );
};

// Vehicle Card Composition
interface VehicleCardProps {
  name: string;
  category: string;
  capacity: number;
  luggage: string;
  price: string;
  features: string[];
  image: string;
  onSelect?: () => void;
  className?: string;
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
  className
}) => {
  return (
    <BaseCard className={cn('overflow-hidden', className)} padding="md">
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
        <CardHeader
          title={name}
          subtitle={`${category} class`}
        />
        
        <CardBody>
          <div className="flex items-center gap-4 text-body-sm text-gray-600 mb-3">
            <span>👥 {capacity} passengers</span>
            <span>🧳 {luggage}</span>
          </div>
          
          <div className="text-title-sm font-semibold text-chinese-red mb-3">
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
        </CardBody>
        
        {onSelect && (
          <CardActions>
            <Button
              variant="primary"
              size="sm"
              onClick={onSelect}
              className="w-full"
            >
              Select & Book
            </Button>
          </CardActions>
        )}
      </div>
    </BaseCard>
  );
};

// Profile Card Composition
interface ProfileCardSimpleProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    profile?: {
      profileCompletion: number;
      documentVerified: boolean;
    };
  };
  onEdit?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const ProfileCardSimple: React.FC<ProfileCardSimpleProps> = ({
  user,
  onEdit,
  children,
  className
}) => {
  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return 'text-success-green';
    if (completion >= 50) return 'text-warning-amber';
    return 'text-error-red';
  };

  return (
    <BaseCard className={className} padding="md">
      <CardHeader
        title={
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <span className="text-xl text-gray-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-title-lg font-semibold text-charcoal">{user.name}</h2>
              <p className="text-body-md text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-4 mt-1">
                <div className={cn('text-body-sm font-medium', getCompletionColor(user.profile?.profileCompletion || 0))}>
                  Profile {user.profile?.profileCompletion || 0}% Complete
                </div>
                {user.profile?.documentVerified && (
                  <div className="flex items-center text-success-green text-body-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        actions={onEdit && (
          <Button variant="primary" onClick={onEdit}>
            Edit Profile
          </Button>
        )}
      />
      
      {children && (
        <CardBody>
          {children}
        </CardBody>
      )}
    </BaseCard>
  );
};