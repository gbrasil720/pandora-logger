import { PandoraClient } from "../index.js";
import { EMOJIS } from "../emojis.js";
import { PandoraError } from "../errors/PandoraError.js";

export function ensureInitialized(client: PandoraClient) {
  if (!client.initialized) {
    throw new PandoraError('PandoraClient is not initialized. Please call init() before using other methods.', EMOJIS.BOOM ?? '', 1001);
  }
}