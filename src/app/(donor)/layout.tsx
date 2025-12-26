import { AppShell } from '@/components/app-shell'

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell role="donor" tenantName="Give Hope">
      {children}
    </AppShell>
  )
}
