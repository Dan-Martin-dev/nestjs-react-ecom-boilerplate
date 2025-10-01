import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
// Import the Strategy type from passport
import { Strategy as PassportBaseStrategy } from 'passport';

interface FacebookProfile {
  id: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  name?: {
    givenName?: string;
    familyName?: string;
  };
}

// Define options for Facebook strategy if needed in the future
// Removed unused interface

// We'll use this as a placeholder when the module isn't available
const EmptyBaseClass = class {
  constructor(_options?: unknown) {}
};

// Store the Facebook Strategy constructor if available
let FacebookStrategyClass: any = null;
let isFacebookAvailable = false;

try {
  // We need to use import.meta.resolve for ESM compatibility, but that's not available in all environments
  // So we'll use a safer dynamic import pattern
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const passportFacebook = require('passport-facebook');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  FacebookStrategyClass = passportFacebook.Strategy;
  isFacebookAvailable = true;
} catch {
  // Module may not be available in all environments
}

// Create a base class for our strategy to extend
const FacebookBase = isFacebookAvailable
  ? PassportStrategy(
      FacebookStrategyClass as typeof PassportBaseStrategy,
      'facebook',
    )
  : EmptyBaseClass;

@Injectable()
export class FacebookStrategy extends FacebookBase {
  constructor(private configService: ConfigService) {
    if (!isFacebookAvailable) {
      console.warn('passport-facebook not installed — Facebook OAuth disabled');
      super();
      return;
    }

    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || '',
      callbackURL: configService.get<string>(
        'FACEBOOK_CALLBACK_URL',
        'http://localhost:3001/api/v1/auth/facebook/callback',
      ),
      scope: ['email', 'public_profile'],
      profileFields: [
        'id',
        'displayName',
        'email',
        'first_name',
        'last_name',
        'picture',
      ],
    });
  }

  // We use async for consistency with other passport strategies, even though this implementation doesn't use await
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: FacebookProfile,
    done: (error: unknown, user?: unknown) => void,
  ): Promise<void> {
    if (!isFacebookAvailable) {
      done(null, null);
      return;
    }

    const { id, displayName, emails, photos, name } = profile;

    const user = {
      provider: 'facebook',
      providerId: id,
      email: emails ? emails[0].value : null,
      firstName: name?.givenName || displayName?.split(' ')[0],
      lastName: name?.familyName || displayName?.split(' ').slice(1).join(' '),
      picture: photos ? photos[0].value : null,
      accessToken,
    };

    done(null, user);
  }
}
