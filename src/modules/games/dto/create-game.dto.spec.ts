import { createGameSchema } from './create-game.dto';

describe('createGameSchema', () => {
  it('should accept valid game title', () => {
    const result = createGameSchema.safeParse({ title: 'Elden Ring' });

    expect(result.success).toBe(true);
  });

  it('should reject title shorter than 2 characters', () => {
    const result = createGameSchema.safeParse({ title: 'A' });

    expect(result.success).toBe(false);
  });

  it('should reject title longer than 100 characters', () => {
    const longTitle = 'A'.repeat(101);
    const result = createGameSchema.safeParse({ title: longTitle });

    expect(result.success).toBe(false);
  });

  it('should reject empty title', () => {
    const result = createGameSchema.safeParse({ title: '' });

    expect(result.success).toBe(false);
  });

  it('should reject missing title field', () => {
    const result = createGameSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('should accept title at min boundary (2 chars)', () => {
    const result = createGameSchema.safeParse({ title: 'Go' });

    expect(result.success).toBe(true);
  });

  it('should accept title at max boundary (100 chars)', () => {
    const result = createGameSchema.safeParse({ title: 'A'.repeat(100) });

    expect(result.success).toBe(true);
  });
});
