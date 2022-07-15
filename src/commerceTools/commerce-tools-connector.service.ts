import { Inject, Injectable } from '@nestjs/common';
import fetch from 'node-fetch2';
import { ConfigService } from '@nestjs/config';
import {
  ClientBuilder,
  AuthMiddlewareOptions,
  HttpMiddlewareOptions,
  Middleware,
  createHttpClient,
  createAuthForClientCredentialsFlow,
  createLoggerMiddleware,
} from '@commercetools/sdk-client-v2';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import {
  RequestJsonLogger,
  REQUEST_JSON_LOGGER,
} from '../misc/request-json-logger';

@Injectable()
export class CommerceToolsConnectorService {
  constructor(
    private configService: ConfigService,
    @Inject(REQUEST_JSON_LOGGER)
    private readonly requestJsonLogger: RequestJsonLogger,
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
      // uri is composed of CT project and resource name, ie. /voucherify-integrations/types
      const uri = url.pathname.split('/')[2];
      await this.requestJsonLogger.log(`ct-client-${uri}`, request, response);
      next(request, response);
    };
  }

  public getClient(): ByProjectKeyRequestBuilder {
    const clientBuilder = new ClientBuilder()
      .withProjectKey(this.projectKey)
      .withMiddleware(
        createAuthForClientCredentialsFlow(this.authMiddlewareOptions),
      )
      .withMiddleware(createHttpClient(this.httpMiddlewareOptions))
      .withMiddleware(this.jsonLoggerMiddleware);

    if (process.env.COMMERCE_TOOLS_WITH_LOGGER_MIDDLEWARE === 'true') {
      clientBuilder.withMiddleware(createLoggerMiddleware());
    }

    const ctpClient = clientBuilder.build();
    return createApiBuilderFromCtpClient(ctpClient).withProjectKey({
      projectKey: this.projectKey,
    });
  }
}
