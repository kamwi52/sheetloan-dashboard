import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router'
import { useBlinkAuth } from '@blinkdotnew/react'
import { DashboardLayout } from './components/Layout'
import { AuthPage } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Applications } from './pages/Applications'
import { NewApplication } from './pages/NewApplication'
import { Settings } from './pages/Settings'

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <Outlet />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
})

const applicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/applications',
  component: Applications,
})

const newApplicationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-application',
  component: NewApplication,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  applicationsRoute,
  newApplicationRoute,
  settingsRoute,
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  const { user, isLoading } = useBlinkAuth()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-r-4 border-l-4 border-accent animate-pulse"></div>
          </div>
        </div>
        <p className="mt-8 text-xl font-bold tracking-widest text-primary animate-pulse uppercase">Initializing SheetLoan</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <DashboardLayout>
      <RouterProvider router={router} />
    </DashboardLayout>
  )
}
