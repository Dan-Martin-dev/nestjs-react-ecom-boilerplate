import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Try to load the optional passport-google-oauth20 package. If it's missing,
// fall back to a no-op strategy class so the app can start without Google OAuth
let GooglePassportStrategy: any = null;
try {
  // require is used because the package is CommonJS and may not be present in all environments
  GooglePassportStrategy = require('passport-google-oauth20').Strategy;
} catch (e) {
  // leave null and handle below
}

const GoogleBase: any = GooglePassportStrategy ? PassportStrategy(GooglePassportStrategy, 'google') : class {};

@Injectable()
export class GoogleStrategy extends GoogleBase {
  constructor(private configService: ConfigService) {
    // If the underlying passport strategy isn't available we intentionally
    // skip calling super() and keep a no-op provider so module import doesn't fail.
    if (!GooglePassportStrategy) {
      // Use console here because `this` is not available before super()
      console.warn('passport-google-oauth20 not installed — Google OAuth disabled');
      super();
      return;
    }

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:3000/auth/google/callback'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    if (!GooglePassportStrategy) return done(null, null);

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
