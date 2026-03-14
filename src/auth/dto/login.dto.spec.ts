import { loginSchema } from './login.dto';

describe('loginSchema', () => {
  it('should accept valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'hunter@mail.com',
      password: 'Secret123',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'bad-email',
      password: 'Secret123',
    });

    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({
      email: 'hunter@mail.com',
      password: '12345',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing email field', () => {
    const result = loginSchema.safeParse({
      password: 'Secret123',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing password field', () => {
    const result = loginSchema.safeParse({
      email: 'hunter@mail.com',
    });

    expect(result.success).toBe(false);
  });
});
