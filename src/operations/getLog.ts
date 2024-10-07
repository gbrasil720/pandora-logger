import { PandoraClient } from '../index.js';
import { delay } from '../utils/delay.js';
import { PandoraWarning } from '../errors/PandoraWarning.js';
import chalk from 'chalk'
import { EMOJIS } from '../emojis.js';

export async function getLog(client: PandoraClient, key: string): Promise<string | undefined> {
  await client.spinner.run(async () => {
    await delay(500);
  }, `Retrieving log for key: ${key}...`);

  const logData = client.logger.read();
  const logMessage = logData.logs[key];

  if (logMessage) {
    console.log(`${client.icons ? chalk.green(EMOJIS.CHECK_MARK) + ' ' : ''}Log retrieved: ${chalk.yellow(`${key} -> ${logMessage}`)}`);
  } else {
    console.warn(new PandoraWarning('Log not found for retrieval.', EMOJIS.WARNING ?? '', 2006));
  }

  return logMessage;
}