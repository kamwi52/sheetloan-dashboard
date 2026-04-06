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
    <Page className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader>
        <div className="space-y-2">
          <PageTitle className="text-4xl font-extrabold tracking-tight text-foreground">Overview</PageTitle>
          <PageDescription className="text-lg text-muted-foreground font-medium">
            Real-time analytics from your loan application spreadsheet.
          </PageDescription>
        </div>
      </PageHeader>
      
      <PageBody className="space-y-8">
        {!spreadsheetId ? (
          <Card className="p-12 text-center border-dashed border-2 rounded-[2rem]">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-amber-100 rounded-full w-fit mx-auto">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold">No Sync Source Selected</h3>
              <p className="text-muted-foreground">Connect a Google Sheet in settings to see real-time data from your loan pipeline.</p>
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
                icon={<FileText className="h-5 w-5 text-blue-500" />}
                className="p-6 bg-white dark:bg-card border border-border shadow-sm rounded-2xl"
              />
              <Stat
                label="Approved Loans"
                value={String(approvedCount)}
                icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
                className="p-6 bg-white dark:bg-card border border-border shadow-sm rounded-2xl"
              />
              <Stat
                label="Pending Review"
                value={String(pendingCount)}
                icon={<Users className="h-5 w-5 text-amber-500" />}
                className="p-6 bg-white dark:bg-card border border-border shadow-sm rounded-2xl"
              />
              <Stat
                label="Total Portfolio"
                value={formatCurrency(totalAmount)}
                icon={<TrendingUp className="h-5 w-5 text-rose-500" />}
                className="p-6 bg-white dark:bg-card border border-border shadow-sm rounded-2xl"
              />
            </StatGroup>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 shadow-sm border border-border/60 overflow-hidden rounded-2xl bg-white dark:bg-card">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-xl font-bold tracking-tight">Funding Volumne Trends</CardTitle>
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
              
              <Card className="shadow-sm border border-border/60 rounded-2xl bg-white dark:bg-card">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-xl font-bold tracking-tight">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {recentApplications.length === 0 ? (
                      <p className="text-center py-10 text-muted-foreground font-medium italic">No recent applications</p>
                    ) : (
                      recentApplications.map((app, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors duration-200">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground truncate max-w-[120px]">{app.name}</p>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{app.timestamp ? format(new Date(app.timestamp), 'MMM d, HH:mm') : 'Just now'}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-foreground">{formatCurrency(Number(app.amount))}</p>
                            <p className={`text-xs font-bold ${app.status === 'Approved' ? 'text-emerald-600' : app.status === 'Rejected' ? 'text-rose-600' : 'text-amber-600'}`}>{app.status}</p>
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
