import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch2';
import { ConfigService } from '@nestjs/config';
import {
  ClientBuilder,
  AuthMiddlewareOptions,
  HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

@Injectable()
export class CommerceToolsConnectorService {
  constructor(private configService: ConfigService) {}
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

  public getClient(): ByProjectKeyRequestBuilder {
    let ctpClient;
    if (process.env.COMMERCE_TOOLS_WITH_LOGGER_MIDDLEWARE === 'false') {
      ctpClient = new ClientBuilder()
        .withProjectKey(this.projectKey)
        .withClientCredentialsFlow(this.authMiddlewareOptions)
        .withHttpMiddleware(this.httpMiddlewareOptions)
        .build();
    } else {
      ctpClient = new ClientBuilder()
        .withProjectKey(this.projectKey)
        .withClientCredentialsFlow(this.authMiddlewareOptions)
        .withHttpMiddleware(this.httpMiddlewareOptions)
        .withLoggerMiddleware()
        .build();
    }

    return createApiBuilderFromCtpClient(ctpClient).withProjectKey({
      projectKey: this.projectKey,
    });
  }
}
