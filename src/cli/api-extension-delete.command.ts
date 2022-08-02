import { Command, CommandRunner, Option } from 'nest-commander';
import { ApiExtensionService } from '../api-extension/api-extension.service';
import loadingCli from 'loading-cli';
import { ConfigService } from '@nestjs/config';
import { Extension } from '@commercetools/platform-sdk';

type ApiExtenionDeleteCommandOptions = {
  id?: string;
};

@Command({
  name: 'api-extension-delete',
  description:
    'Delete commercetools API Extension by "Key" value configured in COMMERCE_TOOLS_API_EXTENSION_KEY environment variable',
})
export class ApiExtenionDeleteCommand implements CommandRunner {
  constructor(
    private readonly registerService: ApiExtensionService,
    private readonly configService: ConfigService,
  ) {}
  async run(
    passedParam: string[],
    options?: ApiExtenionDeleteCommandOptions,
  ): Promise<void> {
    const apiExtensionKey = this.configService.get<string>(
      'COMMERCE_TOOLS_API_EXTENSION_KEY',
    );

    const spinner = loadingCli(
      options.id
        ? `Attempt to unregister commerce tool api extension by Id: ${options.id}`
        : `Attempt to unregister commerce tool api extension by Key: ${apiExtensionKey}`,
    ).start();

    try {
      const removedExtensions: Extension[] = [];

      if (options.id) {
        const removedExtenison = await this.registerService.removeById(
          options.id,
        );

        if (removedExtenison) {
          removedExtensions.push(removedExtenison);
        }
      } else {
        const removed = await this.registerService.removeByAttr(
          'key',
          apiExtensionKey,
        );
        if (removed) {
          removedExtensions.push(...removed);
        }
      }

      if (removedExtensions.length) {
        spinner.succeed(
          `Removed API Extenions, ids: ${removedExtensions
            .map((extension) => extension.id)
            .join(', ')}`,
        );
      } else {
        spinner.warn('Not found API Extension to remove');
      }
    } catch (error) {
      spinner.fail(`Could not delete API Extensions, error - ${error}`);
    }
  }

  @Option({
    flags: '-s, --id [string]',
    description: 'Api Extension Id to remove',
  })
  parseId(val: string): string {
    return val;
  }
}
