import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiExtensionGuard implements CanActivate {
  constructor(private readonly logger: Logger) {}

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
        incomingAuthorization: authorization,
      });
    }
    return canActivate;
  }
}
