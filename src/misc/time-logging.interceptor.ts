import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JsonLoggerService } from 'json-logger-service';

@Injectable()
export class TimeLoggingInterceptor implements NestInterceptor {
  constructor(private logger = new JsonLoggerService('NestServer')) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const timeBefore = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(`Execution time: ${Date.now() - timeBefore}ms`),
        ),
      );
  }
}
