import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '../lib/blink'
import { toast } from '@blinkdotnew/ui'

export function useGoogleSheets() {
  const queryClient = useQueryClient()

  const { data: status, isLoading: isStatusLoading } = useQuery({
    queryKey: ['google_sheets', 'status'],
    queryFn: async () => {
      const response = await blink.connectors.status('google_sheets')
      return response.data
    },
  })

  const { data: spreadsheets, isLoading: isListLoading } = useQuery({
    queryKey: ['google_sheets', 'list'],
    queryFn: async () => {
      if (!status?.connected) return null
      const response = await blink.connectors.execute('google_sheets', {
        method: '/spreadsheets',
        http_method: 'GET',
        params: { pageSize: '50' }
      })
      return response.data.files
    },
    enabled: !!status?.connected,
  })

  const createSpreadsheet = useMutation({
    mutationFn: async (title: string) => {
      const response = await blink.connectors.execute('google_sheets', {
        method: '/spreadsheets',
        http_method: 'POST',
        params: {
          title,
          sheets: [
            { 
              properties: { title: 'Applications' },
              data: [
                {
                  startRow: 0,
                  startColumn: 0,
                  rowData: [
                    {
                      values: [
                        { userEnteredValue: { stringValue: 'Timestamp' } },
                        { userEnteredValue: { stringValue: 'Full Name' } },
                        { userEnteredValue: { stringValue: 'Email' } },
                        { userEnteredValue: { stringValue: 'Phone' } },
                        { userEnteredValue: { stringValue: 'Amount' } },
                        { userEnteredValue: { stringValue: 'Purpose' } },
                        { userEnteredValue: { stringValue: 'Company' } },
                        { userEnteredValue: { stringValue: 'Job Title' } },
                        { userEnteredValue: { stringValue: 'Income' } },
                        { userEnteredValue: { stringValue: 'Status' } },
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['google_sheets', 'list'] })
      toast.success('Spreadsheet Created!', {
        description: `Successfully created "${data.title}"`,
      })
    },
  })

  return {
    status,
    isStatusLoading,
    spreadsheets,
    isListLoading,
    createSpreadsheet,
  }
}
