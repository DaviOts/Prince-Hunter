import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokenStorageService } from './token-storage.service';
import { ConfigService } from '@nestjs/config';

jest.mock('bcrypt');

const mockedHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
const mockedCompare = bcrypt.compare as jest.MockedFunction<
  typeof bcrypt.compare
>;

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findUser: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        {
          provide: TokenStorageService,
          useValue: { saveRefreshToken: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('secret') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const email = 'hunter@mail.com';
    const password = 'S3cure!Pass';

    it('should throw ConflictException when user already exists', async () => {
      mockUsersService.findUser.mockResolvedValue({ email });

      await expect(service.register(email, password)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.findUser).toHaveBeenCalledWith(email);
      expect(mockUsersService.createUser).not.toHaveBeenCalled();
    });

    it('should hash password, create user, and return access_token', async () => {
      mockUsersService.findUser.mockResolvedValue(null);
      mockedHash.mockResolvedValue('hashed_password' as never);
      mockUsersService.createUser.mockResolvedValue({
        id: 'uuid-123',
        email,
      });
      mockJwtService.sign.mockReturnValue('jwt-token-abc');

      const result = await service.register(email, password);

      expect(mockedHash).toHaveBeenCalledWith(password, 10);
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        email,
        password: 'hashed_password',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'uuid-123',
        email,
      });
      expect(result).toEqual({
        access_token: 'jwt-token-abc',
        refresh_token: 'jwt-token-abc',
      });
    });

    it('should throw InternalServerErrorException if createUser fails', async () => {
      mockUsersService.findUser.mockResolvedValue(null);
      mockedHash.mockResolvedValue('hashed_password' as never);
      mockUsersService.createUser.mockRejectedValue(new Error('DB explosion'));

      await expect(service.register(email, password)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('login', () => {
    const email = 'hunter@mail.com';
    const password = 'S3cure!Pass';

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findUser.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on password mismatch', async () => {
      mockUsersService.findUser.mockResolvedValue({
        id: 'uuid-123',
        email,
        password: 'stored_hash',
      });
      mockedCompare.mockResolvedValue(false as never);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockedCompare).toHaveBeenCalledWith(password, 'stored_hash');
    });

    it('should return access_token on valid credentials', async () => {
      mockUsersService.findUser.mockResolvedValue({
        id: 'uuid-123',
        email,
        password: 'stored_hash',
      });
      mockedCompare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('jwt-token-xyz');

      const result = await service.login(email, password);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'uuid-123',
        email,
      });
      expect(result).toEqual({
        access_token: 'jwt-token-xyz',
        refresh_token: 'jwt-token-xyz',
      });
    });
  });
});
