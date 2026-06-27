import React from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-ai-blue disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer'
    
    const variants = {
      primary: 'bg-gradient-to-r from-ai-blue to-ai-purple text-white hover:from-ai-blue/90 hover:to-ai-purple/90 border border-transparent shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:ring-ai-purple',
      secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 focus:ring-gray-600',
      danger: 'bg-red-600 hover:bg-red-500 text-white border border-transparent focus:ring-red-500',
      ghost: 'bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white',
      glass: 'glass-panel hover:bg-white/5 text-gray-200 border border-white/10 hover:border-white/20'
    }

    const sizes = {
      sm: 'px-3.5 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base'
    }

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
        whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
