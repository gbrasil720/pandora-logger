// logger.ts
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PandoraError } from './errors/PandoraError.js';
import { EMOJIS } from './emojis.js';

interface EncryptionOptions {
  enabled: boolean;
  encryptionKey?: string;
}

export class Logger {
  public filePath: string;
  private encryptionOptions: EncryptionOptions;

  constructor(filePath: string, encryptionOptions: EncryptionOptions) {
    if (!filePath) {
      throw new PandoraError('The log file path (logFilePath) is required and was not provided.', EMOJIS.WARNING ?? '', 1001);
    }
    if (encryptionOptions.enabled && (!encryptionOptions.encryptionKey || encryptionOptions.encryptionKey.length !== 32)) {
      throw new PandoraError('Invalid encryption key. Ensure the key is 32 characters for AES-256.', EMOJIS.WARNING ?? '', 1002);
    }

    const logDir = path.dirname(filePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.filePath = filePath;
    this.encryptionOptions = encryptionOptions;
  }

  exists(): boolean {
    return fs.existsSync(this.filePath);
  }

  create(initialData: object) {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = this.encryptionOptions.enabled ? this.encrypt(JSON.stringify(initialData)) : JSON.stringify(initialData, null, 2);
    fs.writeFileSync(this.filePath, data, { flag: 'w+' });
  }

  read(): any {
    if (!this.exists()) {
      return {};
    }
    const content = fs.readFileSync(this.filePath, 'utf-8');
    const decryptedContent = this.encryptionOptions.enabled ? this.decrypt(content) : content;
    return JSON.parse(decryptedContent);
  }

  write(data: object) {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const content = this.encryptionOptions.enabled ? this.encrypt(JSON.stringify(data)) : JSON.stringify(data, null, 2);
    fs.writeFileSync(this.filePath, content, { flag: 'w+' });
  }

  writeToPath(filePath: string, data: object) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const content = this.encryptionOptions.enabled ? this.encrypt(JSON.stringify(data)) : JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, { flag: 'w+' });
  }

  filter(criteria: (key: string, message: string) => boolean): Record<string, string> {
    const logData = this.read();
    const filteredLogs: Record<string, string> = {};

    if (logData.logs && typeof logData.logs === 'object') {
      for (const [key, message] of Object.entries(logData.logs)) {
        if (criteria(key, message as string)) {
          filteredLogs[key] = message as string;
        }
      }
    }

    return filteredLogs;
  }

  private encrypt(text: string): string {
    if (!this.encryptionOptions.encryptionKey) {
      throw new PandoraError('Encryption key not provided. Ensure the key is 32 characters for AES-256.', EMOJIS.WARNING ?? '', 1002);
    }
    const key = Buffer.from(this.encryptionOptions.encryptionKey, 'utf-8');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
    const encrypted = Buffer.concat([iv, cipher.update(text), cipher.final()]);
    return encrypted.toString('hex');
  }

  public decrypt(text: string): string {
    if (!this.encryptionOptions.encryptionKey) {
      throw new PandoraError('Decryption key not provided. Ensure the key is 32 characters for AES-256.', EMOJIS.WARNING ?? '', 1003);
    }
    const key = Buffer.from(this.encryptionOptions.encryptionKey, 'utf-8');
    const encryptedBuffer = Buffer.from(text, 'hex');
    const iv = encryptedBuffer.slice(0, 16);
    const encryptedText = encryptedBuffer.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
