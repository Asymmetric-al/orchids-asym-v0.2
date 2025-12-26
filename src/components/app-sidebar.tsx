'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Heart,
  Settings,
  BarChart3,
  UserCircle,
  Building2,
  CreditCard,
  FileText,
  Globe,
  Newspaper,
  Mail,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type UserRole = 'donor' | 'missionary' | 'admin'

interface AppSidebarProps {
  role?: UserRole
  tenantLogo?: string
  tenantName?: string
}

const donorNavItems = [
  { title: 'Dashboard', href: '/donor-dashboard', icon: Home },
  { title: 'Feed', href: '/donor-dashboard/feed', icon: Newspaper },
  { title: 'My Giving', href: '/donor-dashboard/pledges', icon: Heart },
  { title: 'Wallet', href: '/donor-dashboard/wallet', icon: CreditCard },
  { title: 'Giving History', href: '/donor-dashboard/history', icon: FileText },
  { title: 'Settings', href: '/donor-dashboard/settings', icon: Settings },
]

const missionaryNavItems = [
  { title: 'Dashboard', href: '/missionary-dashboard', icon: Home },
  { title: 'Donors', href: '/missionary-dashboard/donors', icon: Users },
  { title: 'My Feed', href: '/missionary-dashboard/feed', icon: Newspaper },
  { title: 'Analytics', href: '/missionary-dashboard/analytics', icon: BarChart3 },
  { title: 'Tasks', href: '/missionary-dashboard/tasks', icon: FileText },
  { title: 'Newsletter', href: '/missionary-dashboard/newsletter', icon: Mail },
  { title: 'Profile', href: '/missionary-dashboard/profile', icon: UserCircle },
  { title: 'Settings', href: '/missionary-dashboard/settings', icon: Settings },
]

const adminNavItems = [
  { title: 'Dashboard', href: '/mc', icon: Home },
  { title: 'Missionaries', href: '/mc/missionaries', icon: Globe },
  { title: 'Donors', href: '/mc/donors', icon: Users },
  { title: 'Donations', href: '/mc/contributions', icon: CreditCard },
  { title: 'Reports', href: '/mc/reports', icon: BarChart3 },
  { title: 'Organization', href: '/mc/organization', icon: Building2 },
  { title: 'Settings', href: '/mc/settings', icon: Settings },
]

function getNavItems(role: UserRole) {
  switch (role) {
    case 'donor':
      return donorNavItems
    case 'missionary':
      return missionaryNavItems
    case 'admin':
      return adminNavItems
    default:
      return donorNavItems
  }
}

export function AppSidebar({ role = 'donor', tenantLogo, tenantName = 'Give Hope' }: AppSidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItems(role)

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-100 bg-white">
      <SidebarHeader className="p-2.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          {tenantLogo ? (
            <Avatar className="h-7 w-7 rounded-lg shadow-sm border border-zinc-100 group-hover:scale-105 transition-transform">
              <AvatarImage src={tenantLogo} alt={tenantName} />
              <AvatarFallback className="rounded-lg bg-zinc-900 text-white font-bold text-[10px]">
                {tenantName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-xs group-hover:scale-105 transition-transform">
              {tenantName.charAt(0)}
            </div>
          )}
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-zinc-900 leading-none">
              {tenantName.toUpperCase().split(' ')[0]}
            </span>
            <span className="text-[10px] font-medium text-zinc-500 tracking-widest uppercase leading-none mt-0.5">
              {tenantName.toUpperCase().split(' ')[1] || 'MISSION'}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-1.5 scrollbar-none">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className={cn(
                        "h-8 px-3 rounded-md transition-all duration-200",
                        pathname === item.href 
                          ? "bg-zinc-100 text-zinc-900 font-semibold"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className={cn(
                          "size-3.5 transition-colors",
                          pathname === item.href ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"
                        )} />
                        <span className="text-xs tracking-tight">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2.5 mt-auto">
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none">
          <Avatar className="h-6 w-6 rounded-md border border-white shadow-sm">
            <AvatarFallback className="bg-zinc-900 text-white text-[9px] font-bold">UN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-[11px] font-bold text-zinc-900 truncate leading-tight">User Name</span>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter truncate">{role}</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
