import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './interface/jwt-payload.interface';
import type { Response } from 'express';
import { TokenStorageService } from './token-storage.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;

  let mockResponse: Response;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: TokenStorageService,
          useValue: { saveRefreshToken: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    mockResponse = {
      cookie: jest.fn().mockReturnThis(),
    } as unknown as Response;

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

      const result = await controller.register(dto, mockResponse);

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

      const result = await controller.login(dto, mockResponse);

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
