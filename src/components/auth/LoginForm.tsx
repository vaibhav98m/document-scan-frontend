import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  LogIn,
  X,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "@/contexts/AuthContext";
import { useOTPTimer } from "@/hooks/useOTPTimer";
import { LoginData } from "@/types/auth";

interface LoginFormProps {
  onBack: () => void;
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onBack, onClose }) => {
  const { login, sendOTP, verifyOTP, isLoading } = useAuth();

  // Form state
  const [loginType, setLoginType] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer hook
  const { timeLeft, isActive, start: startTimer, canResend } = useOTPTimer(120);

  // Validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return phone.length >= 10;
  };

  const getLoginIdentifier = () => {
    return loginType === "email" ? email : phone;
  };

  const isFormValid = () => {
    if (loginType === "email") {
      return email.trim() && isValidEmail(email);
    }
    return phone.trim() && isValidPhone(phone);
  };

  const handleSendOTP = async () => {
    const identifier = getLoginIdentifier();

    if (loginType === "email" && !isValidEmail(identifier)) {
      setError("Please enter a valid email address");
      return;
    }

    if (loginType === "phone" && !isValidPhone(identifier)) {
      setError("Please enter a valid phone number");
      return;
    }

    setError(null);

    // For now, we'll send OTP to email (as the API endpoint shown was for email)
    // You can extend this to handle phone OTP if you have a separate endpoint
    const emailToSend =
      loginType === "email" ? identifier : `${identifier}@temp.com`;
    const success = await sendOTP(emailToSend);

    if (success) {
      setOtpSent(true);
      startTimer();
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    setError(null);

    try {
      const identifier = getLoginIdentifier();
      const emailToVerify =
        loginType === "email" ? identifier : `${identifier}@temp.com`;
      const verified = await verifyOTP(emailToVerify, otp);

      if (verified) {
        setOtpVerified(true);
      }
    } catch (err) {
      setError("Failed to verify OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogin = async () => {
    if (!otpVerified) {
      setError("Please verify your OTP first");
      return;
    }

    const loginData: LoginData = {
      otp: otp,
    };

    if (loginType === "email") {
      loginData.email = email;
    } else {
      loginData.phone = phone;
    }

    try {
      await login(loginData);
    } catch (err) {
      // Error is handled in the context
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="text-center space-y-2 relative">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute left-4 top-4"
            title="Back to welcome"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-4 top-4"
              title="Close and go to home"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Welcome Back
        </CardTitle>
        <p className="text-slate-600 dark:text-slate-400">
          Sign in to continue analyzing your documents
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Login Type Selection */}
        <Tabs
          value={loginType}
          onValueChange={(value) => {
            setLoginType(value as "email" | "phone");
            setError(null);
            setOtpSent(false);
            setOtpVerified(false);
            setOtp("");
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-slate-700 dark:text-slate-300"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading || otpSent}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-slate-700 dark:text-slate-300"
              >
                Phone Number
              </Label>
              <div className="phone-input-container">
                <PhoneInput
                  country={"in"}
                  value={phone}
                  onChange={(phone) => {
                    setPhone(phone);
                    setError(null);
                  }}
                  disabled={isLoading || otpSent}
                  inputStyle={{
                    width: "100%",
                    height: "40px",
                    fontSize: "14px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    paddingLeft: "48px",
                  }}
                  containerStyle={{
                    width: "100%",
                  }}
                  buttonStyle={{
                    borderRadius: "6px 0 0 6px",
                    border: "1px solid #e2e8f0",
                    borderRight: "none",
                    backgroundColor: "#f8fafc",
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* OTP Section */}
        {!otpSent ? (
          <Button
            onClick={handleSendOTP}
            disabled={!isFormValid() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            Send Login OTP
          </Button>
        ) : (
          <div className="space-y-4">
            {/* OTP Status */}
            <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                OTP sent to {getLoginIdentifier()}
                {isActive && (
                  <Badge variant="outline" className="ml-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(timeLeft)}
                  </Badge>
                )}
              </AlertDescription>
            </Alert>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-slate-700 dark:text-slate-300"
              >
                Enter 6-Digit OTP
              </Label>
              <div className="flex gap-2">
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                    setError(null);
                  }}
                  disabled={isLoading || otpVerified}
                  className="flex-1"
                  maxLength={6}
                />
                {!otpVerified ? (
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6 || isVerifyingOtp}
                    variant="outline"
                    className="shrink-0"
                  >
                    {isVerifyingOtp ? (
                      <div className="w-4 h-4 animate-spin border-2 border-purple-600 border-t-transparent rounded-full" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Resend OTP */}
            {canResend && (
              <Button
                onClick={handleSendOTP}
                variant="link"
                className="w-full text-purple-600 hover:text-purple-700 dark:text-purple-400"
                disabled={isLoading}
              >
                Resend OTP
              </Button>
            )}

            {/* OTP Verified Status */}
            {otpVerified && (
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  OTP verified successfully! You can now sign in.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          disabled={!otpVerified || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
              Signing In...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </>
          )}
        </Button>

        {/* Signup Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Button
              variant="link"
              onClick={onBack}
              className="p-0 h-auto text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              Create one now
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
