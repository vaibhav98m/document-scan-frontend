import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType, SignupData, LoginData } from "@/types/auth";
import { authApiService } from "@/services/authApi";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const initAuth = () => {
      const currentUser = authApiService.getCurrentUser();
      const isAuth = authApiService.isAuthenticated();

      if (isAuth && currentUser) {
        setUser(currentUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const sendOTP = async (email: string): Promise<boolean> => {
    try {
      const response = await authApiService.sendOTP(email);

      if (response.status === "success") {
        toast.success(response.message || "OTP sent successfully!");
        return true;
      } else {
        toast.error(response.message || "Failed to send OTP");
        return false;
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await authApiService.verifyOTP(email, otp);

      if (response.status === "success" && response.data?.verified) {
        toast.success("OTP verified successfully!");
        return true;
      } else {
        toast.error(response.message || "Invalid OTP");
        return false;
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
      return false;
    }
  };

  const signup = async (signupData: SignupData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApiService.signup(signupData);

      if (response.status === "success" && response.data) {
        setUser(response.data);
        toast.success(response.message || "Account created successfully!");
      } else {
        throw new Error(response.message || "Signup failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginData: LoginData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApiService.login(loginData);

      if (response.status === "success" && response.data) {
        setUser(response.data.user);
        toast.success(response.message || "Logged in successfully!");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApiService.logout();
    setUser(null);
    toast.success("Logged out successfully!");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    sendOTP,
    verifyOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
