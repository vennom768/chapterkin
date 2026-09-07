import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;
  return (
    <AuthShell
      title="Welcome back"
      description={
        reset
          ? "Your password is updated. Sign in with the new one."
          : "Sign in to your parent account."
      }
    >
      <Suspense>
        <AuthForm mode="sign-in" />
      </Suspense>
    </AuthShell>
  );
}
