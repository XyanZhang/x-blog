'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface NavLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export const NavLink = ({ href, children, className = '', onClick }: NavLinkProps) => {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

  const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors"
  const activeClasses = isActive 
    ? "text-indigo-600 bg-indigo-50" 
    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"

  return (
    <Link 
      href={href} 
      className={`${baseClasses} ${activeClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  )
} 