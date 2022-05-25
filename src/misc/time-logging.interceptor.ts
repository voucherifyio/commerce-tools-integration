import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
@Injectable()
export class TimeLoggingInterceptor implements NestInterceptor {
  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    TimeLoggingInterceptor.name,
  );
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const timeBefore = Date.now();
    return next.handle().pipe(
      tap(() =>
        this.logger.info({
          class: context.getClass().name,
          method: context.getHandler().name,
          time: Date.now() - timeBefore,
        }),
      ),
    );
  }
}
