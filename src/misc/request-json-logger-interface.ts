export const REQUEST_JSON_LOGGER = 'REQUEST_JSON_LOGGER';

export interface RequestJsonLoggerInterface {
  log(
    label: string,
    request: unknown,
    response: unknown,
    additional?: Record<any, any>,
  ): Promise<void>;
}

export class NoOpRequestJsonLoggerInterface
  implements RequestJsonLoggerInterface
{
  async log() {
    return Promise.resolve();
  }
}
