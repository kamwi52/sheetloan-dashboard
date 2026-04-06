import { Page, PageHeader, PageTitle, PageDescription, PageBody, StepForm, StepFormStep, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button, toast, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@blinkdotnew/ui'
import { z } from 'zod'
import { PlusCircle, User, CreditCard, Building2, CheckCircle2 } from 'lucide-react'
import { blink } from '../lib/blink'
import { sheets } from '../lib/sheets'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  amount: z.string().min(1, 'Loan amount is required'),
  purpose: z.string().min(1, 'Loan purpose is required'),
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  income: z.string().min(1, 'Annual income is required'),
})

export function NewApplication() {
  const navigate = useNavigate()
  
  const { data: userSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await blink.db.settings.list()
      return response.data[0] || null
    }
  })

  const handleSubmit = async (data: any) => {
    const applicationId = crypto.randomUUID()
    const currentUser = await blink.auth.me()
    
    try {
      // 1. Save to database
      await blink.db.applications.create({
        id: applicationId,
        user_id: currentUser?.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        amount: Number(data.amount),
        purpose: data.purpose,
        company: data.company,
        job_title: data.jobTitle,
        income: Number(data.income),
        status: 'Pending'
      })

      // 2. Append to Google Sheets if connected
      if (userSettings?.spreadsheetId) {
        const row = [
          applicationId,
          data.fullName,
          data.email,
          data.phone,
          data.amount,
          data.purpose,
          data.company,
          data.jobTitle,
          data.income,
          'Pending',
          new Date().toISOString()
        ]
        
        await sheets.appendValues(userSettings.spreadsheetId, 'Applications!A:K', [row])
      }

      toast.success('Application Submitted!', {
        description: 'Your loan application has been received and synced to Google Sheets.',
        duration: 5000,
      })
      
      navigate({ to: '/applications' })
    } catch (error) {
      console.error(error)
      toast.error('Submission Failed', {
        description: 'Something went wrong. Please check your connection and try again.',
      })
    }
  }

  return (
    <Page className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-3xl bg-primary/10 text-primary shadow-xl shadow-primary/5">
            <PlusCircle className="h-10 w-10" />
          </div>
        </div>
        <div className="space-y-2">
          <PageTitle className="text-5xl font-black tracking-tight text-foreground">Loan Application</PageTitle>
          <PageDescription className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Complete the steps below to apply for a loan. Your data will be synced securely to our Google Sheets dashboard.
          </PageDescription>
        </div>
      </PageHeader>
      
      <PageBody className="bg-white dark:bg-card border border-border/60 rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 pointer-events-none">
          <Building2 className="h-48 w-48" />
        </div>
        
        <StepForm schema={schema} onSubmit={handleSubmit} className="relative z-10">
          <StepFormStep 
            title="Personal Details" 
            description="Basic information for your application profile"
            icon={<User className="h-5 w-5" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/80 ml-1">Full Name</label>
                <Input name="fullName" placeholder="Johnathan Doe" className="h-14 bg-muted/20 border-border/60 rounded-2xl px-6 text-lg focus:ring-primary/20 transition-all duration-300" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/80 ml-1">Email Address</label>
                <Input name="email" type="email" placeholder="john@company.com" className="h-14 bg-muted/20 border-border/60 rounded-2xl px-6 text-lg focus:ring-primary/20 transition-all duration-300" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/80 ml-1">Phone Number</label>
                <Input name="phone" placeholder="+1 (555) 000-0000" className="h-14 bg-muted/20 border-border/60 rounded-2xl px-6 text-lg focus:ring-primary/20 transition-all duration-300" />
              </div>
            </div>
          </StepFormStep>

          <StepFormStep 
            title="Loan Information" 
            description="Details about the loan you are requesting"
            icon={<CreditCard className="h-5 w-5" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/80 ml-1">Desired Amount</label>
                <Input name="amount" type="number" placeholder="10000" className="h-14 bg-muted/20 border-border/60 rounded-2xl px-6 text-lg focus:ring-primary/20 transition-all duration-300" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/80 ml-1">Loan Purpose</label>
                <Select name="purpose">
                  <SelectTrigger className="h-14 bg-muted/20 border-border/60 rounded-2xl px-6 text-lg focus:ring-primary/20 transition-all duration-300">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/60 shadow-2xl">
                    <SelectItem value="business" className="py-3 text-lg">Business Expansion</SelectItem>
                    <SelectItem value="personal" className="py-3 text-lg">Personal Loan</SelectItem>
                    <SelectItem value="education" className="py-3 text-lg">Education</SelectItem>
                    <SelectItem value="home" className="py-3 text-lg">Home Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </StepFormStep>

          <StepFormStep 
            title="Employment Data" 
            description="Information about your current work status"
            icon={<Building2 className="h-5 w-5" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/80 ml-1">Employer Name</label>
                <Input name="company" placeholder="Acme Corp" className="h-14 bg-muted/20 border-border/60 rounded-2xl px-6 text-lg focus:ring-primary/20 transition-all duration-300" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/80 ml-1">Job Title</label>
                <Input name="jobTitle" placeholder="Senior Manager" className="h-14 bg-muted/20 border-border/60 rounded-2xl px-6 text-lg focus:ring-primary/20 transition-all duration-300" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/80 ml-1">Annual Gross Income</label>
                <Input name="income" type="number" placeholder="75000" className="h-14 bg-muted/20 border-border/60 rounded-2xl px-6 text-lg focus:ring-primary/20 transition-all duration-300" />
              </div>
            </div>
          </StepFormStep>
          
          <StepFormStep 
            title="Review & Submit" 
            description="Verify your information before finalizing"
            icon={<CheckCircle2 className="h-5 w-5" />}
          >
            <div className="space-y-8 pt-6">
              <Card className="border-primary/20 bg-primary/5 rounded-3xl overflow-hidden shadow-sm">
                <CardHeader className="bg-primary/10 border-b border-primary/10">
                  <CardTitle className="text-xl font-bold text-primary">Submission Terms</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <CardDescription className="text-lg text-foreground/80 leading-relaxed font-medium">
                    By submitting this application, you agree that the information provided is accurate and complete. Your application will be processed and synced to our secure Google Sheets database. You will be notified via email of the decision.
                  </CardDescription>
                </CardContent>
              </Card>
              <div className="p-6 bg-muted/20 rounded-[2rem] border border-border/60">
                <p className="text-center text-muted-foreground font-semibold">
                  Once submitted, our team will review your application within 24-48 hours.
                </p>
              </div>
            </div>
          </StepFormStep>
        </StepForm>
      </PageBody>
    </Page>
  )
}
