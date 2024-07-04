import { Inject, Injectable, Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';
import fetch from 'node-fetch2';
import { ConfigService } from '@nestjs/config';
import {
  AuthMiddlewareOptions,
  ClientBuilder,
  ClientRequest,
  createAuthForClientCredentialsFlow,
  createHttpClient,
  createLoggerMiddleware,
  HttpMiddlewareOptions,
  Middleware,
} from '@commercetools/sdk-client-v2';
import {
  Cart,
  createApiBuilderFromCtpClient,
} from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import {
  REQUEST_JSON_LOGGER,
  RequestJsonLoggerInterface,
} from '../misc/request-json-logger-interface';

type MeasurementKey = '__start' | '__httpStart';
type ExtendedRequest = ClientRequest & Record<MeasurementKey, number>;

@Injectable()
export class CommercetoolsConnectorService {
  constructor(
    private configService: ConfigService,
    private logger: Logger,
    @Inject(REQUEST_JSON_LOGGER)
    private readonly requestJsonLogger: RequestJsonLoggerInterface,
  ) {}

  private readonly authUrl: string = this.configService.get<string>(
    'COMMERCE_TOOLS_AUTH_URL',
  );
  private readonly apiUrl: string = this.configService.get<string>(
    'COMMERCE_TOOLS_API_URL',
  );
  private readonly projectKey: string = this.configService.get<string>(
    'COMMERCE_TOOLS_PROJECT_KEY',
  );
  private readonly clientId: string =
    this.configService.get<string>('COMMERCE_TOOLS_ID');
  private readonly clientSecret: string = this.configService.get<string>(
    'COMMERCE_TOOLS_SECRET',
  );

  private ctClient: ByProjectKeyRequestBuilder = null;

  private readonly authMiddlewareOptions: AuthMiddlewareOptions = {
    host: this.authUrl,
    projectKey: this.projectKey,
    credentials: {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    },
    fetch,
  };

  private readonly httpMiddlewareOptions: HttpMiddlewareOptions = {
    host: this.apiUrl,
    fetch,
  };

  private get jsonLoggerMiddleware(): Middleware {
    return (next) => async (request, response) => {
      const url = new URL(request.uri, request.baseUri);
      // uri is composed of CT project and resource name, ie. /voucherify-integrations/custom-types
      const uri = url.pathname.split('/')[2];
      await this.requestJsonLogger.log(`ct-client-${uri}`, request, response);
      next(request, response);
    };
  }

  private measureRequestStart(key: MeasurementKey): Middleware {
    return (next) => (request: ExtendedRequest, response) => {
      request[key] = performance.now();
      next(request, response);
    };
  }

  private get performanceMeasurent(): Middleware {
    return (next) => (request: ExtendedRequest, response) => {
      const now = performance.now();
      const overall = (now - request.__start).toFixed(3);
      const httpRequest = (now - request.__httpStart).toFixed(3);
      const auth = (request.__httpStart - request.__start).toFixed(3);
      this.logger.debug(
        `CT Operation. Overall: ${overall}ms, auth: ${auth}ms, http alone: ${httpRequest}ms`,
      );

      next(request, response);
    };
  }

  public async findCart(id: string): Promise<Cart> {
    const client = this.getClient();
    return (await client.carts().withId({ ID: id }).get().execute())?.body;
  }

  public getClient(): ByProjectKeyRequestBuilder {
    if (this.ctClient) {
      return this.ctClient;
    }

    const start = performance.now();
    const clientBuilder = new ClientBuilder()
      .withMiddleware(this.measureRequestStart('__start'))
      .withProjectKey(this.projectKey)
      .withMiddleware(
        createAuthForClientCredentialsFlow(this.authMiddlewareOptions),
      )
      .withMiddleware(this.measureRequestStart('__httpStart'))
      .withMiddleware(createHttpClient(this.httpMiddlewareOptions))
      .withMiddleware(this.performanceMeasurent)
      .withMiddleware(this.jsonLoggerMiddleware);

    if (process.env.COMMERCE_TOOLS_WITH_LOGGER_MIDDLEWARE === 'true') {
      clientBuilder.withMiddleware(createLoggerMiddleware());
    }

    const ctpClient = clientBuilder.build();
    this.ctClient = createApiBuilderFromCtpClient(ctpClient).withProjectKey({
      projectKey: this.projectKey,
    });
    const end = performance.now();
    this.logger.debug(`CT getClient creation: ${end - start}ms`);

    return this.ctClient;
  }
}
