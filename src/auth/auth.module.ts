import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './Jwt.Strategy';
import { TokenStorageService } from './token-storage.service';
import { RefreshTokenStrategy } from './refresh-token-strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokenStorageService,
    RefreshTokenStrategy,
  ],
  exports: [AuthService, TokenStorageService],
})
export class AuthModule {}
