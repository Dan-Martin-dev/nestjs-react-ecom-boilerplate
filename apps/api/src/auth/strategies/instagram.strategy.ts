import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy as PassportBaseStrategy } from 'passport';

interface InstagramProfile {
  id: string;
  displayName?: string;
  username?: string;
  photos?: Array<{ value: string }>;
}

// Define interfaces for Instagram strategy options if needed in the future
// Removed unused interface

// Define a base class for when the strategy isn't available
// Add constructor that matches the signature of the Instagram Strategy
const EmptyBaseClass = class {
  constructor(_options?: unknown) {} 
};

// Store the Instagram Strategy constructor if available
let InstagramStrategyClass: any = null;
let isInstagramAvailable = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const instagramModule = require('passport-instagram');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  InstagramStrategyClass = instagramModule.Strategy;
  isInstagramAvailable = true;
} catch {
  // optional dependency may be missing in some deploys
}

const InstagramBase = isInstagramAvailable
  ? PassportStrategy(
      InstagramStrategyClass as typeof PassportBaseStrategy,
      'instagram',
    )
  : EmptyBaseClass;

@Injectable()
export class InstagramStrategy extends InstagramBase {
  constructor(private configService: ConfigService) {
    if (!isInstagramAvailable) {
      console.warn(
        'passport-instagram not installed — Instagram OAuth disabled',
      );
      super();
      return;
    }

    super({
      clientID: configService.get<string>('INSTAGRAM_CLIENT_ID') || '',
      clientSecret: configService.get<string>('INSTAGRAM_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>(
        'INSTAGRAM_CALLBACK_URL',
        'http://localhost:3001/api/v1/auth/instagram/callback',
      ),
    });
  }

  // We use async for consistency with other passport strategies, even though this implementation doesn't use await
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: InstagramProfile,
    done: (error: unknown, user?: unknown) => void,
  ): Promise<void> {
    if (!isInstagramAvailable) {
      done(null, null);
      return;
    }

    const { id, displayName, username, photos } = profile;

    const user = {
      provider: 'instagram',
      providerId: id,
      email: null, // Instagram doesn't provide email in basic profile
      firstName: displayName?.split(' ')[0] || username,
      lastName: displayName?.split(' ').slice(1).join(' ') || '',
      picture: photos ? photos[0].value : null,
      accessToken,
      username,
    };

    done(null, user);
  }
}
