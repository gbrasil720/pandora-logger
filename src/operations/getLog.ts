import clc from 'cli-color'

import { delay } from '../utils/delay'
import { EMOJIS } from '../emojis'

import { PandoraWarning } from '../errors/PandoraWarning'

import type { PandoraClient } from '..'

export async function getLog(
  client: PandoraClient,
  key: string
): Promise<string | undefined> {
  await client.spinner.run(
    async () => {
      await delay(500)
    },
    `Retrieving log for key: ${key}...`,
    `Log for key: ${key} founded and retrieved successfully!`
  )

  const logData = client.logger.read()
  const logMessage = logData.logs[key]

  if (logMessage) {
    console.log(
      `${clc.green(EMOJIS.CHECK_MARK)}Log retrieved: ${clc.yellow(`${key} -> ${logMessage}`)}`
    )
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
