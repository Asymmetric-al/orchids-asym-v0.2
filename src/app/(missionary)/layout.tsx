import type { Metadata } from 'next'
import { AppShell } from '@/components/app-shell'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function MissionaryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell role="missionary" tenantName="Give Hope">
      {children}
    </AppShell>
  )
}
