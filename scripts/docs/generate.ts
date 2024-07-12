import { readFileSync, writeFileSync } from 'fs'
import { markdownTable } from 'markdown-table'
import { TableDisplayNames, models } from '../../src/models'

const generateCompatibility = async () => {
  for (const [provider, compatibility] of Object.entries(models)) {
    const table: string[][] = []

    let pushHeader = true

    for (const model of compatibility.models) {
      const header: string[] = []
      const features: string[] = [model]
      for (const [feature, models] of Object.entries(compatibility)) {
        header.push(TableDisplayNames[feature])

        if (feature === 'models') continue

        const allModels = typeof models === 'boolean' && models === true
        const modelInList = Array.isArray(models) && models.includes(model)
        if (allModels || modelInList) {
          features.push('✅')
        } else {
          features.push('')
        }
      }
      if (pushHeader) {
        table.push(header)
        pushHeader = false
      }
      table.push(features)
    }

    const mkdTable = markdownTable(table)
    const providerDocs = readFileSync(`docs/providers/${provider}.md`, 'utf-8')
    const docsSplit = providerDocs.split('<!-- compatibility -->')
    const newDocs = `${docsSplit[0]}<!-- compatibility -->\n### Supported Models\n\n${mkdTable}\n\n`

    writeFileSync(`docs/providers/${provider}.md`, newDocs, 'utf-8')
  }
  console.log(`Successfully updated model compatibility tables.`)
}

generateCompatibility()
