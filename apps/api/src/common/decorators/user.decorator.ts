import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

interface RequestWithUser {
  user?: JwtPayload;
}

/**
 * Usage: @CurrentUser() or @CurrentUser('sub') in controllers
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayload | undefined,
    ctx: ExecutionContext,
  ): JwtPayload | string | number | undefined => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;

    if (!user) {
      return undefined;
    }

    if (data && data in user) {
      return user[data];
    }

    return user;
  },
);
