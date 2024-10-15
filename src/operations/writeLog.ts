import { randomUUID } from 'node:crypto'

import clc from 'cli-color'

import { delay } from '../utils/delay'
import { EMOJIS } from '../emojis'
import type { PandoraClient } from '..'

import { PandoraWarning } from '../errors/PandoraWarning'

export async function writeLog(client: PandoraClient, logMessage: string) {
  if (typeof logMessage !== 'string') {
    throw new PandoraWarning(
      'Log message should be a string. Attempting to convert.',
      EMOJIS.WARNING ?? '',
      2001
    )
  }

  let key
  await client.spinner.run(
    async () => {
      await delay(1000)
      const logData = client.logger.read()

      switch (client.keyType) {
        case 'date':
          key = new Date().toISOString()
          break
        case 'uuid':
          key = randomUUID()
          break
        case 'cuid':
          key = `cuid${Math.random().toString(36).substr(2, 9)}`
          break
        case 'numerical':
          key = client.numericalKeyCounter++
          logData.numericalKeyCounter = client.numericalKeyCounter
          break
        default:
          throw new PandoraWarning(
            'Unknown key type provided. Defaulting to "unknown".',
            EMOJIS.WARNING ?? '',
            2005
          )
      }

      logData.logs[key] = logMessage
      client.logger.write(logData)
    },
    'Writing log...',
    `Log written successfully: ${clc.cyan(logMessage)}`
  )

  return key as unknown as string | number
}
