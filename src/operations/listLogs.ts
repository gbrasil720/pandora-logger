import { delay } from '../utils/delay'
import { EMOJIS } from '../emojis'

import { PandoraWarning } from '../errors/PandoraWarning'

import type { PandoraClient } from '..'

export async function listLogs(
  client: PandoraClient,
  filterCriteria?: (key: string, message: string) => boolean
) {
  await delay(500)

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
      console.log(`${key}: ${message as string}`)
    })
  }

  return logs
}
