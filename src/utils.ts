import fs from 'fs'

export const readLogFile = (filePath: string) => {
  const logFileContent = fs.readFileSync(filePath, 'utf-8')

  return JSON.parse(logFileContent)
}

export const writeLogFile = (filePath: string, data: object) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { flag: 'w+' })
}