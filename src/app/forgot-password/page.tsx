import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter the email for your parent account. If it exists, we will send a reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
