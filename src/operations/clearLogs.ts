import clc from 'cli-color';
import { PandoraClient } from '..';
import { EMOJIS } from '../emojis';
import { delay } from '../utils/delay';

export async function clearLogs(client: PandoraClient) {
  await client.spinner.run(async () => {
    await delay(500);
    client.logger.write({ logs: {}, numericalKeyCounter: client.numericalKeyCounter });
  }, 'Clearing all logs...', `All logs cleared successfully!`)
}