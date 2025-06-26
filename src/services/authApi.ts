import {
  AuthResponse,
  LoginResponse,
  OTPResponse,
  VerifyOTPResponse,
  SignupData,
  LoginData,
  OTPRequest,
} from "@/types/auth";

const BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080/api";

class AuthApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async sendOTP(email: string): Promise<OTPResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Send OTP error:", error);
      return {
        status: "failed",
        message: "Failed to send OTP. Please try again.",
        error: error instanceof Error ? error.message : "Network error",
        data: null,
      };
    }
  }

  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Verify OTP error:", error);
      return {
        status: "failed",
        message: "Failed to verify OTP. Please try again.",
        error: error instanceof Error ? error.message : "Network error",
        data: null,
      };
    }
  }

  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Signup error:", error);
      return {
        status: "failed",
        message: "Failed to create account. Please try again.",
        error: error instanceof Error ? error.message : "Network error",
        data: null,
      };
    }
  }

  async login(loginData: LoginData): Promise<LoginResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Store tokens if login successful
      if (data.status === "success" && data.data) {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      return {
        status: "failed",
        message: "Failed to login. Please try again.",
        error: error instanceof Error ? error.message : "Network error",
        data: null,
      };
    }
  }

  async refreshToken(): Promise<{ accessToken: string } | null> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && data.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
        return { accessToken: data.data.accessToken };
      }

      return null;
    } catch (error) {
      console.error("Refresh token error:", error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  getCurrentUser(): any {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }
}

export const authApiService = new AuthApiService();
