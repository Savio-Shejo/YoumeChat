export const AUTH_CONSTANTS = {
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  DEFAULT_ROLE: 'User',
  MOCK_TOKEN_PREFIX: 'mock_token_',
  SESSION_REVOKED_MESSAGE: 'Session revoked successfully',
  LOGOUT_ALL_MESSAGE: 'Logged out from all devices successfully',
} as const;
