import { Logger } from '../logger';
import { Spinner } from '../spinner';

export type LogKey = 'uuid' | 'numerical' | 'cuid' | 'date';

export interface EncryptionOptions {
  enabled: boolean;
  encryptionKey?: string;
}

export interface ClientConstructor {
  keyType: LogKey;
  logFilePath: string;
  icons: boolean;
  backupPath?: string;
  encryption?: EncryptionOptions;
}

export interface ClientConfig {
  keyType: 'uuid' | 'numerical' | 'cuid' | 'date';
  logFilePath: string;
  backupPath?: string;
  encryption?: EncryptionOptions;
}

export interface PandoraClientTypes {
  keyType: LogKey;
  logFilePath: string;
  backupPath?: string;
  logger: Logger;
  spinner: Spinner;
  numericalKeyCounter: number;
  initialized: boolean;
}

export class PandoraClient implements PandoraClientTypes {
  keyType: LogKey;
  logFilePath: string;
  icons: boolean;
  backupPath?: string;
  logger: Logger;
  spinner: Spinner;
  numericalKeyCounter: number;
  initialized: boolean;
  constructor(config: ClientConstructor | string);
  init(): Promise<void>;
  write(logMessage: string, level?: string): Promise<string>;
  getLog(key: string): Promise<string>;
  del(key: string): Promise<void>;
  listLogs(filterCriteria?: (key: string, message: string) => boolean): Promise<Record<string, string>>;
  listLogsByLevel(level: string): Promise<Record<string, string>>;
  backupLogs(backupPath?: string): Promise<void>;
  restoreLogs(backupPath: string): Promise<void>;
  rotateLogs(maxFileSize: number): Promise<void>;
  clearLogs(): Promise<void>;
}
