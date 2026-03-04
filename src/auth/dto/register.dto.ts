import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      'Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    ),
});

export class RegisterDto extends createZodDto(registerSchema) {}
