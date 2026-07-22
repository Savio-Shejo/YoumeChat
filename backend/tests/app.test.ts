import request from 'supertest';
import app from '../src/app';
import { userRepository } from '../src/modules/users/user.repository';
import { RefreshToken } from '../src/modules/auth/refreshToken.model';

describe('YoumeChat API Server Health and Auth Endpoints', () => {
  beforeAll(() => {
    jest.spyOn(userRepository, 'findByFirebaseUid').mockImplementation(async (uid: string) => null);
    jest.spyOn(userRepository, 'findByUsername').mockImplementation(async () => null);

    jest.spyOn(userRepository, 'create').mockImplementation(async (data: any) => {
      return {
        _id: '60f1b2c3d4e5f6a7b8c9d0e1' as any,
        ...data,
        role: 'User',
        isBanned: false,
      } as any;
    });

    jest.spyOn(RefreshToken, 'create').mockImplementation(async (data: any) => {
      return { _id: '60f1b2c3d4e5f6a7b8c9d0e2', ...data } as any;
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('GET /health should return 200 OK with server operational status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data.environment).toBeDefined();
  });

  it('POST /api/v1/auth/google-login should handle test mock tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google-login')
      .send({ idToken: 'mock_token_unit_test_user_123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('tokens');
    expect(res.body.data.tokens).toHaveProperty('accessToken');
    expect(res.body.data.tokens).toHaveProperty('refreshToken');
  });

  it('GET /api/v1/unknown-route should return 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-404');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
