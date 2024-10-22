import { delay } from '../utils/delay'

import type { PandoraClient } from '..'

export async function clearLogs(client: PandoraClient) {
  await delay(500)
  client.logger.write({
    logs: {},
    numericalKeyCounter: client.numericalKeyCounter,
  })
}
