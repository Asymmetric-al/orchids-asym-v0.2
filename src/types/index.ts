export type { Role, NavItem } from '@/config/navigation'
export * from './database'

export interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  avatarUrl?: string
}
