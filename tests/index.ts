import { PandoraClient } from "../src"
import { ClientConfig } from "../src/types";

type ExampleConfigType = ClientConfig | string;
const exampleConfig: ExampleConfigType = 'src/tests/pandora.yml';

const client = new PandoraClient(exampleConfig)

client.init()

client.listLogs()