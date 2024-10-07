import { PandoraClient } from '../index.js';
import { EMOJIS } from '../emojis.js';
import { delay } from '../utils/delay.js';
import chalk from 'chalk';
import fs from 'fs';

export async function rotateLogs(client: PandoraClient, maxFileSize: number = 5 * 1024 * 1024) { // Default to 5MB
  await client.spinner.run(async () => {
    await delay(500);
  }, 'Checking log file size for rotation...');

  const stats = fs.statSync(client.logger.filePath);
  if (stats.size > maxFileSize) {
    const rotatedPath = `${client.logger.filePath}.${new Date().toISOString()}.backup`;
    fs.renameSync(client.logger.filePath, rotatedPath);
    client.logger.create({ logs: {}, numericalKeyCounter: 1 });
    console.log(`${client.icons ? chalk.green(EMOJIS.CHECK_MARK) + ' ' : ''}Log file rotated. Backup created at: ${chalk.blue(rotatedPath)}`);
  } else {
    console.log(`${client.icons ? chalk.yellow(EMOJIS.INFO) + ' ' : ''}Log file size is within limits. No rotation needed.`);
  }
}