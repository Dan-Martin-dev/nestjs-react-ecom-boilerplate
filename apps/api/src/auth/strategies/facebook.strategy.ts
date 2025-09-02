import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || '',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL', 'http://localhost:3000/auth/facebook/callback'),
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'picture'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
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
