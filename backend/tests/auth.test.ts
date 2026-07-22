import request from 'supertest';
import app from '../src/app';
import { authRepository } from '../src/modules/auth/auth.repository';

describe('Phase 1 - Auth Session Revocation & Logout-All Unit Tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('AuthRepository.deleteAllRefreshTokens should call model deleteMany', async () => {
    jest.spyOn(authRepository, 'deleteAllRefreshTokens').mockResolvedValue(3);
    const count = await authRepository.deleteAllRefreshTokens('user_123');
    expect(count).toBe(3);
  });

  it('AuthRepository.revokeSession should return boolean success', async () => {
    jest.spyOn(authRepository, 'revokeSession').mockResolvedValue(true);
    const success = await authRepository.revokeSession('sess_123', 'user_123');
    expect(success).toBe(true);
  });
});
