import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Privacy · ChapterKin",
  description: "How ChapterKin collects, uses, and deletes family data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy policy">
      <p className="text-sm text-muted">Last updated September 8, 2026.</p>
      <p>
        ChapterKin is a parent-operated family account for personalized bedtime
        stories. Children never create their own login.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">What we collect</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>The parent&apos;s name, email, and password hash.</li>
        <li>
          Family details you type in: children&apos;s names, ages, boy or girl,
          how they look, people and pets in the household, and tonight&apos;s
          story prompts.
        </li>
        <li>Stories we generate, including page text and illustrations.</li>
        <li>
          Billing records from Stripe when you subscribe on the website. We do
          not store full card numbers.
        </li>
        <li>Basic product analytics, such as that a story was created or read.</li>
      </ul>
      <h2 className="pt-4 font-serif text-2xl text-navy">Photos</h2>
      <p>
        You may use a photo once to help draw a child. That photo is sent only
        for that drawing request. We do not keep the parent photo in our
        database or file storage. The storybook drawings we create from it are
        stored so later stories can stay consistent.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">How we use data</h2>
      <p>
        We use this information to run your account, write and illustrate
        stories, count monthly story allowance, send account email (confirmation
        and password reset), and keep the product working. We do not sell family
        data.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">How long we keep it</h2>
      <p>
        Stories expire 60 days after they were last read, then we delete them.
        Account data stays until you delete the account. You can delete a child
        profile or the whole parent account from Settings on the website or in
        the ChapterKin app.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">Processors</h2>
      <p>
        We use hosting, database, email, and (on the website) payment providers
        to operate ChapterKin. The iOS and Android apps sign in to the same
        ChapterKin account. Buying a plan happens on the website, not inside the
        app.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">Contact</h2>
      <p>
        Questions:{" "}
        <a className="font-semibold text-accent" href="mailto:hello@chapterkin.com">
          hello@chapterkin.com
        </a>
        . See also our{" "}
        <a className="font-semibold text-accent" href="/support">
          support page
        </a>
        .
      </p>
    </LegalShell>
  );
}
