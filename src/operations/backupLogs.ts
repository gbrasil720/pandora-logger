import { PandoraClient } from '../index.js';
import { delay } from '../utils/delay.js';
import { PandoraWarning } from '../errors/PandoraWarning.js';
import chalk from 'chalk';
import { createGzip } from 'zlib';
import fs from 'fs';
import { EMOJIS } from '../emojis.js';

export async function backupLogs(client: PandoraClient, backupPath?: string) {
  const path = backupPath || client.backupPath || 'backup_logs.json';
  if (!backupPath && !client.backupPath) {
    console.warn(new PandoraWarning('Backup path is not specified. Using default path: backup_logs.json.', EMOJIS.WARNING ?? '', 2004));
  }

  await client.spinner.run(async () => {
    await delay(500);
  }, `Backing up logs to: ${path}...`);

  const logData = client.logger.read();
  client.logger.writeToPath(path, logData);

  // Compress the backup file
  const gzip = createGzip();
  const source = fs.createReadStream(path);
  const destination = fs.createWriteStream(`${path}.gz`);

  source.pipe(gzip).pipe(destination);

  console.log(`${client.icons ? chalk.green(EMOJIS.CHECK_MARK) + ' ' : ''}Logs backed up and compressed successfully to: ${chalk.blue(`${path}.gz`)}`);
}