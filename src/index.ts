import fs from 'fs'
import yaml from 'js-yaml'
import { v4 as uuidv4 } from 'uuid';
import cuid from 'cuid';
import path from 'path'

import { ClientConfig, LogKey, PandoraClientTypes } from './types';

import { EMOJIS } from './emojis';
import { PandoraError } from './errors/PandoraError';
import { Spinner } from './spinner';
import { Logger } from './logger';
import { ensureInitialized } from './utils/InitializationUtils';
import {
  writeLog,
  getLog,
  deleteLog,
  listLogs,
  updateLog,
  backupLogs,
  clearLogs,
  restoreLogs,
  rotateLogs
} from './operations';
import clc from 'cli-color';

export class PandoraClient implements PandoraClientTypes {
  public keyType: LogKey;
  public logFilePath: string;
  // public icons: boolean;
  public numericalKeyCounter: number;
  public initialized: boolean;
  public backupPath?: string;
  public logger: Logger;
  public spinner: Spinner;

  constructor(config: ClientConfig | string) {
    let clientConfig: ClientConfig;

    if (typeof config === 'string') {
      if (!fs.existsSync(config)) {
        throw new PandoraError('Configuration file not found. Please provide a valid path.', EMOJIS.WARNING ?? '', 1001);
      }
      const fileExtension = (config.split('.').pop() ?? '').toLowerCase();
      if (fileExtension === 'json') {
        clientConfig = JSON.parse(fs.readFileSync(config, 'utf-8'));
      } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
        clientConfig = yaml.load(fs.readFileSync(config, 'utf-8')) as ClientConfig;
      } else {
        throw new PandoraError('Unsupported configuration file format. Please provide a JSON or YAML file.', EMOJIS.WARNING ?? '', 1002);
      }

      const configFileName = (config.split('/').pop() ?? '').toLowerCase();
      if (!['pandora.json', 'pandora.yaml', 'pandora.yml'].includes(configFileName)) {
        throw new PandoraError('Configuration file must be named pandora.json, pandora.yaml, or pandora.yml.', EMOJIS.WARNING ?? '', 1003);
      }
    } else {
      clientConfig = config;
    }

    if (!clientConfig.logFilePath) {
      throw new PandoraError('The log file path (logFilePath) is required and was not provided.', EMOJIS.WARNING ?? '', 1004);
    }
    if (clientConfig.encryption?.enabled && (!clientConfig.encryption.encryptionKey || clientConfig.encryption.encryptionKey.length !== 32)) {
      throw new PandoraError('Invalid encryption key. Ensure the key is 32 characters for AES-256.', EMOJIS.WARNING ?? '', 1005);
    }

