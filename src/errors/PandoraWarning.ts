import { get } from 'node-emoji'
import clc from 'cli-color'

export class PandoraWarning extends Error {
  public code: number;

  constructor(message: string, emoji: string, code: number) {
    const emojiSymbol = get(emoji) || emoji;
    super(`${emojiSymbol ? emojiSymbol + ' ' : ''}${clc.yellow.bold(`[Warning Code: ${code}] ${message}`)}`);
    this.name = 'PandoraWarning';
    this.code = code;
  }
}