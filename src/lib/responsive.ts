/**
 * Responsive Design System
 * 
 * This file establishes the responsive breakpoints, spacing, and utilities
 * used throughout the application. All responsive behavior should reference
 * these constants for consistency.
 * 
 * Breakpoints follow Tailwind CSS v4 defaults:
 * - sm: 640px  (small tablets, large phones in landscape)
 * - md: 768px  (tablets)
 * - lg: 1024px (small laptops, tablets in landscape)
 * - xl: 1280px (laptops, desktops)
 * - 2xl: 1536px (large desktops)
 * 
 * Design Philosophy:
 * - Mobile-first approach
 * - Primary usage is desktop, but mobile must be excellent
 * - Touch targets minimum 44px on mobile
 * - Content max-width 1600px for ultra-wide displays
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

export const CONTAINER = {
  maxWidth: 1600,
  padding: {
    mobile: 16,   // px-4
    tablet: 24,   // px-6
    desktop: 40,  // px-10
  },
} as const

export const SPACING = {
  gap: {
    mobile: 12,   // gap-3
    tablet: 16,   // gap-4
    desktop: 24,  // gap-6
  },
  section: {
    mobile: 16,   // space-y-4
    tablet: 24,   // space-y-6
    desktop: 32,  // space-y-8
  },
} as const

export const TOUCH = {
  minTargetSize: 44,
  recommendedTargetSize: 48,
} as const

export const SIDEBAR = {
  width: {
    expanded: '13rem',    // 208px
    collapsed: '3rem',    // 48px
    mobile: '16rem',      // 256px (sheet)
  },
} as const

export const HEADER = {
  height: {
    mobile: 48,   // h-12
    desktop: 48,  // h-12 (consistent)
  },
} as const

export function isBreakpoint(width: number, breakpoint: Breakpoint): boolean {
  return width >= BREAKPOINTS[breakpoint]
}

export function getBreakpoint(width: number): Breakpoint | 'xs' {
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

export const RESPONSIVE_CLASSES = {
  container: 'mx-auto w-full max-w-[1600px]',
  containerPadding: 'px-4 sm:px-6 lg:px-10',
  containerFull: 'mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10',
  sectionGap: 'space-y-4 sm:space-y-6 lg:space-y-8',
  gridGap: 'gap-3 sm:gap-4 lg:gap-6',
  cardPadding: 'p-3 sm:p-4 lg:p-6',
  textResponsive: {
    h1: 'text-2xl sm:text-3xl lg:text-4xl',
    h2: 'text-xl sm:text-2xl lg:text-3xl',
    h3: 'text-lg sm:text-xl',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm',
  },
  grid: {
    cols1to2: 'grid-cols-1 md:grid-cols-2',
    cols1to3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols1to4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    cols12: 'grid-cols-1 lg:grid-cols-12',
  },
} as const
