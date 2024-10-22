import { delay } from '../utils/delay'
import { EMOJIS } from '../emojis'

import { PandoraWarning } from '../errors/PandoraWarning'

import type { PandoraClient } from '..'

export async function getLog(
  client: PandoraClient,
  key: string
): Promise<string | undefined> {
  await delay(500)

  const logData = client.logger.read()
  const logMessage = logData.logs[key]

  if (logMessage) {
    console.log(`${EMOJIS.CHECK_MARK} Log retrieved: ${key} -> ${logMessage}`)
  } else {
    console.warn(
      new PandoraWarning(
        'Log not found for retrieval.',
        EMOJIS.WARNING ?? '',
        2006
      )
    )
  }

  return logMessage
}
