import clc from 'cli-color'

import { delay } from '../utils/delay'
import { EMOJIS } from '../emojis'

import { PandoraWarning } from '../errors/PandoraWarning'

import type { PandoraClient } from '..'

export async function updateLog(
  client: PandoraClient,
  key: string,
  newMessage: string
) {
  await client.spinner.run(
    async () => {
      await delay(500)
    },
    `Updating log for key: ${key}...`,
    `Log updated for key: ${clc.yellow(key)}`
  )

  const logData = client.logger.read()

  if (logData.logs[key]) {
    logData.logs[key] = newMessage
    client.logger.write(logData)
    console.log()
  } else {
    throw new PandoraWarning(
      'Log not found for update. No action taken.',
      EMOJIS.WARNING ?? '',
      2003
    )
  }
}
