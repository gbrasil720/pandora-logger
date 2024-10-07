import clc from 'cli-color';
import { PandoraClient } from '..';
import { EMOJIS } from '../emojis';
import { PandoraError } from '../errors/PandoraError';
import { delay } from '../utils/delay';
import fs from 'fs';
import path from 'path';

export async function restoreLogs(client: PandoraClient, backupPath: string) {
  if (!fs.existsSync(backupPath)) {
    throw new PandoraError(`Backup file not found at path: ${backupPath}`, EMOJIS.BROKEN_HEART ?? '', 3001);
  }

  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  await client.spinner.run(async () => {
    await delay(500);
    try {
      const backupData = fs.readFileSync(backupPath, 'utf-8');
      if (!backupData) {
        throw new PandoraError('Backup file is empty. Please verify the backup file.', EMOJIS.BROKEN_HEART ?? '', 3002);
      }
      
      const decryptedData = client.logger.decrypt(backupData);
      const parsedData = JSON.parse(decryptedData);
      
      if (typeof parsedData !== 'object' || !parsedData.logs) {
        throw new PandoraError('Backup file format is incorrect. Expected a valid log structure.', EMOJIS.BROKEN_HEART ?? '', 3003);
      }
      client.logger.write(parsedData);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new PandoraError('Error parsing the backup file. Please ensure the file is in valid JSON format.', EMOJIS.BROKEN_HEART ?? '', 3004);
      } else {
        throw new PandoraError('Error reading or parsing the backup file. Please ensure the file format is correct.', EMOJIS.BROKEN_HEART ?? '', 3005);
      }
    }
  }, `Restoring logs from: ${backupPath}...`, `Logs restored successfully from: ${clc.blue(backupPath)}`);
}