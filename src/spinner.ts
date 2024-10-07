import cliSpinners from 'cli-spinners';

export class Spinner {
  private icons: boolean;

  constructor(icons: boolean) {
    this.icons = icons;
  }

  async run(operation: () => Promise<void> | void, message: string) {
    const spinnerFrames = cliSpinners.dots.frames;
    let i = 0;

    const spinnerInterval = setInterval(() => {
      process.stdout.write(`\r${this.icons ? spinnerFrames[i = ++i % spinnerFrames.length] + ' ' : ''}${message}`);
    }, cliSpinners.dots.interval);

    await operation();

    clearInterval(spinnerInterval);
    process.stdout.write('\r');
  }
}