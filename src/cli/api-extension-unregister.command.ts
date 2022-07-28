import { Command, CommandRunner } from 'nest-commander';
import { RegisterService } from '../api-extension/register.service';
import loadingCli from 'loading-cli';

@Command({
  name: 'unregister',
  description: 'Unregister commercetools API Extension',
})
export class ApiExtenionUnregisterCommand implements CommandRunner {
  constructor(private readonly registerService: RegisterService) {}
  async run(): Promise<void> {
    const spinner = loadingCli(
      'Attempt to unregister commerce tool api extension',
    ).start();

    try {
      await this.registerService.unregister();
      spinner.succeed('Api extension unregistered');
    } catch (error) {
      spinner.fail(`Could not unregister api extension error - ${error}`);
    }
  }
}
