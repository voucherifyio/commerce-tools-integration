import * as fs from 'fs';
import * as path from 'path';
import { RequestJsonLogger } from './request-json-logger';

export class RequestJsonFileLogger implements RequestJsonLogger {
  constructor(private readonly loggingDirectory: string) {}

  log(label: string, request: unknown, response: unknown) {
    const fileName = path.join(
      process.cwd(),
      this.loggingDirectory,
      `${label}-${Date.now()}.json`,
    );

    return fs.promises.writeFile(
      fileName,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          label,
          request,
          response,
        },
        null,
        2,
      ),
    );
  }
}
