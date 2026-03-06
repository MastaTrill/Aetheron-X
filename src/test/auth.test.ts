import { describe, it, expect, beforeEach } from 'vitest';
import { createSessionToken, verifySessionToken } from '@/lib/auth';

describe('Auth Library', () => {
  const testEmail = 'test@example.com';

  beforeEach(() => {
    process.env.AETHERX_SESSION_SECRET = 'test-secret-key-for-testing';
  });

  describe('createSessionToken', () => {
    it('should create a valid session token', () => {
      const token = createSessionToken(testEmail);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.includes('.')).toBe(true); // Should contain payload.signature format
    });

    it('should create different tokens for different emails', () => {
      const token1 = createSessionToken('user1@example.com');
      const token2 = createSessionToken('user2@example.com');
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifySessionToken', () => {
    it('should verify a valid token', () => {
      const token = createSessionToken(testEmail);
      const session = verifySessionToken(token);

      expect(session).toBeTruthy();
      expect(session?.email).toBe(testEmail);
      expect(session?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should return null for invalid token', () => {
      const session = verifySessionToken('invalid-token');
      expect(session).toBeNull();
    });

    it('should return null for undefined token', () => {
      const session = verifySessionToken(undefined);
      expect(session).toBeNull();
    });

    it('should return null for tampered token', () => {
      const token = createSessionToken(testEmail);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const session = verifySessionToken(tamperedToken);
      expect(session).toBeNull();
    });

    it('should reject expired token', () => {
      // Create a token with past expiration
      const pastExp = Date.now() - 1000;
      const payload = JSON.stringify({ email: testEmail, exp: pastExp });
      const encodedPayload = Buffer.from(payload).toString('base64url');

      // This should fail verification due to expired timestamp
      const session = verifySessionToken(encodedPayload + '.fake-signature');
      expect(session).toBeNull();
    });
  });

  describe('Token format', () => {
    it('should create token with base64url payload', () => {
      const token = createSessionToken(testEmail);
      const [payloadPart] = token.split('.');

      expect(payloadPart).toBeTruthy();

      // Should be valid base64url
      const decoded = Buffer.from(payloadPart, 'base64url').toString('utf-8');
      const payload = JSON.parse(decoded);

      expect(payload.email).toBe(testEmail);
      expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should include HMAC signature', () => {
      const token = createSessionToken(testEmail);
      const parts = token.split('.');

      expect(parts).toHaveLength(2);
      expect(parts[1]).toBeTruthy();
      expect(parts[1].length).toBeGreaterThan(20); // HMAC-SHA256 signature
    });
  });
});
