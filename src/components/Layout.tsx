import { AppShell, AppShellSidebar, AppShellMain, MobileSidebarTrigger, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarItem, Navbar, NavbarBrand, NavbarContent, Button } from '@blinkdotnew/ui'
import { LayoutDashboard, Settings, FileText, PlusCircle, LogOut } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { blink } from '../lib/blink'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  
  const navItems = [
    { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', href: '/' },
    { icon: <FileText className="h-4 w-4" />, label: 'Applications', href: '/applications' },
    { icon: <PlusCircle className="h-4 w-4" />, label: 'New Application', href: '/new-application' },
    { icon: <Settings className="h-4 w-4" />, label: 'Settings', href: '/settings' },
  ]

  return (
    <AppShell>
      <AppShellSidebar>
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center px-6">
            <span className="font-bold text-xl tracking-tight text-primary">SheetLoan</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={location.pathname === item.href}
                />
              ))}
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => blink.auth.logout()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Sidebar>
      </AppShellSidebar>
      <AppShellMain>
        <div className="md:hidden flex items-center gap-2 px-4 h-16 border-b border-border bg-background">
          <MobileSidebarTrigger />
          <span className="font-bold text-lg text-primary">SheetLoan</span>
        </div>
        {children}
      </AppShellMain>
    </AppShell>
  )
}
