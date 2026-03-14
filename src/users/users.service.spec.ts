import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUser', () => {
    it('should call prisma.user.findUnique with email', async () => {
      const fakeUser = { id: 'uuid-1', email: 'hunter@mail.com' };
      mockPrisma.user.findUnique.mockResolvedValue(fakeUser);

      const result = await service.findUser('hunter@mail.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'hunter@mail.com' },
      });
      expect(result).toEqual(fakeUser);
    });

    it('should return null when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findUser('ghost@void.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user with provided DTO', async () => {
      const dto = { email: 'hunter@mail.com', password: 'hashed_pw' };
      const created = { id: 'uuid-2', ...dto };
      mockPrisma.user.create.mockResolvedValue(created);

      const result = await service.createUser(dto);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(created);
    });
  });

  describe('updateUser', () => {
    it('should update user by id with provided DTO', async () => {
      const dto = { email: 'new@test.com', password: 'new_hash' };
      const updated = { id: 'uuid-1', ...dto };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await service.updateUser('uuid-1', dto);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      const deleted = { id: 'uuid-1', email: 'hunter@mail.com' };
      mockPrisma.user.delete.mockResolvedValue(deleted);

      const result = await service.deleteUser('uuid-1');

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(deleted);
    });
  });
});
