import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Usage: @User() or @User('id') in controllers
 */
export const User = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  return data ? user?.[data] : user;
});
