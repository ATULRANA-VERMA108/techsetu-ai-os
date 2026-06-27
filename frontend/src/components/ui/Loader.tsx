import React from 'react'
import { motion } from 'framer-motion'

interface LoaderProps {
  type?: 'spinner' | 'glow-pulse' | 'terminal-dots'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Loader: React.FC<LoaderProps> = ({ type = 'spinner', size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  const dotSizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-4 h-4',
  }

  if (type === 'glow-pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`${sizeMap[size]} rounded-full bg-gradient-to-r from-ai-blue to-ai-purple shadow-[0_0_20px_rgba(139,92,246,0.6)]`}
        />
      </div>
    )
  }

  if (type === 'terminal-dots') {
    const dotVariants: any = {
      animate: (i: number) => ({
        y: [0, -6, 0],
        transition: {
          duration: 0.6,
          repeat: Infinity,
          repeatType: 'loop' as const,
          delay: i * 0.15,
          ease: 'easeInOut',
        },
      }),
    }

    return (
      <div className={`flex items-center gap-1.5 justify-center ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={dotVariants}
            animate="animate"
            className={`${dotSizeMap[size]} rounded-full bg-gradient-to-r from-ai-blue to-ai-purple`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`${sizeMap[size]} border-4 border-gray-800 border-t-ai-blue rounded-full`}
      />
    </div>
  )
}
