import fs from 'node:fs'

import clc from 'cli-color'

import { delay } from '../utils/delay'
import { EMOJIS } from '../emojis'

import type { PandoraClient } from '..'

export async function rotateLogs(
  client: PandoraClient,
  maxFileSize: number = 5 * 1024 * 1024
) {
  // Default to 5MB
  const rotatedPath = `${client.logger.filePath}.${new Date().toISOString()}.backup`

  await client.spinner.run(
    async () => {
      await delay(500)
    },
    'Checking log file size for rotation...',
    `Log file rotated. Backup created at: ${clc.blue(rotatedPath)}`
  )

  const stats = fs.statSync(client.logger.filePath)
  if (stats.size > maxFileSize) {
    fs.renameSync(client.logger.filePath, rotatedPath)
    client.logger.create({ logs: {}, numericalKeyCounter: 1 })
  } else {
    console.log(
      `${clc.yellow(EMOJIS.INFO)}Log file size is within limits. No rotation needed.`
    )
  }
}
