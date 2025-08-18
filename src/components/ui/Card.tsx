'use client';

import React from 'react';
import { BaseCard } from './cards/BaseCard';
import { cn } from '@/lib/utils';
import { Button } from './Button';

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

// Re-export ServiceCard from compositions for backward compatibility
export { ServiceCard } from './cards/compositions';

// Re-export VehicleCard from compositions for backward compatibility
export { VehicleCard } from './cards/compositions';

// Export all card components for easy importing
export { BaseCard } from './cards/BaseCard';
export { CardHeader, CardBody, CardFooter, CardActions, CardContent } from './cards/CardContent';
export { ProfileCardSimple } from './cards/compositions';

