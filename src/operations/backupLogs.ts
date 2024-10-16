import fs from 'node:fs'

import clc from 'cli-color'
import { createGzip } from 'zlib'

import { delay } from '../utils/delay'
import { EMOJIS } from '../emojis'

import { PandoraWarning } from '../errors/PandoraWarning'

import type { PandoraClient } from '..'

export async function backupLogs(client: PandoraClient, backupPath?: string) {
  const path = backupPath || client.backupPath || 'backup_logs.json'
  if (!backupPath && !client.backupPath) {
    console.warn(
      new PandoraWarning(
        'Backup path is not specified. Using default path: backup_logs.json.',
        EMOJIS.WARNING ?? '',
        2004
      )
    )
  }

  await client.spinner.run(
    async () => {
      await delay(500)
    },
    `Backing up logs to: ${path}...`,
    `Logs backed up and compressed successfully to: ${clc.blue(`${path}.gz`)}`
  )

  const logData = client.logger.read()
  client.logger.writeToPath(path, logData)

  // Compress the backup file
  const gzip = createGzip()
  const source = fs.createReadStream(path)
  const destination = fs.createWriteStream(`${path}.gz`)

  source.pipe(gzip).pipe(destination)
}
