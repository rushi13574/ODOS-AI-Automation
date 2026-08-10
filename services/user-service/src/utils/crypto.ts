import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size in bytes

function getEncryptionKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const key = Buffer.from(hexKey, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte (64 hex characters) hex string.');
  }
  return key;
}

/**
 * Encrypts a string using AES-256-CBC.
 * Returns IV and encrypted data in format "ivHex:encryptedHex".
 */
export function encrypt(text: string): string {
  if (!text) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a cipher string format "ivHex:encryptedHex" using AES-256-CBC.
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Malformed encrypted text pattern.');
  }
  const iv = Buffer.from(parts[0]!, 'hex');
  const encrypted = parts[1]!;
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
