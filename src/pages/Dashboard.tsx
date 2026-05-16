import { Page, PageHeader, PageTitle, PageDescription, PageBody, StatGroup, Stat, AreaChart, Card, CardHeader, CardTitle, CardContent, Skeleton } from '@blinkdotnew/ui'
import { TrendingUp, Users, FileText, CheckCircle } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { useSettings } from '../hooks/useSettings'
import { format, subMonths, isAfter } from 'date-fns'

export function Dashboard() {
  const { data: applications, isLoading } = useApplications()
  const { spreadsheetId } = useSettings()

  const totalAmount = applications?.reduce((sum: number, app: any) => sum + (Number(app.amount) || 0), 0) || 0
  const approvedCount = applications?.filter((app: any) => app.status === 'Approved').length || 0
  const pendingCount = applications?.filter((app: any) => app.status === 'Pending').length || 0
  const recentApplications = applications?.slice(0, 5) || []

  // Group by month for chart
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const monthLabel = format(date, 'MMM')
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    const monthAmount = applications?.reduce((sum: number, app: any) => {
      const appDate = new Date(app.timestamp)
      if (isAfter(appDate, monthStart) && !isAfter(appDate, monthEnd)) {
        return sum + (Number(app.amount) || 0)
      }
      return sum
    }, 0) || 0

    return { month: monthLabel, amount: monthAmount }
  })

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
    return `$${val}`
  }

  return (
    <Page className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
      <PageHeader>
        <div className="space-y-3">
          <PageTitle className="text-5xl font-bold tracking-tight text-foreground">Dashboard</PageTitle>
          <PageDescription className="text-lg text-muted-foreground font-normal leading-relaxed">
            Real-time analytics from your loan application spreadsheet.
          </PageDescription>
        </div>
      </PageHeader>
      
      <PageBody className="space-y-8">
        {!spreadsheetId ? (
          <Card className="p-12 text-center border-dashed border-2 border-accent/30 dark:border-accent/20 rounded-3xl bg-gradient-to-br from-accent/5 to-primary/5 dark:from-accent/10 dark:to-primary/10 hover:shadow-lg transition-shadow">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-accent/20 dark:bg-accent/10 rounded-full w-fit mx-auto">
                <FileText className="h-8 w-8 text-accent dark:text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">No Sync Source Selected</h3>
              <p className="text-muted-foreground text-base font-normal">Connect a Google Sheet in settings to see real-time data from your loan pipeline.</p>
            </div>
          </Card>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <StatGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Stat
                label="Total Applications"
                value={String(applications?.length || 0)}
                icon={<FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                className="p-6 bg-gradient-to-br from-white to-blue-50 dark:from-card dark:to-blue-950/20 border border-blue-200 dark:border-blue-900/30 shadow-md hover:shadow-lg transition-shadow rounded-2xl"
              />
              <Stat
                label="Approved Loans"
                value={String(approvedCount)}
                icon={<CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                className="p-6 bg-gradient-to-br from-white to-emerald-50 dark:from-card dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 shadow-md hover:shadow-lg transition-shadow rounded-2xl"
              />
              <Stat
                label="Pending Review"
                value={String(pendingCount)}
                icon={<Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                className="p-6 bg-gradient-to-br from-white to-amber-50 dark:from-card dark:to-amber-950/20 border border-amber-200 dark:border-amber-900/30 shadow-md hover:shadow-lg transition-shadow rounded-2xl"
              />
              <Stat
                label="Total Portfolio"
                value={formatCurrency(totalAmount)}
                icon={<TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />}
                className="p-6 bg-gradient-to-br from-white to-violet-50 dark:from-card dark:to-violet-950/20 border border-violet-200 dark:border-violet-900/30 shadow-md hover:shadow-lg transition-shadow rounded-2xl"
              />
            </StatGroup>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 shadow-lg border border-border/60 overflow-hidden rounded-2xl bg-white dark:bg-card hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 pb-4 border-b border-border/50">
                  <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Funding Volume Trends</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <AreaChart
                    data={last6Months}
                    dataKey="amount"
                    xAxisKey="month"
                    height={350}
                    className="w-full"
                  />
                </CardContent>
              </Card>
              
              <Card className="shadow-lg border border-border/60 rounded-2xl bg-white dark:bg-card hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 pb-4 border-b border-border/50">
                  <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {recentApplications.length === 0 ? (
                      <p className="text-center py-10 text-muted-foreground font-medium italic">No recent applications</p>
                    ) : (
                      recentApplications.map((app, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-xl hover:from-primary/10 hover:to-accent/10 dark:hover:from-primary/15 dark:hover:to-accent/15 transition-colors duration-200 border border-border/50 hover:border-primary/20">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground truncate max-w-[120px]">{app.name}</p>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{app.timestamp ? format(new Date(app.timestamp), 'MMM d, HH:mm') : 'Just now'}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-foreground text-lg">{formatCurrency(Number(app.amount))}</p>
                            <p className={`text-xs font-bold tracking-wider ${app.status === 'Approved' ? 'text-emerald-600 dark:text-emerald-400' : app.status === 'Rejected' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>{app.status}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </PageBody>
    </Page>
  )
}
