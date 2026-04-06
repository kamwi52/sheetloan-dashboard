import { blink } from './blink'

export const sheets = {
  async getStatus() {
    const status = await blink.connectors.status('google_sheets')
    return status.data.connected
  },

  async listSpreadsheets() {
    const filesResponse = await blink.connectors.execute('google_sheets', {
      method: '/spreadsheets',
      http_method: 'GET',
      params: { pageSize: '20' }
    })
    return filesResponse.data.files
  },

  async createSpreadsheet(title: string) {
    const spreadsheetResponse = await blink.connectors.execute('google_sheets', {
      method: '/spreadsheets',
      http_method: 'POST',
      params: {
        title: title,
        sheets: [
          { 
            properties: { 
              title: 'Applications' 
            } 
          }
        ]
      }
    })
    const spreadsheet = spreadsheetResponse.data
    
    // Setup headers
    await this.writeValues(spreadsheet.spreadsheetId, 'Applications!A1:J1', [
      ['ID', 'Full Name', 'Email', 'Phone', 'Amount', 'Purpose', 'Company', 'Job Title', 'Income', 'Status', 'Date']
    ])

    return spreadsheet.spreadsheetId
  },

  async readValues(spreadsheetId: string, range: string) {
    const valuesResponse = await blink.connectors.execute('google_sheets', {
      method: `/spreadsheets/${spreadsheetId}/values/${range}`,
      http_method: 'GET'
    })
    return valuesResponse.data.values
  },

  async writeValues(spreadsheetId: string, range: string, values: any[][]) {
    await blink.connectors.execute('google_sheets', {
      method: `/spreadsheets/${spreadsheetId}/values/${range}`,
      http_method: 'PUT',
      params: {
        values: values,
        valueInputOption: 'USER_ENTERED'
      }
    })
  },

  async appendValues(spreadsheetId: string, range: string, values: any[][]) {
    await blink.connectors.execute('google_sheets', {
      method: `/spreadsheets/${spreadsheetId}/values/${range}/append`,
      http_method: 'POST',
      params: {
        values: values,
        valueInputOption: 'USER_ENTERED'
      }
    })
  }
}
