import { createSpinner } from 'nanospinner'

export class Spinner {
  async run(
    operation: () => Promise<void> | void,
    message: string,
    sucessMessage: string
  ) {
    const spinner = createSpinner(message).start()

    try {
      await operation()
      spinner.success({ text: sucessMessage })
    } catch (error) {
      spinner.error({ text: 'Operation failed' })
      throw error
    }
  }
}
