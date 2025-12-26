import type { NavItem } from './types'

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', title: 'Mission Control', route: '/', icon: 'LayoutDashboard', roles: ['finance', 'fundraising', 'mobilizers', 'member_care', 'events', 'staff', 'admin'], section: 'main' },
  { id: 'web-studio', title: 'Web Studio', route: '/web-studio', icon: 'Globe', roles: ['fundraising', 'staff', 'admin'], section: 'main' },
  { id: 'crm', title: 'People & Churches', route: '/crm', icon: 'Users', roles: ['fundraising', 'mobilizers', 'member_care', 'events', 'staff', 'admin'], section: 'main' },
  { id: 'contributions', title: 'Contributions', route: '/contributions', icon: 'DollarSign', roles: ['finance', 'events', 'admin'], section: 'main' },
  { id: 'email', title: 'Email Studio', route: '/email', icon: 'Mail', roles: ['fundraising', 'admin'], section: 'main' },
  { id: 'pdf', title: 'PDF Studio', route: '/pdf', icon: 'FileText', roles: ['finance', 'admin'], section: 'main' },
  { id: 'sign', title: 'Sign Studio', route: '/sign', icon: 'PenTool', roles: ['mobilizers', 'events', 'admin'], section: 'main' },
  { id: 'mobilize', title: 'Mobilize', route: '/mobilize', icon: 'Rocket', roles: ['mobilizers', 'admin'], section: 'main' },
  { id: 'support', title: 'Support Hub', route: '/support', icon: 'HelpCircle', roles: ['member_care', 'admin'], section: 'main' },
  { id: 'care', title: 'Member Care', route: '/care', icon: 'Heart', roles: ['member_care', 'admin'], section: 'main' },
  { id: 'events', title: 'Events', route: '/events', icon: 'CalendarDays', roles: ['events', 'admin'], section: 'main' },
  { id: 'reports', title: 'Report Studio', route: '/reports', icon: 'BarChart3', roles: ['finance', 'fundraising', 'member_care', 'events', 'admin'], section: 'tools' },
  { id: 'automations', title: 'Automations', route: '/automations', icon: 'Zap', roles: ['mobilizers', 'admin'], section: 'tools' },
  { id: 'admin', title: 'Admin', route: '/admin', icon: 'Settings', roles: ['finance', 'admin'], section: 'tools' },
]

export function getNavItemsByRole(role: string): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role as any))
}

export function getMainNavItems(role: string): NavItem[] {
  return NAV_ITEMS.filter((item) => item.section === 'main' && item.roles.includes(role as any))
}

export function getToolsNavItems(role: string): NavItem[] {
  return NAV_ITEMS.filter((item) => item.section === 'tools' && item.roles.includes(role as any))
}
