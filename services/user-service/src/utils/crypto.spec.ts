import { encrypt, decrypt } from './crypto';

describe('Crypto Utility', () => {
  it('should encrypt and decrypt a string successfully', () => {
    const text = 'AIzaSyTestKey12345';
    const encrypted = encrypt(text);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(text);
    expect(encrypted).toContain(':');

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should return empty string for empty inputs', () => {
    expect(encrypt('')).toBe('');
    expect(decrypt('')).toBe('');
  });

  it('should throw an error for malformed cipher texts', () => {
    expect(() => decrypt('malformed-pattern-without-colon')).toThrow();
  });
});
