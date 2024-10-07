import chalk from 'chalk'
import { get } from 'node-emoji'

export class PandoraError extends Error {
  public code: number

  constructor(message: string, emoji: string, code: number) {
    const emojiSymbol = get(emoji) || emoji
    super(`${emojiSymbol ? emojiSymbol + ' ' : ''}${chalk.red(`[Error Code: ${code}] ${message}`)}`);
    this.name = 'PandoraError'
    this.code = code
  }
}