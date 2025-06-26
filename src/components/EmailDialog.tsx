import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { EmailRequest } from "@/types";

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId?: string;
  reportType?: "summary" | "insights";
  documentName?: string;
  onEmailSent?: () => void;
}

const EmailDialog = ({
  open,
  onOpenChange,
  reportId,
  reportType,
  documentName,
  onEmailSent,
}: EmailDialogProps) => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(
    `${reportType === "summary" ? "Summary" : "Key Insights"} Report - ${documentName || "Document"}`,
  );
  const [message, setMessage] = useState(
    `Please find attached the ${reportType === "summary" ? "summary" : "key insights"} report for the document${documentName ? ` "${documentName}"` : ""}.`,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!email.trim() || !reportId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.sendReportByEmail(reportId, {
        to: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (response.status === "success") {
        setSuccess(true);
        onEmailSent?.();

        // Auto-close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(response.error || response.message || "Failed to send email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSubject(
      `${reportType === "summary" ? "Summary" : "Key Insights"} Report - ${documentName || "Document"}`,
    );
    setMessage(
      `Please find attached the ${reportType === "summary" ? "summary" : "key insights"} report for the document${documentName ? ` "${documentName}"` : ""}.`,
    );
    setSuccess(false);
    setError(null);
    setIsLoading(false);
    onOpenChange(false);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Report via Email
          </DialogTitle>
          <DialogDescription>
            Share the {reportType === "summary" ? "summary" : "key insights"}{" "}
            report via email
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-300">
                Email sent successfully! The report has been delivered to{" "}
                {email}.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!email.trim() || !isValidEmail(email) || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;
