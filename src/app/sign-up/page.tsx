import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create a family account"
      description="Parents sign in. We will email you a confirmation link, then you add the kids and pick who tonight's story is for."
    >
      <Suspense>
        <AuthForm mode="sign-up" />
      </Suspense>
    </AuthShell>
  );
}
