import { createSpinner } from 'nanospinner'
import clc from 'cli-color'

export class Spinner {
  async run(
    operation: () => Promise<void> | void,
    message: string,
    sucessMessage: string,
    errorMessage = 'Operation failed'
  ) {
    const spinner = createSpinner(clc.cyan(message)).start()

    const startTime = Date.now()

    try {
      await operation()

      const endTime = Date.now()
      const timeTaken = endTime - startTime

      spinner.success({
        text: `${clc.green(sucessMessage)} ${clc.whiteBright(`[Time Taken: ${timeTaken}ms]`)}`,
      })
    } catch (error) {
      spinner.error({
        text: `${clc.red(errorMessage)} ${clc.whiteBright(`[Error: ${error instanceof Error ? error.message : String(error)}]`)}`,
      })
      throw error
    }
  }
}
