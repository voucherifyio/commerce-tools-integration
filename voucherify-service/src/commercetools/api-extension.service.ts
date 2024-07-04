import { Injectable } from '@nestjs/common';
import { CommercetoolsConnectorService } from './commercetools-connector.service';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { Extension } from '@commercetools/platform-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiExtensionService {
  private client: ByProjectKeyRequestBuilder;

  constructor(
    private readonly ctConnector: CommercetoolsConnectorService,
    private readonly configService: ConfigService,
  ) {
    this.client = this.ctConnector.getClient();
  }

  async list() {
    const {
      body: { results: extensions },
    } = await this.client
      .extensions()
      .get()
      .execute()
      .catch((result) => result);

    return extensions;
  }

  async removeById(id: string) {
    const extensions = await this.list();
    const extensionToRemove = extensions.find(
      (extension) => extension.id === id,
    );

    if (!extensionToRemove) {
      return false;
    }
    return (
      await this.client
        .extensions()
        .withId({ ID: extensionToRemove.id })
        .delete({ queryArgs: { version: extensionToRemove.version } })
        .execute()
        .catch((result) => result)
    )?.body;
  }

  async removeByAttr(attr: 'key' | 'destination', value: string) {
    const extensions = await this.list();
    const extensionsToRemove = extensions.filter(
      (extension) => extension[attr] === value,
    );
    if (!extensionsToRemove?.length) {
      return false;
    }

    const removedExtensions: Extension[] = [];

    for (const extension of extensionsToRemove) {
      removedExtensions.push(
        (
          await this.client
            .extensions()
            .withId({ ID: extension.id })
            .delete({ queryArgs: { version: extension.version } })
            .execute()
            .catch((result) => result)
        ).body,
      );
    }

    return removedExtensions;
  }

  async add(url: string, key: string): Promise<string | false> {
    const authPasswd = this.configService.get<string>(
      'API_EXTENSION_BASIC_AUTH_PASSWORD',
    );
    const body = {
      destination: {
        type: 'HTTP' as const,
        url: `${url}/api-extension`,
        authentication: {
          type: 'AuthorizationHeader' as const,
          headerValue: `Basic ${authPasswd}`,
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
      key,
    };
    const addResponse = await this.client
      .extensions()
      .post({ body })
      .execute()
      .catch((result) => result);
    return addResponse.body?.id || false;
  }

  async update(url: string): Promise<string | false> {
    const apiExtensionKey = this.configService.get<string>(
      'COMMERCE_TOOLS_API_EXTENSION_KEY',
    );

    if (!apiExtensionKey) {
      throw new Error(`Missing COMMERCE_TOOLS_API_EXTENSION_KEY configuration`);
    }

    await this.removeByAttr('key', apiExtensionKey);

    return await this.add(url, apiExtensionKey);
  }
}
