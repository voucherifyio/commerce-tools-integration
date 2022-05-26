import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JsonLogger, LoggerFactory } from 'json-logger-service';

@Injectable()
export class ApiExtensionGuard implements CanActivate {
  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    ApiExtensionGuard.name,
  );
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authorization = context.switchToHttp().getRequest()
      ?.headers?.authorization;

    const canActivate =
      !process.env.API_EXTENSION_BASIC_AUTH_PASSWORD?.length ||
      authorization ===
        `Basic ${process.env.API_EXTENSION_BASIC_AUTH_PASSWORD}`;

    if (!canActivate) {
      this.logger.warn({
        msg: 'API_EXTENSION_BASIC_AUTH_PASSWORD not match, request blocked',
        class: context.getClass().name,
        method: context.getHandler().name,
        incomingAuthorixation: authorization,
      });
    }
    return canActivate;
  }
}
