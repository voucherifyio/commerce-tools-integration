import { Controller, Post, Req, HttpException } from '@nestjs/common';
import { Request } from 'express';
import { ApiExtensionService } from './api-extension.service';
import { TypesService } from '../commerceTools/types/types.service';

@Controller('api-extension')
export class ApiExtensionController {
  constructor(private readonly apiExtensionService: ApiExtensionService) {}

  @Post()
  async findAll(@Req() request: Request): Promise<any> {
    const type = request?.body?.resource?.typeId;
    let response;
    if (type === 'cart') {
      response = await this.apiExtensionService.checkCart(request?.body);
    }
    if (!response.status) {
      throw new HttpException('', 400);
    }
    return { actions: response.actions };
  }
}
