import { readFileSync, writeFileSync } from 'fs'
import { markdownTable } from 'markdown-table'
import { TableDisplayNames, models } from '../../src/models'

const legend = `### Legend
| Symbol             | Description                           |
|--------------------|---------------------------------------|
| :white_check_mark: | Supported by Token.js                 |
| :heavy_minus_sign: | Not supported by the LLM provider, so Token.js cannot support it     |\n`

const generateCompatibility = async () => {
  for (const [provider, compatibility] of Object.entries(models)) {
    const table: string[][] = []

    let pushHeader = true

    if (compatibility.generateDocs === false) {
      continue
    }

    if (typeof compatibility.models === 'boolean') {
      throw new Error(
        'Auto-generating model compatibility tables is not supported for providers that do not have explicitly defined models.'
      )
    }

    for (const model of compatibility.models) {
      const header: string[] = []
      const features: string[] = [model]
      for (const [feature, models] of Object.entries(compatibility)) {
        if (feature === 'generateDocs') continue

        header.push(TableDisplayNames[feature])

        if (feature === 'models') continue

        const allModels = typeof models === 'boolean' && models === true
        const modelInList = Array.isArray(models) && models.includes(model)
        if (allModels || modelInList) {
          features.push('✅')
        } else {
          features.push('➖')
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
    const afterCompatibilitySplit = docsSplit[1].split(
      '<!-- end compatibility -->'
    )

    const newDocs = `${docsSplit[0]}<!-- compatibility -->\n## Supported Models\n\n${mkdTable}\n\n${legend}<!-- end compatibility -->${afterCompatibilitySplit[1]}`

    writeFileSync(`docs/providers/${provider}.md`, newDocs, 'utf-8')
  }
  console.log(`Successfully updated model compatibility tables.`)
}

generateCompatibility()
