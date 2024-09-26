import { describe, it, expect, beforeEach } from 'vitest';
import { JwtManagerService } from '../jwt-manager-service';
import { JwtService } from '@nestjs/jwt';
import { mockDeep, MockProxy } from 'vitest-mock-extended';

describe('JwtManagerService', () => {
  let jwtManagerService: JwtManagerService;
  let jwtService: MockProxy<JwtService>;

  beforeEach(() => {
    jwtService = mockDeep<JwtService>();
    jwtManagerService = new JwtManagerService(jwtService);

    jwtManagerService.secretKey = 'test-secret-key';
    jwtManagerService.privateKey = 'test-private-key';
    jwtManagerService.publicKey = 'test-public-key';
    jwtManagerService.passphase = 'test-passphrase';
  });

  describe('encode', () => {
    it('should call jwtService.sign with correct parameters', () => {
      const payload = { id: 1, name: 'Test User' };

      jwtManagerService.encode(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload, {
        secret: 'test-secret-key',
        privateKey: {
          key: 'test-private-key',
          passphrase: 'test-passphrase',
        },
        algorithm: 'HS256',
        mutatePayload: false,
        expiresIn: '1h',
        encoding: 'utf-8',
      });
    });

    it('should return a signed JWT token', () => {
      const payload = { id: 1 };
      const signedToken = 'signed.jwt.token';
      jwtService.sign.mockReturnValue(signedToken);

      const result = jwtManagerService.encode(payload);

      expect(result).toBe(signedToken);
    });
  });

  describe('verify', () => {
    it('should call jwtService.verify with correct parameters', () => {
      const token = 'some.jwt.token';

      jwtManagerService.verify(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'test-secret-key',
        publicKey: 'test-public-key',
        algorithms: ['HS256'],
      });
    });

    it('should return the decoded token', () => {
      const token = 'some.jwt.token';
      const decodedToken = { id: 1, name: 'Test User' };
      jwtService.verify.mockReturnValue(decodedToken);

      const result = jwtManagerService.verify(token);

      expect(result).toEqual(decodedToken);
    });

    it('should throw an error for invalid tokens', () => {
      const invalidToken = 'invalid.jwt.token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => jwtManagerService.verify(invalidToken)).toThrowError('Invalid token');
    });
  });
});
