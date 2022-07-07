export const REQUEST_JSON_LOGGER = 'REQUEST_JSON_LOGGER';

export interface RequestJsonLogger {
  log(label: string, request: unknown, response: unknown): Promise<void>;
}

export class NoOpRequestJsonLogger implements RequestJsonLogger {
  async log() {
    return Promise.resolve();
  }
}
