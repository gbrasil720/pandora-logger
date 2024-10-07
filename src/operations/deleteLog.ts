import { PandoraClient } from '../index.js';
import { delay } from '../utils/delay.js';
import { PandoraWarning } from '../errors/PandoraWarning.js';
import chalk from 'chalk';
import { EMOJIS } from '../emojis.js';

export async function deleteLog(client: PandoraClient, key: string) {
  await client.spinner.run(async () => {
    await delay(500);
  }, `Deleting log for key: ${key}...`);

  const logData = client.logger.read();

  if (logData.logs[key]) {
    delete logData.logs[key];
    client.logger.write(logData);
    console.log(`${client.icons ? chalk.green(EMOJIS.CHECK_MARK) + ' ' : ''}Log deleted for key: ${chalk.yellow(key)}`);
  } else {
    throw new PandoraWarning('Log not found for deletion. No action taken.', EMOJIS.WARNING ?? '', 2002);
  }
}