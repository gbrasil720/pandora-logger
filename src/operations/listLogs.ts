import clc from 'cli-color'

import { delay } from '../utils/delay'
import { EMOJIS } from '../emojis'

import { PandoraWarning } from '../errors/PandoraWarning'

import type { PandoraClient } from '..'

export async function listLogs(
  client: PandoraClient,
  filterCriteria?: (key: string, message: string) => boolean
) {
  await client.spinner.run(
    async () => {
      await delay(500)
    },
    'Listing all logs...',
    'Listed all logs successfully!'
  )

  let logs
  if (filterCriteria) {
    logs = client.logger.filter(filterCriteria)
  } else {
    const logData = client.logger.read()
    if (!logData.logs) {
      throw new PandoraWarning(
        'No logs found to list.',
        EMOJIS.WARNING ?? '',
        2006
      )
    }
    logs = logData.logs
  }

  if (logs && typeof logs === 'object') {
    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.entries(logs).forEach(([key, message]) => {
      console.log(`${clc.yellow(`${key}`)}: ${clc.cyan(message as string)}`)
    })
  }

  return logs
}
