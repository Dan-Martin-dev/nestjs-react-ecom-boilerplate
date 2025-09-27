// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard leverages the 'jwt' strategy you defined in JwtStrategy.
 * When you apply this guard to a route, it will automatically:
 * 1. Extract the JWT from the request's Authorization header.
 * 2. Validate the token's signature and expiration using the secret key.
 * 3. Invoke the `validate()` method in your `JwtStrategy`.
 * 4. If validation is successful, attach the user object (returned from `validate()`) to `request.user`.
 * 5. If validation fails for any reason (no token, invalid signature, user not found), it throws a 401 UnauthorizedException.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
