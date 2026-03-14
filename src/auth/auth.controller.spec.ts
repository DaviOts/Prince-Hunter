import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './interface/jwt-payload.interface';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should delegate to authService.register with email and password', async () => {
      const dto: RegisterDto = {
        email: 'hunter@mail.com',
        password: 'P@ssw0rd',
      };
      const expected = { access_token: 'jwt-abc' };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should delegate to authService.login with email and password', async () => {
      const dto: LoginDto = {
        email: 'hunter@mail.com',
        password: 'P@ssw0rd',
      };
      const expected = { access_token: 'jwt-xyz' };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('me', () => {
    it('should return the JWT payload passed by the guard', async () => {
      const payload: JwtPayload = {
        sub: 'uuid-1',
        email: 'hunter@mail.com',
        iat: 123,
        exp: 456,
      };

      const result = await controller.me(payload);

      expect(result).toEqual(payload);
    });
  });
});
