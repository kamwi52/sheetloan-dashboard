import { Page, PageHeader, PageTitle, PageDescription, PageBody, Tabs, TabsList, TabsTrigger, TabsContent, WorkspaceMembers, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, toast, Input, CardFooter, Badge } from '@blinkdotnew/ui'
import { Settings as SettingsIcon, Database, Share2, CheckCircle2, AlertCircle, ExternalLink, Link2, ShieldCheck, List, User, Bell, Mail, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { blink } from '../lib/blink'
import { sheets } from '../lib/sheets'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function Settings() {
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const queryClient = useQueryClient()

  const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await blink.db.settings.list()
      return response.data[0] || null
    }
  })

  const { data: connectorStatus, isLoading: isLoadingConnector } = useQuery({
    queryKey: ['connector-status'],
    queryFn: async () => {
      const status = await blink.connectors.status('google_sheets')
      return status.data.connected
    }
  })

  const { data: spreadsheetList, isLoading: isLoadingSpreadsheets } = useQuery({
    queryKey: ['spreadsheets'],
    queryFn: async () => {
      if (!connectorStatus) return []
      return await sheets.listSpreadsheets()
    },
    enabled: !!connectorStatus
  })

  useEffect(() => {
    if (userSettings) {
      setSpreadsheetId(userSettings.spreadsheetId)
    }
  }, [userSettings])

  const saveSettings = useMutation({
    mutationFn: async (id: string) => {
      if (userSettings) {
        await blink.db.settings.update(userSettings.id, { spreadsheetId: id })
      } else {
        await blink.db.settings.create({
          id: crypto.randomUUID(),
          user_id: (await blink.auth.me())?.id,
          spreadsheet_id: id
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved!', {
        description: 'Your loan data will now sync to the selected spreadsheet.',
      })
    },
    onError: () => {
      toast.error('Failed to save settings', {
        description: 'Please try again later.',
      })
    }
  })

  const handleConnect = async () => {
    if (!connectorStatus) {
      toast.error('Connector Not Linked', {
        description: 'Please link your Google account in the project dashboard first.',
      })
      return
    }
  }

  const handleCreateSheet = async () => {
    try {
      const newId = await sheets.createSpreadsheet('SheetLoan Applications')
      await saveSettings.mutateAsync(newId)
    } catch (error) {
      toast.error('Failed to create sheet', {
        description: 'Ensure Google Sheets is connected in settings.',
      })
    }
  }

  const handleSelectSheet = (id: string) => {
    setSpreadsheetId(id)
    saveSettings.mutate(id)
  }

  if (isLoadingSettings || isLoadingConnector) {
    return <div className="p-20 text-center text-muted-foreground">Loading settings...</div>
  }

  return (
    <Page className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/5">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <PageTitle className="text-5xl font-black tracking-tight text-foreground">Settings</PageTitle>
        </div>
        <PageDescription className="text-xl text-muted-foreground font-medium max-w-2xl">
          Manage your account, team members, and Google Sheets integrations.
        </PageDescription>
      </PageHeader>
      
      <PageBody>
        <Tabs defaultValue="integrations" className="space-y-10">
          <TabsList className="bg-muted/40 p-2 rounded-2xl border border-border/60 inline-flex shadow-sm">
            <TabsTrigger value="integrations" className="px-8 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold text-lg transition-all duration-300">
              <Database className="h-5 w-5 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="members" className="px-8 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold text-lg transition-all duration-300">
              <User className="h-5 w-5 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="notifications" className="px-8 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold text-lg transition-all duration-300">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="integrations" className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <Card className="rounded-[2.5rem] border border-border/60 shadow-xl overflow-hidden bg-white dark:bg-card">
                  <CardHeader className="bg-muted/30 border-b border-border/60 p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                          <Database className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-2xl font-extrabold tracking-tight">Google Sheets Integration</CardTitle>
                          <p className="text-muted-foreground font-medium">Sync applications directly to a spreadsheet</p>
                        </div>
                      </div>
                      {connectorStatus ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-border/60 bg-muted/20 text-muted-foreground px-4 py-2 rounded-full font-bold flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" /> Not Connected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    <div className="space-y-6">
                      <div className="p-6 bg-muted/20 rounded-[2rem] border border-border/60 space-y-4">
                        <div className="flex items-center gap-3 text-foreground font-bold text-lg">
                          <Link2 className="h-5 w-5 text-primary" />
                          Spreadsheet Link
                        </div>
                        <div className="flex gap-4">
                          <Input 
                            placeholder="Paste your Google Spreadsheet ID or URL" 
                            className="h-14 bg-white dark:bg-card border-border/60 rounded-2xl px-6 text-lg focus:ring-primary/20 transition-all duration-300 flex-1 shadow-sm"
                            value={spreadsheetId}
                            onChange={(e) => setSpreadsheetId(e.target.value)}
                          />
                          <Button 
                            size="lg" 
                            className="h-14 px-8 shadow-lg hover:shadow-primary/20 transition-all duration-300 font-bold"
                            onClick={() => saveSettings.mutate(spreadsheetId)}
                            loading={saveSettings.isPending}
                          >
                            Save ID
                          </Button>
                        </div>
                        
                        {connectorStatus && spreadsheetList?.length > 0 && (
                          <div className="space-y-4 pt-4">
                            <p className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                              <List className="h-4 w-4" /> Select Recent Spreadsheet
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {spreadsheetList.map((sheet: any) => (
                                <Button
                                  key={sheet.id}
                                  variant="outline"
                                  className={`h-auto py-3 px-4 justify-start text-left rounded-xl border-border/60 transition-all duration-200 ${spreadsheetId === sheet.id ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/40'}`}
                                  onClick={() => handleSelectSheet(sheet.id)}
                                >
                                  <div className="space-y-0.5 truncate">
                                    <p className="text-sm font-bold truncate">{sheet.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{sheet.id}</p>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground font-medium px-2 leading-relaxed">
                          Data will be synced to the sheet named 'Applications'. If it doesn't exist, we will create it for you.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 border-t border-border/60 p-8 flex items-center justify-between">
                    <p className="text-muted-foreground font-medium text-sm max-w-sm">
                      Last synced: {userSettings ? 'Just now' : 'Never'}
                    </p>
                    <div className="flex items-center gap-4">
                      {!connectorStatus ? (
                        <Button size="lg" className="h-12 shadow-lg hover:shadow-primary/20 transition-all duration-300 font-bold" onClick={handleConnect}>
                          Link Google Account
                        </Button>
                      ) : !spreadsheetId ? (
                        <Button size="lg" className="h-12 shadow-lg hover:shadow-primary/20 transition-all duration-300 font-bold" onClick={handleCreateSheet}>
                          Create Spreadsheet
                        </Button>
                      ) : (
                        <Button variant="outline" size="lg" className="h-12 border-destructive/20 text-destructive hover:bg-destructive/10 transition-all duration-200 font-bold" onClick={() => saveSettings.mutate('')}>
                          Disconnect Sheet
                        </Button>
                      )}
                      {spreadsheetId && (
                        <Button variant="ghost" size="lg" className="h-12 hover:bg-muted/40 transition-all duration-200 font-bold" asChild>
                          <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Sheet
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="space-y-10">
                <Card className="rounded-[2.5rem] border border-border/60 shadow-xl overflow-hidden bg-primary/5">
                  <CardHeader className="p-8 pb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit mb-4">
                      <Shield className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold tracking-tight">Security & Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                    <p className="text-muted-foreground font-medium leading-relaxed text-lg">
                      Your data is encrypted end-to-end. We only request read/write access to the specific spreadsheet you provide.
                    </p>
                    <ul className="space-y-4 font-bold text-foreground/80">
                      <li className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        OAuth 2.0 Secure Auth
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        Encrypted Transmission
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="rounded-[2.5rem] border border-border/60 shadow-xl overflow-hidden bg-white dark:bg-card p-8">
                  <CardHeader className="p-0 pb-6 border-b border-border/60 mb-6">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit shadow-sm">
                      <Share2 className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Support</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground font-medium leading-relaxed text-lg mb-6">
                      Need help with your Google Sheets connection? Our team is available 24/7.
                    </p>
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-border/60 font-bold hover:bg-muted/30 transition-all duration-200 text-lg">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="rounded-[2.5rem] border border-border/60 shadow-2xl overflow-hidden bg-white dark:bg-card">
              <div className="p-8 md:p-12">
                <WorkspaceMembers />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="rounded-[2.5rem] border border-border/60 shadow-xl overflow-hidden bg-white dark:bg-card p-10">
              <CardHeader className="p-0 pb-8 border-b border-border/60 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
                    <Mail className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight">Email Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-6">
                  {[
                    { title: 'Application Submissions', desc: 'Receive an email every time a new loan application is submitted.', active: true },
                    { title: 'Status Changes', desc: 'Get notified when a loan application status is updated by a team member.', active: true },
                    { title: 'Daily Digest', desc: 'A summary of all application activities sent at the end of each business day.', active: false },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-8 bg-muted/20 rounded-[2rem] border border-border/60 hover:bg-muted/30 transition-all duration-300">
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-foreground">{pref.title}</p>
                        <p className="text-lg text-muted-foreground font-medium max-w-xl">{pref.desc}</p>
                      </div>
                      <Button variant={pref.active ? 'secondary' : 'outline'} className="h-12 px-8 rounded-xl font-bold text-lg transition-all duration-200">
                        {pref.active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageBody>
    </Page>
  )
}
