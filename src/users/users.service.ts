import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async findUser(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return user;
  }
}
