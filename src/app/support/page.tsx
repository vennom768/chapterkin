import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Support · ChapterKin",
  description: "Get help with your ChapterKin family account or app.",
};

export default function SupportPage() {
  return (
    <LegalShell title="Support">
      <p>
        ChapterKin is a parent account for bedtime stories. Email us and we will
        help with sign-in, plans, drawings, or the iPad app.
      </p>
      <p>
        <a
          className="inline-flex min-h-11 items-center font-semibold text-accent"
          href="mailto:hello@chapterkin.com"
        >
          hello@chapterkin.com
        </a>
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">Common questions</h2>
      <p>
        <strong>I created an account but cannot write a story.</strong> Choose a
        plan on the website first. The app unlocks generate after that plan is
        active.
      </p>
      <p>
        <strong>I used a photo of my child.</strong> We use it only to draw that
        batch. We do not keep the photo.
      </p>
      <p>
        <strong>I want the account gone.</strong> Open Settings on the website or
        in the app and delete the account. That removes the family and stored
        stories.
      </p>
      <p>
        More:{" "}
        <a className="font-semibold text-accent" href="/privacy">
          Privacy
        </a>
        {" · "}
        <a className="font-semibold text-accent" href="/terms">
          Terms
        </a>
        {" · "}
        <a className="font-semibold text-accent" href="/pricing">
          Pricing
        </a>
      </p>
    </LegalShell>
  );
}
