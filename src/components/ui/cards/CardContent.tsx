'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title, subtitle, actions, className, children, ...rest
}) => {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-title-md font-semibold text-charcoal truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-body-sm text-gray-600 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return (
    <div className={cn('flex-1', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className,
  divided = false 
}) => {
  return (
    <div className={cn(
      'mt-4',
      divided && 'pt-4 border-t border-gray-200',
      className
    )}>
      {children}
    </div>
  );
};

interface CardActionsProps {
  children: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'center' | 'right' | 'between';
}

export const CardActions: React.FC<CardActionsProps> = ({ 
  children, 
  className,
  alignment = 'right'
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={cn(
      'flex items-center gap-2 mt-4',
      alignmentClasses[alignment],
      className
    )}>
      {children}
    </div>
  );
};

interface CardContentProps {
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  header,
  body,
  footer,
  actions,
  className,
  children
}) => {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {header}
      {body}
      {children}
      {footer}
      {actions}
    </div>
  );
};