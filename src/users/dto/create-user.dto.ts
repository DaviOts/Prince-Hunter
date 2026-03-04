import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
