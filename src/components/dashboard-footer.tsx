'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

interface BreadcrumbItemData {
  label: string
  href?: string
}

interface DashboardFooterProps {
  className?: string
  brandName?: string
  brandHref?: string
  tagline?: string
  breadcrumbs?: BreadcrumbItemData[]
  showBreadcrumbs?: boolean
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItemData[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItemData[] = []

  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const label = segments[i]
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    breadcrumbs.push({
      label,
      href: i < segments.length - 1 ? currentPath : undefined,
    })
  }

  return breadcrumbs
}

export function DashboardFooter({
  className,
  brandName = 'Asym',
  brandHref = '/',
  tagline = 'Ministry Support, Simplified',
  breadcrumbs: customBreadcrumbs,
  showBreadcrumbs = true,
}: DashboardFooterProps) {
  const pathname = usePathname()
  const breadcrumbs = customBreadcrumbs || generateBreadcrumbsFromPath(pathname)

  return (
    <footer
      className={cn(
        'bg-card sticky bottom-0 z-50 flex items-center justify-between gap-3 border-t p-4 max-md:flex-col sm:px-6 md:gap-6',
        className
      )}
    >
      <p className="text-muted-foreground text-center text-sm text-balance">
        {`© ${new Date().getFullYear()}`}{' '}
        <Link href={brandHref} className="text-primary hover:underline">
          {brandName}
        </Link>
        {tagline && `, ${tagline}`}
      </p>
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </footer>
  )
}
