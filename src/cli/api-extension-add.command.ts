import { Command, CommandRunner } from 'nest-commander';
import { ConfigService } from '@nestjs/config';
import { ApiExtensionService } from '../api-extension/api-extension.service';
import loadingCli from 'loading-cli';

@Command({
  name: 'api-extension-add',
  description:
    'Add commercetools API Extension to point to your development server',
})
export class ApiExtenionAddCommand implements CommandRunner {
  constructor(
    private readonly registerService: ApiExtensionService,
    private readonly configService: ConfigService,
  ) {}
  async run(): Promise<void> {
    const url = this.configService.get<string>('APP_URL');
    const apiExtensionKey = this.configService.get<string>(
      'COMMERCE_TOOLS_API_EXTENSION_KEY',
    );

    if (!url) {
      loadingCli(`Missing APP_URL configuration`).fail();
      return;
    }

    const spinner = loadingCli(`Register API Extension for ${url}`).start();
    const result = await this.registerService.add(url, apiExtensionKey);
    if (result) {
      spinner.succeed(`API Extension registered for ${url}`);
    } else {
      spinner.fail(`Could not register API Extension for ${url}`);
    }
  }
}
