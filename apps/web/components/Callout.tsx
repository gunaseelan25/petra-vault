import { cn } from '@/lib/utils';
import {
  CheckIcon,
  ExclamationTriangleIcon,
  GlobeIcon
} from '@radix-ui/react-icons';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const calloutVariants = cva('flex items-center gap-4 rounded-md p-4', {
  variants: {
    status: {
      loading: 'bg-yellow-400/10 text-yellow-700',
      error: 'bg-red-400/10 text-red-700',
      success: 'bg-green-400/10 text-green-700'
    }
  },
  defaultVariants: {
    status: 'success'
  }
});

const iconContainerVariants = cva('rounded-full', {
  variants: {
    status: {
      loading: 'bg-yellow-400 outline-yellow-400',
      error: 'bg-red-400 outline-red-400',
      success: 'bg-green-400 outline-green-400'
    }
  },
  defaultVariants: {
    status: 'success'
  }
});

const titleVariants = cva('font-display font-bold', {
  variants: {
    status: {
      loading: 'text-yellow-700',
      error: 'text-red-700',
      success: 'text-green-700'
    }
  },
  defaultVariants: {
    status: 'success'
  }
});

const descriptionVariants = cva('text-sm', {
  variants: {
    status: {
      loading: 'text-yellow-700/50',
      error: 'text-red-700/50',
      success: 'text-green-700/50'
    }
  },
  defaultVariants: {
    status: 'success'
  }
});

type CalloutProps = VariantProps<typeof calloutVariants> & {
  title: string;
  description: string | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export default function Callout({
  status = 'success',
  title,
  description,
  icon,
  className
}: CalloutProps) {
  // Default icons based on status
  const getDefaultIcon = () => {
    switch (status) {
      case 'loading':
        return <GlobeIcon className="w-6 h-6 p-1 text-white" />;
      case 'error':
        return (
          <ExclamationTriangleIcon className="w-6 h-6 p-1.5 overflow-visible text-white" />
        );
      case 'success':
      default:
        return <CheckIcon className="w-6 h-6 text-white" />;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <div className={cn(calloutVariants({ status }), className)}>
      <div className={iconContainerVariants({ status })}>{displayIcon}</div>
      <div>
        <h3 className={titleVariants({ status })}>{title}</h3>
        <div className={descriptionVariants({ status })}>{description}</div>
      </div>
    </div>
  );
}
