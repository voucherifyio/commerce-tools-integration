import { Controller, Post, Req, HttpException } from '@nestjs/common';
import { Request } from 'express';
import { ApiExtensionService } from './api-extension.service';

@Controller('api-extension')
export class ApiExtensionController {
  constructor(private readonly apiExtensionService: ApiExtensionService) {}

  @Post()
  async findAll(@Req() request: Request): Promise<any> {
    const type = request?.body?.resource?.typeId;
    const authorization = request?.headers?.authorization;
    if (
      (process.env.API_EXTENSION_BASIC_AUTH_PASSWORD?.length &&
        authorization !==
          `Basic ${process.env.API_EXTENSION_BASIC_AUTH_PASSWORD}`) ||
      type !== 'cart'
    ) {
      throw new HttpException('', 400);
    }
    const start = new Date().getTime();
    const response = await this.apiExtensionService.checkCartAndMutate(
      request?.body,
    );
    console.log(`Execution time:  ${new Date().getTime() - start}`);
    if (!response.status) {
      throw new HttpException('', 400);
    }
    return { actions: response.actions };
  }
}
