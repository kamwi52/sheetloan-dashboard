import { Page, PageHeader, PageTitle, PageActions, PageBody, Button, DataTable, EmptyState, Badge, Skeleton } from '@blinkdotnew/ui'
import { Plus, Users, Download, Database } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { useApplications } from '../hooks/useApplications'
import { useSettings } from '../hooks/useSettings'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'

export function Applications() {
  const { data: applications, isLoading, isError } = useApplications()
  const { spreadsheetId } = useSettings()
  const navigate = useNavigate()

  const columns: ColumnDef<any>[] = [
    { 
      accessorKey: 'name', 
      header: 'Applicant Name', 
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      )
    },
    { 
      accessorKey: 'amount', 
      header: 'Loan Amount', 
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(row.original.amount))}
        </span>
      )
    },
    { 
      accessorKey: 'purpose', 
      header: 'Purpose',
      cell: ({ row }) => <span className="capitalize">{row.original.purpose}</span>
    },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'Approved' ? 'secondary' : row.original.status === 'Rejected' ? 'destructive' : 'outline'} 
          className="px-3 py-1 rounded-full font-bold"
        >
          {row.original.status}
        </Badge>
      )
    },
    { 
      accessorKey: 'timestamp', 
      header: 'Date Applied',
      cell: ({ row }) => row.original.timestamp ? format(new Date(row.original.timestamp), 'MMM d, yyyy') : 'N/A'
    },
  ]

  const handleExport = () => {
    if (!applications?.length) return
    
    const headers = ['Timestamp', 'Full Name', 'Email', 'Phone', 'Amount', 'Purpose', 'Company', 'Job Title', 'Income', 'Status']
    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        app.timestamp,
        `"${app.name}"`,
        app.email,
        app.phone,
        app.amount,
        app.purpose,
        `"${app.company}"`,
        `"${app.jobTitle}"`,
        app.income,
        app.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `loan_applications_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Page className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <PageTitle className="text-4xl font-extrabold tracking-tight text-foreground">Applications</PageTitle>
            <PageDescription className="text-lg text-muted-foreground font-medium">
              Manage and review all incoming loan applications from Google Sheets.
            </PageDescription>
          </div>
          <PageActions className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 border-border/60 hover:bg-muted/30 transition-all duration-200"
              onClick={handleExport}
              disabled={!applications?.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              size="lg" 
              className="h-12 shadow-lg hover:shadow-primary/20 transition-all duration-300"
              onClick={() => navigate({ to: '/new-application' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </PageActions>
        </div>
      </PageHeader>
      
      <PageBody className="bg-white dark:bg-card border border-border/60 rounded-[2rem] shadow-xl overflow-hidden relative">
        {!spreadsheetId && !isLoading && (
          <div className="p-20 text-center space-y-6">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl w-fit mx-auto">
              <Database className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Google Sheets Not Connected</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">Please select a spreadsheet in settings to view your loan applications.</p>
            </div>
            <Button size="lg" className="rounded-xl px-8" onClick={() => navigate({ to: '/settings' })}>Configure Sync</Button>
          </div>
        )}

        {spreadsheetId && isLoading && (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        )}

        {spreadsheetId && !isLoading && !applications?.length && (
          <div className="p-20">
            <EmptyState
              icon={<Users className="h-12 w-12 text-muted-foreground" />}
              title="No applications yet"
              description="New applications will appear here once they are submitted."
              action={{ label: 'Add First Application', onClick: () => navigate({ to: '/new-application' }) }}
            />
          </div>
        )}

        {spreadsheetId && !isLoading && !!applications?.length && (
          <DataTable
            columns={columns}
            data={applications}
            searchable
            searchColumn="name"
            className="w-full"
          />
        )}
      </PageBody>
    </Page>
  )
}
