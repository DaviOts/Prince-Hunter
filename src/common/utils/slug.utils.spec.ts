import { generateSlug } from './slug.utils';

describe('generateSlug', () => {
  it('should convert a simple title to a slug', () => {
    expect(generateSlug('Elden Ring')).toBe('elden-ring');
  });

  it('should handle titles with multiple spaces', () => {
    expect(generateSlug('The Witcher 3  Wild Hunt')).toBe(
      'the-witcher-3-wild-hunt',
    );
  });

  it('should strip accented characters via NFD normalization', () => {
    expect(generateSlug('Não é fácil')).toBe('nao-e-facil');
  });

  it('should strip cedilhas and tildes', () => {
    expect(generateSlug('Coração de Ação')).toBe('coracao-de-acao');
  });

  it('should replace special characters with hyphens', () => {
    expect(generateSlug('Cyberpunk 2077: Phantom Liberty')).toBe(
      'cyberpunk-2077-phantom-liberty',
    );
  });

  it('should strip leading and trailing hyphens', () => {
    expect(generateSlug('--Hollow Knight--')).toBe('hollow-knight');
  });

  it('should collapse consecutive hyphens into one', () => {
    expect(generateSlug('Dark   Souls   III')).toBe('dark-souls-iii');
  });

  it('should preserve numbers in the slug', () => {
    expect(generateSlug('Resident Evil 4')).toBe('resident-evil-4');
  });

  it('should return empty string for empty input', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should return empty string when input has only special chars', () => {
    expect(generateSlug('!@#$%^&*()')).toBe('');
  });

  it('should return the same slug if already formatted', () => {
    expect(generateSlug('already-a-slug')).toBe('already-a-slug');
  });
});
