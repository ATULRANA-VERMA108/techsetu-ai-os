import React from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

interface CardProps extends HTMLMotionProps<'div'> {
  hoverGlow?: boolean
  hoverScale?: boolean
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ hoverGlow = false, hoverScale = false, children, className = '', ...props }) => {
  const glowClass = hoverGlow ? 'hover:shadow-[0_0_25px_rgba(139,92,246,0.12)]' : ''
  const baseClasses = `glass-panel rounded-2xl p-6 transition-all duration-300 ${glowClass} ${className}`

  if (hoverScale) {
    return (
      <motion.div
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.2 }}
        className={baseClasses}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClasses} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`mb-4 flex flex-col gap-1.5 ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-bold text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-gray-400 ${className}`} {...props}>
    {children}
  </p>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`text-sm text-gray-300 leading-relaxed ${className}`} {...props}>
    {children}
  </div>
)
