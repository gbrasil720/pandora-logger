import fs from 'node:fs'
import path from 'node:path'

import yaml from 'js-yaml'
import clc from 'cli-color'

import type { ClientConfig, LogKey, PandoraClientTypes } from './types'

import { EMOJIS } from './emojis'
import { Spinner } from './spinner'
import { Logger } from './logger'

import { PandoraError } from './errors/PandoraError'

import { ensureInitialized } from './utils/InitializationUtils'

import {
  writeLog,
  getLog,
  deleteLog,
  listLogs,
  updateLog,
  backupLogs,
  clearLogs,
  restoreLogs,
  rotateLogs,
} from './operations'

export class PandoraClient implements PandoraClientTypes {
  public keyType: LogKey
  public logFilePath: string
  public numericalKeyCounter: number
  public initialized: boolean
  public backupPath?: string
  public logger: Logger
  public spinner: Spinner

  constructor(config: ClientConfig | string) {
    let clientConfig: ClientConfig

    if (typeof config === 'string') {
      if (!fs.existsSync(config)) {
        throw new PandoraError(
          'Configuration file not found. Please provide a valid path.',
          EMOJIS.WARNING ?? '',
          1001
        )
      }
      const fileExtension = (config.split('.').pop() ?? '').toLowerCase()
      if (fileExtension === 'json') {
        clientConfig = JSON.parse(fs.readFileSync(config, 'utf-8'))
      } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
        clientConfig = yaml.load(
          fs.readFileSync(config, 'utf-8')
        ) as ClientConfig
      } else {
        throw new PandoraError(
          'Unsupported configuration file format. Please provide a JSON or YAML file.',
          EMOJIS.WARNING ?? '',
          1002
        )
      }

      const configFileName = (config.split('/').pop() ?? '').toLowerCase()
      if (
        !['pandora.json', 'pandora.yaml', 'pandora.yml'].includes(
          configFileName
        )
      ) {
        throw new PandoraError(
          'Configuration file must be named pandora.json, pandora.yaml, or pandora.yml.',
          EMOJIS.WARNING ?? '',
          1003
        )
      }
    } else {
      clientConfig = config
    }

    if (!clientConfig.logFilePath) {
      throw new PandoraError(
        'The log file path (logFilePath) is required and was not provided.',
        EMOJIS.WARNING ?? '',
        1004
      )
    }
    if (
      clientConfig.encryption?.enabled &&
      (!clientConfig.encryption.encryptionKey ||
        clientConfig.encryption.encryptionKey.length !== 32)
    ) {
      throw new PandoraError(
        'Invalid encryption key. Ensure the key is 32 characters for AES-256.',
        EMOJIS.WARNING ?? '',
        1005
      )
    }

