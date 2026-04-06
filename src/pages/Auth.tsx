import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@blinkdotnew/ui'
import { blink } from '../lib/blink'
import { Building2 } from 'lucide-react'

export function AuthPage() {
  const handleLogin = () => {
    blink.auth.login(window.location.origin)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">SheetLoan Dashboard</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Securely manage your loan applications and sync data to Google Sheets.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            size="lg"
            className="w-full text-lg h-12 shadow-lg hover:shadow-primary/20 transition-all duration-300"
            onClick={handleLogin}
          >
            Sign in with Blink
          </Button>
          <p className="mt-6 text-center text-sm text-muted-foreground px-4 leading-relaxed">
            SheetLoan provides real-time collaboration with your team through direct spreadsheet integration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
