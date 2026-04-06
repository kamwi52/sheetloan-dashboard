import { useQuery } from '@tanstack/react-query'
import { blink } from '../lib/blink'
import { useSettings } from './useSettings'

export function useApplications() {
  const { spreadsheetId } = useSettings()

  return useQuery({
    queryKey: ['applications', spreadsheetId],
    queryFn: async () => {
      if (!spreadsheetId) return []
      
      try {
        const response = await blink.connectors.execute('google_sheets', {
          method: `/spreadsheets/${spreadsheetId}/values/Applications!A:J`,
          http_method: 'GET'
        })
        
        const rows = response.data.values
        if (!rows || rows.length <= 1) return []
        
        // Skip header row
        const data = rows.slice(1).map((row: any, index: number) => ({
          id: String(index + 1),
          timestamp: row[0],
          name: row[1],
          email: row[2],
          phone: row[3],
          amount: row[4],
          purpose: row[5],
          company: row[6],
          jobTitle: row[7],
          income: row[8],
          status: row[9] || 'Pending'
        }))
        
        // Sort by timestamp descending
        return data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      } catch (error) {
        console.error('Failed to fetch applications from Google Sheets:', error)
        return []
      }
    },
    enabled: !!spreadsheetId,
  })
}
