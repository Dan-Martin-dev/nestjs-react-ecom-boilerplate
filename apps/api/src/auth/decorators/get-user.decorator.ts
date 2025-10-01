// src/auth/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@repo/db';

/**
 * A custom decorator to extract the user object from the request.
 * This decorator should only be used on routes protected by JwtAuthGuard,
 * as it relies on the user object being attached to the request by Passport.
 */
export const GetUser = createParamDecorator(
  (
    data: keyof Omit<User, 'password'> | undefined,
    ctx: ExecutionContext,
  ): User | User[keyof Omit<User, 'password'>] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;

    // If a specific property of the user is requested (e.g., @GetUser('id')), return that property.
    // Otherwise, return the whole user object.
    return data ? user?.[data] : user;
  },
);
