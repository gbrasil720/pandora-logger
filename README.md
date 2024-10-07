# Updated Documentation for Pandora Logger

Pandora Logger is a simple and secure logging library for Node.js, providing encryption options for log files and easy integration into existing projects. This README explains the usage, configuration, methods, and contribution guidelines for the package.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
  - [Constructor Parameters](#constructor-parameters)
  - [Using Configuration File](#using-configuration-file)
- [Methods](#methods)
- [Usage](#usage)
- [Contributing](#contributing)

## Installation
To install the Pandora Logger, run:

```bash
npm install pandora-logger
```

or

```bash
yarn add pandora-logger
```

## Configuration
You can configure the Pandora Client either by passing configuration parameters directly to the constructor or by using a configuration file (JSON or YAML).

### Constructor Parameters
The constructor accepts an object with the following properties:

- **keyType** (`string`): Defines the type of key used for logging. Possible values are `'uuid'`, `'numerical'`, `'cuid'`, and `'date'`.
- **logFilePath** (`string`): Path to the log file. Required.
- **icons** (`boolean`): Enables icons for log messages.
- **backupPath** (`string`, optional): Path to save log backups.
- **encryption** (`object`, optional): Encryption configuration.
  - **enabled** (`boolean`): Whether encryption is enabled.
  - **encryptionKey** (`string`, optional): 32-character key for AES-256 encryption. Required if encryption is enabled.

Example:

```javascript
import { PandoraClient } from 'pandora-logger';

const client = new PandoraClient({
  keyType: 'uuid',
  logFilePath: './logs/pandora.log',
  icons: true,
  backupPath: './backup/pandora_backup.log',
  encryption: {
    enabled: true,
    encryptionKey: '0123456789abcdef0123456789abcdef',
  },
});
```

### Using Configuration File
You can also use a configuration file to initialize the client. Supported formats are JSON and YAML, and the file must be named `pandora.json`, `pandora.yaml`, or `pandora.yml`.

Example configuration file (`pandora.yaml`):

```yaml
keyType: uuid
logFilePath: './logs/pandora.log'
icons: true
backupPath: './backup/pandora_backup.log'
encryption:
  enabled: true
  encryptionKey: '0123456789abcdef0123456789abcdef'
```

To use a configuration file:

```javascript
const client = new PandoraClient('./pandora.yaml');
```

## Methods
The Pandora Client provides several methods to manage logs:

### `init()`
Initializes the client by setting up the log file and reading existing logs. This method returns a `Promise<void>`.

```javascript
await client.init();
```

### `write(logMessage: string, level?: string)`
Writes a log message to the log file. The log level can be `'info'`, `'warning'`, or `'error'` (default is `'info'`). Returns a `Promise<string>` containing the generated log key.

```javascript
const logKey = await client.write('This is an info message', 'info');
```

### `getLog(key: string)`
Retrieves a log message by its key. Returns a `Promise<string>` containing the log message.

```javascript
const logMessage = await client.getLog(logKey);
```

### `del(key: string)`
Deletes a log message by its key. Returns a `Promise<void>`.

```javascript
await client.del(logKey);
```

### `listLogs(filterCriteria?: (key: string, message: string) => boolean)`
Lists all logs that meet the filter criteria. If no filter is provided, all logs are listed. Returns a `Promise<Record<string, string>>` containing the filtered logs.

```javascript
const logs = await client.listLogs();
```

### `listLogsByLevel(level: string)`
Lists logs filtered by log level (`'info'`, `'warning'`, or `'error'`). Returns a `Promise<Record<string, string>>` containing the filtered logs.

```javascript
const warningLogs = await client.listLogsByLevel('warning');
```

### `listLogsByTimeRange(startTime: Date, endTime: Date)`
Lists logs within a specified time range. Returns a `Promise<Record<string, string>>` containing the filtered logs.

```javascript
const logsInRange = await client.listLogsByTimeRange(new Date('2023-01-01'), new Date('2023-12-31'));
```

### `updateLog(key: string, newMessage: string)`
Updates an existing log message by its key. Returns a `Promise<void>`.

```javascript
await client.updateLog(logKey, 'Updated log message');
```

### `backupLogs(backupPath?: string)`
Creates a backup of the logs. If `backupPath` is not provided, it uses the configured backup path. Returns a `Promise<void>`.

```javascript
await client.backupLogs();
```

### `restoreLogs(backupPath: string)`
Restores logs from a backup file. Throws an error if the backup file is not found or has an invalid format. Returns a `Promise<void>`.

```javascript
await client.restoreLogs('./backup/pandora_backup.log');
```

### `rotateLogs(maxFileSize: number)`
Rotates logs based on the specified maximum file size in bytes. If the log file exceeds `maxFileSize`, it will be rotated. Returns a `Promise<void>`.

```javascript
await client.rotateLogs(5000); // Rotate if log file exceeds 5 KB
```

### `clearLogs()`
Clears all logs from the log file. Returns a `Promise<void>`.

```javascript
await client.clearLogs();
```

## Usage
Here's an example of how to use the Pandora Client in a Node.js application:

```javascript
import { PandoraClient } from 'pandora-logger';

(async () => {
  const client = new PandoraClient('./pandora.yaml');
  await client.init();

  const logKey = await client.write('Server started successfully', 'info');
  console.log('Log key:', logKey);

  const logMessage = await client.getLog(logKey);
  console.log('Log message:', logMessage);

  const logs = await client.listLogs();
  console.log('All logs:', logs);

  await client.updateLog(logKey, 'Updated server start message');
  console.log('Log updated successfully.');

  const logsInRange = await client.listLogsByTimeRange(new Date('2023-01-01'), new Date('2023-12-31'));
  console.log('Logs in range:', logsInRange);

  await client.backupLogs();
  console.log('Backup created successfully.');
})();
```

## Contributing
We welcome contributions to Pandora Logger. To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch-name`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch-name`).
5. Open a pull request.

Please ensure that all tests pass before opening a pull request.

### Running Tests
To run tests, use the following command:

```bash
npm test
```

or

```bash
yarn test
```

## License
Pandora Logger is open-source software licensed under the MIT License.

