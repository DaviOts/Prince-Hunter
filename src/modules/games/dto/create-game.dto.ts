import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createGameSchema = z.object({
  title: z.string().min(2).max(100),
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class CreateGameDto extends createZodDto(createGameSchema) {}
