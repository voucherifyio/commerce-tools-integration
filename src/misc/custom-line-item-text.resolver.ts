import { I18nResolver } from 'nestjs-i18n';
import { Injectable, ExecutionContext } from '@nestjs/common';

@Injectable()
export class CustomLineItemTextResolver implements I18nResolver {
  async resolve(context: ExecutionContext): Promise<string | undefined> {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      return req?.body?.resource?.obj?.locale
        ? req.body.resource.obj.locale
        : undefined;
    }
    return undefined;
  }
}
