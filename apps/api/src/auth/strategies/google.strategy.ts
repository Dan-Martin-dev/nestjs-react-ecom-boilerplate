import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy as PassportBaseStrategy } from 'passport';

interface GoogleProfile {
  id: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

// Define a base class for when the strategy isn't available
const EmptyBaseClass = class {
  constructor(_options?: unknown) {}
};

// Store the Google Strategy constructor if available
let GoogleStrategyClass: any = null;
let isGoogleAvailable = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const googleModule = require('passport-google-oauth20');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  GoogleStrategyClass = googleModule.Strategy;
  isGoogleAvailable = true;
} catch {
  // leave null and handle below
}

const GoogleBase = isGoogleAvailable
  ? PassportStrategy(
      GoogleStrategyClass as typeof PassportBaseStrategy,
      'google',
    )
  : EmptyBaseClass;

@Injectable()
export class GoogleStrategy extends GoogleBase {
  constructor(private configService: ConfigService) {
    // If the underlying passport strategy isn't available we intentionally
    // skip calling super() and keep a no-op provider so module import doesn't fail.
    if (!isGoogleAvailable) {
      // Use console here because `this` is not available before super()
      console.warn(
        'passport-google-oauth20 not installed — Google OAuth disabled',
      );
      super();
      return;
    }

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      // Ensure callback points to the API route (NestJS global prefix 'api/v1') when running locally
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3001/api/v1/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
  }

  // We use async for consistency with other passport strategies, even though this implementation doesn't use await
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: (error: unknown, user?: unknown) => void,
  ): Promise<void> {
    if (!isGoogleAvailable) {
      done(null, null);
      return;
    }

    const { name, emails, photos, id } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}
