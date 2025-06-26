export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  status: "success" | "failed";
  message: string;
  error: string | null;
  data: User | null;
}

export interface LoginResponse {
  status: "success" | "failed";
  message: string;
  error: string | null;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  } | null;
}

export interface OTPResponse {
  status: "success" | "failed";
  message: string;
  error: string | null;
  data: {
    otpSent: boolean;
    expiresIn: number;
  } | null;
}

export interface VerifyOTPResponse {
  status: "success" | "failed";
  message: string;
  error: string | null;
  data: {
    verified: boolean;
  } | null;
}

export interface SignupData {
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  otp: string;
}

export interface LoginData {
  email?: string;
  phone?: string;
  otp: string;
}

export interface OTPRequest {
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  sendOTP: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
}
