export interface UserAccountDataType {
  email: string;
  username: string;
  avatar: string;
  createdAt: Date;
  isVerified: boolean;
  provider: string;
  lastLoginAt?: Date;
}

export interface LoginInfo {
  email: string;
  signupTimestamp: number;
  loginCount: number;
  lastSessionTimestamp: number;
}
