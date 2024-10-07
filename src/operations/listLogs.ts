import { PandoraClient } from '../index.js';
import { EMOJIS } from '../emojis.js';
import { PandoraWarning } from '../errors/PandoraWarning.js';
import { delay } from '../utils/delay.js';
import chalk from 'chalk';

export async function listLogs(client: PandoraClient, filterCriteria?: (key: string, message: string) => boolean) {
  await client.spinner.run(async () => {
    await delay(500);
  }, 'Listing all logs...');

  let logs;
  if (filterCriteria) {
    logs = client.logger.filter(filterCriteria);
  } else {
    const logData = client.logger.read();
    if (!logData.logs) {
      throw new PandoraWarning('No logs found to list.', EMOJIS.WARNING ?? '', 2006);
    }
    logs = logData.logs;
  }

  if (logs && typeof logs === 'object') {
    Object.entries(logs).forEach(([key, message]) => {
      console.log(`${chalk.yellow(`${key}`)}: ${chalk.cyan(message as string)}`);
    });
  }

  return logs
}