    this.keyType = clientConfig.keyType
    this.logFilePath = clientConfig.logFilePath
    this.backupPath = clientConfig.backupPath
    this.numericalKeyCounter = 1
    this.initialized = false
    this.logger = new Logger(
      this.logFilePath,
      clientConfig.encryption || { enabled: false }
    )
    this.spinner = new Spinner()
  }

  async init() {
    await this.spinner.run(
      async () => {
        if (!this.logger.exists()) {
          this.logger.create({ logs: {}, numericalKeyCounter: 1 })
        }
        const logData = this.logger.read()
        this.numericalKeyCounter = logData.numericalKeyCounter || 1

        this.initialized = true
      },
      `${EMOJIS.HOURGLASS} Initializing PandoraClient...`,
      `${EMOJIS.ROCKET} PandoraClient initialized successfully!`,
      `${EMOJIS.BOOM} Failed to initialize PandoraClient. Please check the configuration.`
    )
  }

  async write(
    logMessage: string,
    level: 'info' | 'warning' | 'error' = 'info'
  ): Promise<string | number | any> {
    ensureInitialized(this)
    return await this.spinner.run(
      async () => {
        await writeLog(this, `[${level.toUpperCase()}]: ${logMessage}`)
      },
      `${EMOJIS.HOURGLASS} Writing log at level: ${clc.blue(level.toUpperCase())}...`,
      `${EMOJIS.CHECK_MARK} Log written successfully at level: ${clc.green(level.toUpperCase())}`,
      `${EMOJIS.BOOM} Failed to write log at level: ${clc.red(level.toUpperCase())}. Please check the log message and try again.`
    )
  }

  async getLog(key: string): Promise<string | undefined | any> {
    ensureInitialized(this)
    return await this.spinner.run(
      async () => {
        const logMessage = await getLog(this, key)
        if (!logMessage) {
          throw new PandoraError(
            'Log not found for the provided key.',
            EMOJIS.WARNING ?? '',
            1011
          )
        }
      },
      `${EMOJIS.HOURGLASS} Retrieving log for key: ${clc.blue(key)}...`,
      `${EMOJIS.CHECK_MARK} Log retrieved successfully for key: ${clc.green(key)}`,
      `${EMOJIS.BOOM} Failed to retrieve log for key: ${clc.red(key)}. Please verify the log key.`
    )
  }

  async del(key: string) {
    ensureInitialized(this)
    await this.spinner.run(
      async () => {
        await deleteLog(this, key)
      },
      `${EMOJIS.HOURGLASS} Deleting log for key: ${clc.blue(key)}...`,
      `${EMOJIS.CHECK_MARK} Log deleted successfully for key: ${clc.green(key)}`,
      `${EMOJIS.BOOM} Failed to delete log for key: ${clc.red(key)}. Please verify the log key.`
    )
  }

  async listLogs(filterCriteria?: (key: string, message: string) => boolean) {
    ensureInitialized(this)
    return await this.spinner.run(
      async () => {
        const logs = await listLogs(this, filterCriteria)
        return logs
      },
      `${EMOJIS.HOURGLASS} Listing logs...`,
      `${EMOJIS.CHECK_MARK} Logs listed successfully!`,
      `${EMOJIS.BOOM} Failed to list logs. Please try again later.`
    )
  }

  async listLogsByLevel(level: 'info' | 'warning' | 'error') {
    ensureInitialized(this)
    return await this.spinner.run(
      async () => {
        await listLogs(this, (_: any, message: any) =>
          message.includes(`[${level.toUpperCase()}]`)
        )
      },
      `${EMOJIS.HOURGLASS} Listing logs at level: ${clc.blue(level.toUpperCase())}...`,
      `${EMOJIS.CHECK_MARK} Logs listed successfully at level: ${clc.green(level.toUpperCase())}`,
      `${EMOJIS.BOOM} Failed to list logs at level: ${clc.red(level.toUpperCase())}. Please try again later.`
    )
  }

  async listLogsByTimeRange(startTime: Date, endTime: Date) {
    ensureInitialized(this)
    return await this.spinner.run(
      async () => {
        await listLogs(this, (key: any) => {
          const logDate = new Date(key)
          return logDate >= startTime && logDate <= endTime
        })
      },
      `${EMOJIS.HOURGLASS} Listing logs from ${clc.blue(startTime.toISOString())} to ${clc.blue(endTime.toISOString())}...`,
      `${EMOJIS.CHECK_MARK} Logs listed successfully for the given time range!`,
      `${EMOJIS.BOOM} Failed to list logs for the given time range. Please verify the dates.`
    )
  }

  async updateLog(key: string, newMessage: string) {
    ensureInitialized(this)
    await this.spinner.run(
      async () => {
        await updateLog(this, key, newMessage)
      },
      `${EMOJIS.HOURGLASS} Updating log for key: ${clc.blue(key)}...`,
      `${EMOJIS.CHECK_MARK} Log updated successfully for key: ${clc.green(key)}`,
      `${EMOJIS.BOOM} Failed to update log for key: ${clc.red(key)}. Please verify the log key and message.`
    )
  }

  async backupLogs(backupPath?: string) {
    ensureInitialized(this)
    const targetPath = backupPath || this.backupPath
    if (!targetPath) {
      throw new PandoraError(
        'Backup path is required but not provided.',
        EMOJIS.WARNING ?? '',
        1003
      )
    }

    const backupDir = path.dirname(targetPath)
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    try {
      await this.spinner.run(
        async () => {
          await backupLogs(this, targetPath)
        },
        `${EMOJIS.HOURGLASS} Backing up logs to: ${clc.blue(targetPath)}...`,
        `${EMOJIS.CHECK_MARK} Logs backed up and compressed successfully to: ${clc.green(`${targetPath}.gz`)}`,
        `${EMOJIS.BOOM} Failed to backup logs. Please verify the path: ${clc.red(targetPath)}`
      )
    } catch (error) {
      throw new PandoraError(
        'Failed to backup logs. Please verify the backup path.',
        EMOJIS.BOOM ?? '',
        1004
      )
    }
  }

  async restoreLogs(backupPath: string) {
    ensureInitialized(this)
    const backupDir = path.dirname(backupPath)
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    if (!fs.existsSync(backupPath)) {
      throw new PandoraError(
        'Backup file not found. Please verify the backup path.',
        EMOJIS.BROKEN_HEART ?? '',
        1005
      )
    }

    await this.spinner.run(
      async () => {
        await restoreLogs(this, backupPath)
      },
      `${EMOJIS.HOURGLASS} Restoring logs from: ${clc.blue(backupPath)}...`,
      `${EMOJIS.CHECK_MARK} Logs restored successfully from: ${clc.green(backupPath)}`,
      `${EMOJIS.BOOM} Failed to restore logs from: ${clc.red(backupPath)}. Please verify the backup file.`
    )
  }

  async rotateLogs(maxFileSize?: number) {
    ensureInitialized(this)
    await this.spinner.run(
      async () => {
        await rotateLogs(this, maxFileSize)
      },
      `${EMOJIS.HOURGLASS} Rotating logs...`,
      `${EMOJIS.CHECK_MARK} Logs rotated successfully!`,
      `${EMOJIS.BOOM} Failed to rotate logs. Please check the file size limit.`
    )
  }

  async clearLogs() {
    ensureInitialized(this)
    await this.spinner.run(
      async () => {
        await clearLogs(this)
      },
      `${EMOJIS.HOURGLASS} Clearing all logs...`,
      `${EMOJIS.CHECK_MARK} All logs cleared successfully!`,
      `${EMOJIS.BOOM} Failed to clear logs. Please try again later.`
    )
  }
}
