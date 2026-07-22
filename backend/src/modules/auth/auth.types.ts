export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface FirebaseUserInfo {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}
