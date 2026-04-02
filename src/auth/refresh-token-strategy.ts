import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenStorageService } from './token-storage.service';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenStorage: TokenStorageService,
  ) {
    //call the parent class PassportStrategy
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['refresh_token'] as string;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,

      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ||
        'key_secret_default_fallback',

      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies['refresh_token'] as string;

    const isTokenValidInRedis = await this.tokenStorage.validateToken(
      payload.sub,
      refreshToken,
    );

    if (!isTokenValidInRedis) {
      throw new UnauthorizedException('Refresh token is revoked or invalid');
    }

    return payload;
  }
}
