import { PandoraClient } from '../src'
import type { ClientConfig } from '../src/types'

type ExampleConfigType = ClientConfig | string
const exampleConfig: ExampleConfigType = 'src/tests/pandora.yml'

const client = new PandoraClient('./tests/pandora.yml')

client.init()

client.listLogs()
