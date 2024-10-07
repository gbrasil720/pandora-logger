import { PandoraClient } from '../index.js';
import { EMOJIS } from '../emojis.js';
import { delay } from '../utils/delay.js';
import chalk from 'chalk';

export async function clearLogs(client: PandoraClient) {
  await client.spinner.run(async () => {
    await delay(500);
    client.logger.write({ logs: {}, numericalKeyCounter: client.numericalKeyCounter });
  }, 'Clearing all logs...');

  console.log(`${client.icons ? chalk.green(EMOJIS.CHECK_MARK) + ' ' : ''}All logs cleared successfully!`);
}