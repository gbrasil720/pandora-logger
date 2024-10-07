import { PandoraClient } from '..';
import { delay } from '../utils/delay';
import { PandoraWarning } from '../errors/PandoraWarning';
import { EMOJIS } from '../emojis';
import clc from 'cli-color';

export async function deleteLog(client: PandoraClient, key: string) {
  await client.spinner.run(async () => {
    await delay(500);
  }, `Deleting log for key: ${key}...`, `Log deleted for key: ${clc.yellow(key)}`);

  const logData = client.logger.read();

  if (logData.logs[key]) {
    delete logData.logs[key];
    client.logger.write(logData);
  } else {
    throw new PandoraWarning('Log not found for deletion. No action taken.', EMOJIS.WARNING ?? '', 2002);
  }
}