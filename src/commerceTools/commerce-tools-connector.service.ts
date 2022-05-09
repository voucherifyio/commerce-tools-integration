import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { ConfigService } from '@nestjs/config';
import {
    ClientBuilder,
    AuthMiddlewareOptions,
    HttpMiddlewareOptions,
  } from '@commercetools/sdk-client-v2';
  import {
    ApiRoot,
    createApiBuilderFromCtpClient,
  } from '@commercetools/platform-sdk';
  

@Injectable()
export class CommerceToolsConnectorService {
    constructor(private configService: ConfigService) {}
    private readonly authUrl: string = this.configService.get<string>('COMMERCE_TOOLS_AUTH_URL');
    private readonly apiUrl: string = this.configService.get<string>('COMMERCE_TOOLS_API_URL');
    private readonly projectKey: string = this.configService.get<string>('COMMERCE_TOOLS_PROJECT_KEY');
    private readonly clientId: string = this.configService.get<string>('COMMERCE_TOOLS_ID');
    private readonly clientSecret: string = this.configService.get<string>('COMMERCE_TOOLS_SECRET');
 
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

    public getClient(): ApiRoot {
        const ctpClient =  new ClientBuilder()
            .withProjectKey(this.projectKey)
            .withClientCredentialsFlow(this.authMiddlewareOptions)
            .withHttpMiddleware(this.httpMiddlewareOptions)
            .withLoggerMiddleware()
            .build();

        return createApiBuilderFromCtpClient(ctpClient);
    }

}
