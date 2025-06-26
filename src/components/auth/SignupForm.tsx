import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  User,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  X,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "@/contexts/AuthContext";
import { useOTPTimer } from "@/hooks/useOTPTimer";
import { SignupData } from "@/types/auth";

interface SignupFormProps {
  onBack: () => void;
  onClose?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onBack, onClose }) => {
  const { signup, sendOTP, verifyOTP, isLoading } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });

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

  const isFormValid = () => {
    return (
      formData.firstname.trim() &&
      formData.lastname.trim() &&
      formData.email.trim() &&
      isValidEmail(formData.email)
    );
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSendOTP = async () => {
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    const success = await sendOTP(formData.email);

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
      const verified = await verifyOTP(formData.email, otp);
      if (verified) {
        setOtpVerified(true);
      }
    } catch (err) {
      setError("Failed to verify OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSignup = async () => {
    if (!otpVerified) {
      setError("Please verify your OTP first");
      return;
    }

    const signupData: SignupData = {
      email: formData.email,
      firstname: formData.firstname,
      lastname: formData.lastname,
      phone: formData.phone,
      otp: otp,
    };

    try {
      await signup(signupData);
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
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Create Account
        </CardTitle>
        <p className="text-slate-600 dark:text-slate-400">
          Join us to start analyzing your documents with AI
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstname"
                className="text-slate-700 dark:text-slate-300"
              >
                First Name *
              </Label>
              <Input
                id="firstname"
                type="text"
                placeholder="John"
                value={formData.firstname}
                onChange={(e) => handleInputChange("firstname", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastname"
                className="text-slate-700 dark:text-slate-300"
              >
                Last Name *
              </Label>
              <Input
                id="lastname"
                type="text"
                placeholder="Doe"
                value={formData.lastname}
                onChange={(e) => handleInputChange("lastname", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-slate-700 dark:text-slate-300"
            >
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading || otpSent}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-slate-700 dark:text-slate-300"
            >
              Phone Number (Optional)
            </Label>
            <div className="phone-input-container">
              <PhoneInput
                country={"in"}
                value={formData.phone}
                onChange={(phone) => handleInputChange("phone", phone)}
                disabled={isLoading}
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
        </div>

        {/* OTP Section */}
        {!otpSent ? (
          <Button
            onClick={handleSendOTP}
            disabled={!isFormValid() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send OTP to Email
          </Button>
        ) : (
          <div className="space-y-4">
            {/* OTP Status */}
            <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                OTP sent to {formData.email}
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
                Enter 6-Digit OTP *
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
                  Email verified successfully! You can now create your account.
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

        {/* Signup Button */}
        <Button
          onClick={handleSignup}
          disabled={!otpVerified || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
              Creating Account...
            </>
          ) : (
            <>
              <User className="w-4 h-4 mr-2" />
              Create Account
            </>
          )}
        </Button>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Button
              variant="link"
              onClick={onBack}
              className="p-0 h-auto text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              Sign in instead
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
