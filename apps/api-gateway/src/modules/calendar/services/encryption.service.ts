import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 32;
  private readonly tagLength = 16;
  private readonly keyLength = 32; // 256 bits

  constructor(private configService: ConfigService) {}

  /**
   * Encrypt a string using AES-256-GCM
   * Returns: base64(salt:iv:authTag:encryptedData)
   */
  async encrypt(plaintext: string): Promise<string> {
    try {
      // Generate random salt and IV
      const salt = randomBytes(this.saltLength);
      const iv = randomBytes(this.ivLength);

      // Derive key from encryption secret using scrypt
      const encryptionSecret = this.configService.get<string>('ENCRYPTION_SECRET') || 'default-secret-change-in-production';
      const key = (await scryptAsync(encryptionSecret, salt, this.keyLength)) as Buffer;

      // Create cipher
      const cipher = createCipheriv(this.algorithm, key, iv);

      // Encrypt the plaintext
      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
      ]);

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      // Combine salt, iv, authTag, and encrypted data
      const result = Buffer.concat([salt, iv, authTag, encrypted]);

      return result.toString('base64');
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt a string encrypted with encrypt()
   */
  async decrypt(ciphertext: string): Promise<string> {
    try {
      // Decode from base64
      const buffer = Buffer.from(ciphertext, 'base64');

      // Extract components
      const salt = buffer.subarray(0, this.saltLength);
      const iv = buffer.subarray(this.saltLength, this.saltLength + this.ivLength);
      const authTag = buffer.subarray(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.tagLength
      );
      const encrypted = buffer.subarray(this.saltLength + this.ivLength + this.tagLength);

      // Derive key from encryption secret using scrypt
      const encryptionSecret = this.configService.get<string>('ENCRYPTION_SECRET') || 'default-secret-change-in-production';
      const key = (await scryptAsync(encryptionSecret, salt, this.keyLength)) as Buffer;

      // Create decipher
      const decipher = createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt the ciphertext
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate a secure random string (useful for state parameters)
   */
  generateSecureRandom(length: number = 32): string {
    return randomBytes(length).toString('base64url');
  }
}
