import { CheckEmailForm } from "@/components/check-email-form";
import { AuthShell } from "@/components/auth-shell";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <AuthShell
      title="Check your email"
      description="Confirm the address, then finish your plan. Stories start after payment."
    >
      <CheckEmailForm email={email} />
    </AuthShell>
  );
}
