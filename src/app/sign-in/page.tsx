import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 block text-center font-serif text-3xl text-navy">
          Chapterkin
        </Link>
        <Card>
          <h1 className="font-serif text-2xl text-navy">Welcome back</h1>
          <p className="mb-6 mt-1 text-sm text-muted">
            Sign in to your parent account.
          </p>
          <AuthForm mode="sign-in" />
        </Card>
      </div>
    </div>
  );
}
