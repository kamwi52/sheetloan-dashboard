import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '../lib/blink'
import { toast } from '@blinkdotnew/ui'

export function useSettings() {
  const queryClient = useQueryClient()

  const { data: spreadsheetId, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['settings', 'spreadsheetId'],
    queryFn: async () => {
      const { data } = await blink.db.settings.list({
        where: { key: 'spreadsheet_id' },
        limit: 1
      })
      return data[0]?.value || null
    },
  })

  const updateSpreadsheetId = useMutation({
    mutationFn: async (id: string) => {
      await blink.db.settings.upsert({
        where: { key: 'spreadsheet_id' },
        data: { key: 'spreadsheet_id', value: id }
      })
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'spreadsheetId'] })
      toast.success('Spreadsheet Selected!', {
        description: `Applications will now be synced to spreadsheet ID: ${id}`,
      })
    },
  })

  return {
    spreadsheetId,
    isSettingsLoading,
    updateSpreadsheetId,
  }
}
