import Link from "next/link";
import { Card } from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 block text-center font-serif text-3xl text-navy"
        >
          ChapterKin
        </Link>
        <Card>
          <h1 className="font-serif text-2xl text-navy">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-muted">{description}</p>
          {children}
        </Card>
      </div>
    </div>
  );
}
