import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 text-gray-400 shrink-0 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-dark-card/60 text-sm text-gray-200 ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border ${
              error ? 'border-red-500/80 focus:ring-red-500/30' : 'border-gray-800 focus:border-ai-blue focus:ring-ai-blue/20'
            } transition-all duration-200 outline-none focus:ring-4 placeholder-gray-500 ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-400 mt-0.5">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
