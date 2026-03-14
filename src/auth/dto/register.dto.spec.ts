import { registerSchema } from './register.dto';

describe('registerSchema', () => {
  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'hunter@mail.com',
      password: 'P@ss1234!',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'P@ss1234!',
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty email', () => {
    const result = registerSchema.safeParse({
      email: '',
      password: 'P@ss1234!',
    });

    expect(result.success).toBe(false);
  });

  it('should reject password without uppercase letter', () => {
    const result = registerSchema.safeParse({
      email: 'hunter@mail.com',
      password: 'p@ss1234!',
    });

    expect(result.success).toBe(false);
  });

  it('should reject password without lowercase letter', () => {
    const result = registerSchema.safeParse({
      email: 'hunter@mail.com',
      password: 'P@SS1234!',
    });

    expect(result.success).toBe(false);
  });

  it('should reject password without number', () => {
    const result = registerSchema.safeParse({
      email: 'hunter@mail.com',
      password: 'P@ssword!',
    });

    expect(result.success).toBe(false);
  });

  it('should reject password without special character', () => {
    const result = registerSchema.safeParse({
      email: 'hunter@mail.com',
      password: 'Pass1234',
    });

    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 6 characters', () => {
    const result = registerSchema.safeParse({
      email: 'hunter@mail.com',
      password: 'Ab1!',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing fields', () => {
    const result = registerSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
