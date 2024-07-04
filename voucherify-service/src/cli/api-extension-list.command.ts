import { Command, CommandRunner } from 'nest-commander';
import { ApiExtensionService } from '../commercetools/api-extension.service';
import loadingCli from 'loading-cli';
import Table from 'cli-table';

@Command({
  name: 'integration-list',
  description: 'List registered commercetools API Extension',
})
export class ApiExtensionListCommand extends CommandRunner {
  constructor(private readonly registerService: ApiExtensionService) {
    super();
  }

  async run(): Promise<void> {
    const spinner = loadingCli('List registered API Extensions').start();
    const extensions = await this.registerService.list();
    if (extensions?.length) {
      spinner.succeed(`API Extensions received`);
      const table = new Table({
        head: ['Id', 'Key', 'Type', 'Destination', 'Version'],
      });

      table.push(
        ...extensions.map((extension) => {
          const type = extension.destination.type;
          const urlOrArn =
            type === 'HTTP'
              ? extension.destination.url
              : extension.destination.arn;
          return [
            extension.id,
            extension.key || '',
            type,
            urlOrArn,
            extension.version,
          ];
        }),
      );
      //Do not remove this console.log it's important to proper work of CLI
      console.log(table.toString());
    } else {
      spinner.fail(`No API Extensions`);
    }
  }
}
