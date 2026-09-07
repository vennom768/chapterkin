import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 block text-center font-serif text-3xl text-navy">
          Chapterkin
        </Link>
        <Card>
          <h1 className="font-serif text-2xl text-navy">Create a family account</h1>
          <p className="mb-6 mt-1 text-sm text-muted">
            Parents sign in. After that you&apos;ll add the kids, then pick who
            tonight&apos;s story is for.
          </p>
          <AuthForm mode="sign-up" />
        </Card>
      </div>
    </div>
  );
}
