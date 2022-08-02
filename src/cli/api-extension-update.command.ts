import { Command, CommandRunner } from 'nest-commander';
import { ConfigService } from '@nestjs/config';
import { ApiExtensionService } from '../api-extension/api-extension.service';
import loadingCli from 'loading-cli';

@Command({
  name: 'api-extension-update',
  description: 'Updated commercetools API Extension to point to your server',
})
export class ApiExtenionUpdateCommand implements CommandRunner {
  constructor(
    private readonly apiExtensionService: ApiExtensionService,
    private readonly configService: ConfigService,
  ) {}
  async run(): Promise<void> {
    const url = this.configService.get<string>('APP_URL');
    const spinner = loadingCli(`Add API Extension for ${url}`).start();
    const result = await this.apiExtensionService.update(url);
    if (result) {
      spinner.succeed(`API Extension registered for ${url}`);
    } else {
      spinner.fail(`Could not register API Extension for ${url}`);
    }
  }
}