    this.keyType = clientConfig.keyType;
    this.logFilePath = clientConfig.logFilePath;
    this.backupPath = clientConfig.backupPath;
    this.numericalKeyCounter = 1;
    this.initialized = false;
    this.logger = new Logger(this.logFilePath, clientConfig.encryption || { enabled: false });
    this.spinner = new Spinner()
  }

  generateKey(): string | number {
    switch (this.keyType) {
      case 'uuid':
        return uuidv4();
      case 'numerical':
        return this.numericalKeyCounter++;
      case 'cuid':
        return cuid();
      case 'date':
        return new Date().toISOString();
      default:
        throw new Error('Unsupported key type.');
    }
  }

  async init() {
    await this.spinner.run(async () => {
      if (!this.logger.exists()) {
        this.logger.create({ logs: {}, numericalKeyCounter: 1 });
      }
      const logData = this.logger.read();
      this.numericalKeyCounter = logData.numericalKeyCounter || 1;
      this.initialized = true;
    }, 'Initializing PandoraClient...', `${clc.green(EMOJIS.ROCKET)}PandoraClient initialized successfully!`);
  }

  async write(logMessage: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<string | number> {
    ensureInitialized(this);
    try {
      const logKey = await writeLog(this, `[${level.toUpperCase()}]: ${logMessage}`);
      return logKey;
    } catch (error) {
      throw new PandoraError('Failed to write log. Please check the log message and try again.', EMOJIS.BOOM ?? '', 1010);
    }
  }

  async getLog(key: string): Promise<string | undefined> {
    ensureInitialized(this);
    try {
      return await getLog(this, key);
    } catch (error) {
      throw new PandoraError('Failed to retrieve log. Please verify the log key.', EMOJIS.BROKEN_HEART ?? '', 1011);
    }
  }

  async del(key: string) {
    ensureInitialized(this);
    try {
      await deleteLog(this, key);
    } catch (error) {
      throw new PandoraError('Failed to delete log. Please verify the log key.', EMOJIS.BOOM ?? '', 1012);
    }
  }

  async listLogs(filterCriteria?: (key: string, message: string) => boolean) {
    ensureInitialized(this);
    try {
      const logs = await listLogs(this, filterCriteria);
      return logs
    } catch (error) {
      throw new PandoraError('Failed to list logs. Please try again later.', EMOJIS.BROKEN_HEART ?? '', 1013);
    }
  }

  async listLogsByLevel(level: 'info' | 'warning' | 'error') {
    ensureInitialized(this);
    try {
      await listLogs(this, (_: any, message: any) => message.includes(`[${level.toUpperCase()}]`));
    } catch (error) {
      throw new PandoraError('Failed to list logs by level. Please try again later.', EMOJIS.BROKEN_HEART ?? '', 1014);
    }
  }

  async listLogsByTimeRange(startTime: Date, endTime: Date) {
    ensureInitialized(this);
    try {
      await listLogs(this, (key: any) => {
        const logDate = new Date(key);
        return logDate >= startTime && logDate <= endTime;
      });
    } catch (error) {
      throw new PandoraError('Failed to list logs by time range. Please verify the dates.', EMOJIS.BROKEN_HEART ?? '', 1015);
    }
  }

  async updateLog(key: string, newMessage: string) {
    ensureInitialized(this);
    try {
      await updateLog(this, key, newMessage);
    } catch (error) {
      throw new PandoraError('Failed to update log. Please verify the log key and message.', EMOJIS.BOOM ?? '', 1016);
    }
  }

  async backupLogs(backupPath?: string) {
    ensureInitialized(this);
    const targetPath = backupPath || this.backupPath;
    if (!targetPath) {
      throw new PandoraError('Backup path is required but not provided.', EMOJIS.WARNING ?? '', 1003);
    }

    const backupDir = path.dirname(targetPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
      await backupLogs(this, targetPath);
    } catch (error) {
      throw new PandoraError('Failed to backup logs. Please verify the backup path.', EMOJIS.BOOM ?? '', 1004);
    }
  }

  async restoreLogs(backupPath: string) {
    ensureInitialized(this);
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    if (!fs.existsSync(backupPath)) {
      throw new PandoraError('Backup file not found. Please verify the backup path.', EMOJIS.BROKEN_HEART ?? '', 1005);
    }

    try {
      await restoreLogs(this, backupPath);
    } catch (error) {
      throw new PandoraError('Failed to restore logs. Please verify the backup file.', EMOJIS.BROKEN_HEART ?? '', 1006);
    }
  }

  async rotateLogs(maxFileSize?: number) {
    ensureInitialized(this);
    try {
      await rotateLogs(this, maxFileSize);
    } catch (error) {
      throw new PandoraError('Failed to rotate logs. Please check the file size limit.', EMOJIS.BOOM ?? '', 1019);
    }
  }

  async clearLogs() {
    ensureInitialized(this);
    try {
      await clearLogs(this);
    } catch (error) {
      throw new PandoraError('Failed to clear logs. Please try again later.', EMOJIS.BOOM ?? '', 1020);
    }
  }
}