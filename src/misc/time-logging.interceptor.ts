import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable()
export class TimeLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const timeBefore = Date.now();
    return next.handle().pipe(
      tap(() => {
        const time = Date.now() - timeBefore;
        if (time > 350) {
          this.logger.debug({
            msg: 'Request response time',
            class: context.getClass().name,
            method: context.getHandler().name,
            time,
          });
        }
      }),
    );
  }
}
