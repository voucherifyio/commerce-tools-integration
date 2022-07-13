import { Injectable } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerceTools/commerce-tools-connector.service';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

@Injectable()
export class RegisterService {
  private client: ByProjectKeyRequestBuilder;

  constructor(private readonly ctConnector: CommerceToolsConnectorService) {
    this.client = this.ctConnector.getClient();
  }

  private async removeExistingApiExtensions() {
    const {
      body: { total: extensionTotal, results: extensions },
    } = await this.client.extensions().get().execute();

    if (extensionTotal) {
      for (const extension of extensions) {
        await this.client
          .extensions()
          .withId({ ID: extension.id })
          .delete({ queryArgs: { version: extension.version } })
          .execute();
      }
    }
  }

  private async addApiExtensions(url: string): Promise<string | false> {
    const body = {
      destination: {
        type: 'HTTP' as const,
        url: `${url}/api-extension`,
        authentication: {
          type: 'AuthorizationHeader' as const,
          headerValue: `Basic ${process.env.API_EXTENSION_BASIC_AUTH_PASSWORD}`,
        },
      },
      triggers: [
        {
          resourceTypeId: 'cart' as const,
          actions: ['Create' as const, 'Update' as const],
        },
        {
          resourceTypeId: 'order' as const,
          actions: ['Create' as const, 'Update' as const],
        },
      ],
      timeoutInMs: 2000,
    };
    const addResponse = await this.client.extensions().post({ body }).execute();
    return addResponse.body?.id || false;
  }

  async unregister(): Promise<void> {
    return await this.removeExistingApiExtensions();
  }

  async register(url: string): Promise<string | false> {
    return await this.unregister().then(async () => {
      return await this.addApiExtensions(url);
    });
  }
}
