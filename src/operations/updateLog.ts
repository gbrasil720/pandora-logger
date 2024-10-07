import { PandoraClient } from '../index.js';
import { delay } from '../utils/delay.js';
import { PandoraWarning } from '../errors/PandoraWarning.js';
import chalk from 'chalk';
import { EMOJIS } from '../emojis.js';

export async function updateLog(client: PandoraClient, key: string, newMessage: string) {
  await client.spinner.run(async () => {
    await delay(500);
  }, `Updating log for key: ${key}...`);

  const logData = client.logger.read();

  if (logData.logs[key]) {
    logData.logs[key] = newMessage;
    client.logger.write(logData);
    console.log(`${client.icons ? chalk.green(EMOJIS.CHECK_MARK) + ' ' : ''}Log updated for key: ${chalk.yellow(key)}`);
  } else {
    throw new PandoraWarning('Log not found for update. No action taken.', EMOJIS.WARNING ?? '', 2003);
  }
}