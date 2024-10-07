import chalk from 'chalk'
import { get } from 'node-emoji'

export class PandoraWarning extends Error {
  public code: number;

  constructor(message: string, emoji: string, code: number) {
    const emojiSymbol = get(emoji) || emoji;
    super(`${emojiSymbol ? emojiSymbol + ' ' : ''}${chalk.yellow(`[Warning Code: ${code}] ${message}`)}`);
    this.name = 'PandoraWarning';
    this.code = code;
  }
}