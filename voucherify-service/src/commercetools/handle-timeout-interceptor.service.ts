import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommercetoolsService } from './commercetools.service';
import { Cart as CommercetoolsCart } from '@commercetools/platform-sdk';

@Injectable()
export class HandleTimeoutInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: Logger,
    private readonly commercetoolsService: CommercetoolsService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const body = context?.switchToHttp()?.getRequest()?.body;
    if (!(body?.action === 'Update' && body?.resource.typeId === 'cart')) {
      return next.handle();
    }
    const now = Date.now();
    return next.handle().pipe(
      tap(async () => {
        try {
          await this.commercetoolsService.handleAPIExtensionTimeoutOnCartUpdate(
            body.resource.obj as CommercetoolsCart,
            Date.now() - now,
          );
        } catch (e) {
          console.log(e); //can't use the logger because it cannot handle error objects
          this.logger.error({
            msg: `Error while commercetoolsService.checkIfAPIExtensionRespondedOnTimeAndRevalidateCouponsIfNot function`,
          });
        }
      }),
    );
  }
}
