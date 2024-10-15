import clc from 'cli-color'

import { delay } from '../utils/delay'

import type { PandoraClient } from '..'

export async function clearLogs(client: PandoraClient) {
  await client.spinner.run(
    async () => {
      await delay(500)
      client.logger.write({
        logs: {},
        numericalKeyCounter: client.numericalKeyCounter,
      })
    },
    'Clearing all logs...',
    `${clc.green('All logs cleared successfully!')}`
  )
}
