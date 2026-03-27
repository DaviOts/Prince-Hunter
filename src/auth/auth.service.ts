import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenStorageService } from './token-storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenStorage: TokenStorageService,
    private readonly configService: ConfigService,
  ) {}

  private async generateAndSaveTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    await this.tokenStorage.saveRefreshToken(userId, refresh_token);
    return { access_token, refresh_token };
  }

  async register(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findUser(email);
    if (user?.email) {
      throw new ConflictException('User already exists');
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const result = await this.usersService.createUser({
        email,
        password: hash,
      });

      return await this.generateAndSaveTokens(result.id, result.email);
    } catch {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findUser(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.generateAndSaveTokens(user.id, user.email);
  }
}
