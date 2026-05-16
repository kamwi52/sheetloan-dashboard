import { AppShell, AppShellSidebar, AppShellMain, MobileSidebarTrigger, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarItem, Navbar, NavbarBrand, NavbarContent, Button } from '@blinkdotnew/ui'
import { LayoutDashboard, Settings, FileText, PlusCircle, LogOut } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { blink } from '../lib/blink'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  
  const navItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', href: '/' },
    { icon: <FileText className="h-5 w-5" />, label: 'Applications', href: '/applications' },
    { icon: <PlusCircle className="h-5 w-5" />, label: 'New Application', href: '/new-application' },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', href: '/settings' },
  ]

  return (
    <AppShell>
      <AppShellSidebar>
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center px-6 border-b border-border/60">
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SheetLoan</span>
          </SidebarHeader>
          <SidebarContent className="px-3 py-6 space-y-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3">Main Navigation</SidebarGroupLabel>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={location.pathname === item.href}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    location.pathname === item.href 
                      ? 'bg-primary/15 text-primary shadow-md' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                />
              ))}
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-border/60">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 font-medium transition-all duration-200 rounded-xl px-4 py-3"
              onClick={() => blink.auth.logout()}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </Sidebar>
      </AppShellSidebar>
      <AppShellMain className="overflow-x-visible">
        <div className="md:hidden flex items-center gap-2 px-4 h-16 border-b border-border/60 bg-background">
          <MobileSidebarTrigger />
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SheetLoan</span>
        </div>
        <div className="w-full overflow-x-auto">
          {children}
        </div>
      </AppShellMain>
    </AppShell>
  )
}
