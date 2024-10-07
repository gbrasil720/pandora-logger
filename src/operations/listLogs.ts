import clc from 'cli-color';
import { PandoraClient } from '..';
import { EMOJIS } from '../emojis';
import { PandoraWarning } from '../errors/PandoraWarning';
import { delay } from '../utils/delay';

export async function listLogs(client: PandoraClient, filterCriteria?: (key: string, message: string) => boolean) {
  await client.spinner.run(async () => {
    await delay(500);
  }, 'Listing all logs...', 'Listed all logs successfully!');

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
      console.log(`${clc.yellow(`${key}`)}: ${clc.cyan(message as string)}`);
    });
  }

  return logs
}
