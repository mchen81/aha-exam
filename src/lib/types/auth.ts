export interface LoginResult {
  email: string;
  username: string;
  avatar: string;
  sessionToken: string;
  provider: string;
  isVerified: boolean;
}
