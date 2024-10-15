import { PandoraError } from '../errors/PandoraError'

import { EMOJIS } from '../emojis'

import type { PandoraClient } from '../index'

export function ensureInitialized(client: PandoraClient) {
  if (!client.initialized) {
    throw new PandoraError(
      'PandoraClient is not initialized. Please call init() before using other methods.',
      EMOJIS.BOOM ?? '',
      1001
    )
  }
}
