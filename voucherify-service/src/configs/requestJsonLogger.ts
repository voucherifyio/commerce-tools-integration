import {
  NoOpRequestJsonLoggerInterface,
  REQUEST_JSON_LOGGER,
} from '../misc/request-json-logger-interface';
import path from 'path';
import { RequestJsonFileLogger } from '../misc/request-json-file-logger';
import mkdirp from 'mkdirp';

export const RequestJsonLogger = {
  provide: REQUEST_JSON_LOGGER,
  useFactory: async () => {
    if (process.env.DEBUG_STORE_REQUESTS_IN_JSON !== 'true') {
      return new NoOpRequestJsonLoggerInterface();
    }

    const requestsDir = process.env.DEBUG_STORE_REQUESTS_DIR;
    if (!requestsDir) {
      throw new Error(
        'Please provide value of DEBUG_STORE_REQUESTS_DIR env variable!',
      );
    }
    await mkdirp(path.join(process.cwd(), requestsDir));
    return new RequestJsonFileLogger(requestsDir);
  },
};
