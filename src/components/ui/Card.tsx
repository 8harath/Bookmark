import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div className={`card ${hover ? '' : 'hover:shadow-brutal hover:translate-x-0 hover:translate-y-0'} ${className}`}>
      {children}
    </div>
  )
}
