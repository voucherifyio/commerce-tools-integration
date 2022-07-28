import { Command, CommandRunner } from 'nest-commander';
import { ConfigService } from '@nestjs/config';
import { RegisterService } from '../api-extension/register.service';
import loadingCli from 'loading-cli';

@Command({
  name: 'register',
  description:
    'Configure commercetools API Extension to point to your development server',
})
export class ApiExtenionRegisterCommand implements CommandRunner {
  constructor(
    private readonly registerService: RegisterService,
    private readonly configService: ConfigService,
  ) {}
  async run(): Promise<void> {
    const url = this.configService.get<string>('APP_URL');

    const spinner = loadingCli(`Register API Extension for ${url}`).start();
    const result = await this.registerService.register(url);
    if (result) {
      spinner.succeed(`API Extension registered for ${url}`);
    } else {
      spinner.fail(`Could not register API Extension for ${url}`);
    }
  }
}
