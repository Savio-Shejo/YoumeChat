export interface GoogleLoginDto {
  idToken: string;
  deviceId?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken: string;
}

export interface RevokeSessionDto {
  sessionId: string;
}
