/**
 * Button Component for AI Voice Assistant
 * Comprehensive button with multiple variants, sizes, and states
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        voice: 'bg-voice-listening text-white hover:bg-voice-listening/90 shadow-lg hover:shadow-xl transition-all duration-300',
        voiceListening: 'bg-voice-listening text-white animate-pulse shadow-lg',
        voiceProcessing: 'bg-voice-processing text-white animate-pulse shadow-lg',
        voiceSpeaking: 'bg-voice-speaking text-white animate-pulse shadow-lg',
        voiceError: 'bg-voice-error text-white hover:bg-voice-error/90',
        calendar: 'bg-calendar-meeting text-white hover:bg-calendar-meeting/90',
        success: 'bg-success text-white hover:bg-success/90',
        warning: 'bg-warning text-white hover:bg-warning/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-14 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
        voice: 'h-16 w-16 rounded-full',
        voiceLarge: 'h-20 w-20 rounded-full',
        voiceXLarge: 'h-24 w-24 rounded-full',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        spin: 'animate-spin',
        voiceWave: 'animate-voice-wave',
        voicePulse: 'animate-voice-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  voiceState?: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      voiceState,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Determine variant based on voice state
    let finalVariant = variant;
    if (voiceState) {
      switch (voiceState) {
        case 'listening':
          finalVariant = 'voiceListening';
          break;
        case 'processing':
          finalVariant = 'voiceProcessing';
          break;
        case 'speaking':
          finalVariant = 'voiceSpeaking';
          break;
        case 'error':
          finalVariant = 'voiceError';
          break;
        default:
          finalVariant = 'voice';
          break;
      }
    }

    // Determine size based on voice state
    let finalSize = size;
    if (voiceState && !size) {
      finalSize = 'voice';
    }

    // Determine animation based on voice state
    let finalAnimation = animation;
    if (voiceState && !animation) {
      switch (voiceState) {
        case 'listening':
          finalAnimation = 'voicePulse';
          break;
        case 'processing':
          finalAnimation = 'pulse';
          break;
        case 'speaking':
          finalAnimation = 'voiceWave';
          break;
        default:
          finalAnimation = 'none';
          break;
      }
    }

    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          buttonVariants({
            variant: finalVariant,
            size: finalSize,
            animation: finalAnimation,
            className,
          })
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {loading && loadingText ? loadingText : children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
