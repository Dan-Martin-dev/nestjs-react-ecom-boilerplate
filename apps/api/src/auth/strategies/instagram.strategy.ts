import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-instagram';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InstagramStrategy extends PassportStrategy(Strategy, 'instagram') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('INSTAGRAM_CLIENT_ID') || '',
      clientSecret: configService.get<string>('INSTAGRAM_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('INSTAGRAM_CALLBACK_URL', 'http://localhost:3000/auth/instagram/callback'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
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
