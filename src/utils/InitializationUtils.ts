import { PandoraClient } from "../index";
import { EMOJIS } from "../emojis";
import { PandoraError } from "../errors/PandoraError";

export function ensureInitialized(client: PandoraClient) {
  if (!client.initialized) {
    throw new PandoraError('PandoraClient is not initialized. Please call init() before using other methods.', EMOJIS.BOOM ?? '', 1001);
  }
}