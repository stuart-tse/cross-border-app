'use client';

import React from 'react';
import { BaseCard } from './cards/BaseCard';
import { cn } from '@/lib/utils';

// Export BaseCard for direct usage
export { BaseCard } from './cards/BaseCard';

// Re-export BaseCard as Card for backward compatibility
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'service' | 'feature' | 'testimonial' | 'glass' | 'elevated' | 'gradient';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  asMotion?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = true,
  padding = 'lg',
  children,
  className,
  asMotion = false,
  ...props
}) => {
  return (
    <BaseCard
      variant={variant}
      hover={hover}
      padding={padding}
      className={className}
      asMotion={asMotion}
      {...props}
    >
      {children}
    </BaseCard>
  );
};

// Export card components that are expected by the forms
export { CardHeader, CardBody, CardFooter, CardActions, CardContent } from './cards/CardContent';

// Export composed card components
export { ServiceCard, VehicleCard, ProfileCardSimple } from './cards/compositions';

// Simple CardTitle component
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => {
  return (
    <h3 
      className={cn('text-title-md font-semibold text-charcoal', className)} 
      {...props}
    >
      {children}
    </h3>
  );
};