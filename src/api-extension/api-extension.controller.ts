import { Controller, Post, Req, HttpException } from '@nestjs/common';
import { Request } from 'express';
import { ApiExtensionService } from './api-extension.service';

@Controller('api-extension')
export class ApiExtensionController {
  constructor(private readonly apiExtensionService: ApiExtensionService) {}

  @Post()
  findAll(@Req() request: Request): any {
    const type = request?.body?.resource?.typeId;
    let response;
    if (type === 'cart') {
      response = this.apiExtensionService.checkCart(request?.body);
    }
    if (!response.status) {
      throw new HttpException('', 400);
    }
    return { actions: response.actions };
  }
}
