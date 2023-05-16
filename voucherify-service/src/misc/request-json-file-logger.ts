import * as fs from 'fs';
import * as path from 'path';
import { RequestJsonLoggerInterface } from './request-json-logger-interface';

export class RequestJsonFileLogger implements RequestJsonLoggerInterface {
  constructor(private readonly loggingDirectory: string) {}

  log(
    label: string,
    request: unknown,
    response: unknown,
    additional?: Record<any, any>,
  ) {
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
          ...additional,
        },
        null,
        2,
      ),
    );
  }
}
