import clc from 'cli-color'

import { delay } from '../utils/delay'
import { EMOJIS } from '../emojis'

import { PandoraWarning } from '../errors/PandoraWarning'

import type { PandoraClient } from '..'

export async function deleteLog(client: PandoraClient, key: string) {
  await client.spinner.run(
    async () => {
      await delay(500)
    },
    `Deleting log for key: ${key}...`,
    `Log deleted for key: ${clc.yellow(key)}`
  )

  const logData = client.logger.read()

  if (logData.logs[key]) {
    delete logData.logs[key]
    client.logger.write(logData)
  } else {
    throw new PandoraWarning(
      'Log not found for deletion. No action taken.',
      EMOJIS.WARNING ?? '',
      2002
    )
  }
}
