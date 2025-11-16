import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 font-bold uppercase text-sm">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input w-full ${error ? 'border-error' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-error font-mono">❌ {error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
