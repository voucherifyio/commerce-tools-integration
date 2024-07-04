import { Command, CommandRunner } from 'nest-commander';
import { ConfigService } from '@nestjs/config';
import { ApiExtensionService } from '../commercetools/api-extension.service';
import loadingCli from 'loading-cli';

@Command({
  name: 'integration-update',
  description:
    'Remove old and add new API Extension pointing to your server. Url is taken from APP_URL or CONNECT_SERVICE_URL environment variables. Old API Extension is recognized by API Extension "key" attribute configured by COMMERCE_TOOLS_API_EXTENSION_KEY environment variable',
})
export class ApiExtensionUpdateCommand extends CommandRunner {
  constructor(
    private readonly apiExtensionService: ApiExtensionService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const url =
      this.configService.get<string>('APP_URL') ||
      this.configService.get<string>('CONNECT_SERVICE_URL');

    const spinner = loadingCli(`Add API Extension for ${url}`).start();
    const result = await this.apiExtensionService.update(url);
    if (result) {
      spinner.succeed(`API Extension registered for ${url}`);
    } else {
      spinner.fail(`Could not register API Extension for ${url}`);
    }
  }
}
