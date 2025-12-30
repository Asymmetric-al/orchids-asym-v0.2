'use client'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'

type UserRole = 'donor' | 'missionary' | 'admin'

interface AppShellProps {
  children: React.ReactNode
  role?: UserRole
  title?: string
  tenantLogo?: string
  tenantName?: string
}

export function AppShell({
  children,
  role = 'donor',
  title,
  tenantLogo,
  tenantName,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} tenantLogo={tenantLogo} tenantName={tenantName} />
        <SidebarInset className="bg-zinc-50/50">
          <AppHeader title={title} />
          <main className="container-responsive flex-1 py-4 sm:py-6 lg:py-10">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  )
}
