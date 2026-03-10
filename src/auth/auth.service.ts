import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
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
      const payload = { sub: result.id, email: result.email };
      const access_token = this.jwtService.sign(payload);

      return { access_token };
    } catch {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findUser(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email };

    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
