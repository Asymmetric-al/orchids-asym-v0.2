export type { Role } from '@/config/navigation'
import type { Role } from '@/config/navigation'

export interface Tile {
  id: string
  title: string
  route: string
  icon: string
  purpose: string
  inside: string
  quickActions: QuickAction[]
  roles: Role[]
}

export interface QuickAction {
  label: string
  href: string
  icon?: string
}

export interface NavItem {
  id: string
  title: string
  route: string
  icon: string
  roles: Role[]
  section?: 'main' | 'tools'
}

export interface Workflow {
  id: string
  title: string
  description: string
  primaryTile: string
  route: string
}

export interface User {
  id: string
  email: string
  name: string
  role: Role
  tenantId: string
  avatarUrl?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
}
