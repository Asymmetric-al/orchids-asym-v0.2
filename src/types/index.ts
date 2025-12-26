export type { Role, NavItem } from '@/config/navigation'
export type * from './database'

export interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  avatarUrl?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
}

export interface Profile {
  id: string
  user_id: string
  tenant_id: string
  role: string
  first_name: string
  last_name: string
  email: string
  avatar_url: string | null
}
