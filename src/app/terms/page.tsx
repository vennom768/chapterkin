import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Terms · ChapterKin",
  description: "Terms of use for ChapterKin website and apps.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of use">
      <p className="text-sm text-muted">Last updated September 8, 2026.</p>
      <p>
        These terms cover the ChapterKin website and the ChapterKin iOS and
        Android apps. By creating an account you agree to them.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">The service</h2>
      <p>
        ChapterKin writes personalized bedtime stories for children you add to a
        family account. You must be a parent or caregiver. Children do not sign
        in. You are responsible for the names, details, and prompts you submit.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">Plans and billing</h2>
      <p>
        Writing new stories requires an active plan or a tester promo. Plans are
        sold on the website. The mobile apps do not sell subscriptions. Website
        subscriptions are billed by Stripe and can be canceled from Billing.
        Unused monthly stories do not roll over unless we say otherwise.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">Stories and drawings</h2>
      <p>
        Generated stories and drawings are for your family&apos;s personal use.
        Stories expire 60 days after the last read. Share links are for people
        you choose; do not post them publicly if you want them private. We may
        refuse or remove prompts that are unsafe for children.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">Accounts</h2>
      <p>
        Keep your password to yourself. You can delete your account in Settings
        on the website or in the app. Deleting the account removes the family
        profiles and remaining stories we still store.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">The apps</h2>
      <p>
        The apps talk to chapterkin.com with your signed-in account. Features
        that take payment (plans, extra drawing packs, page revisions) stay on
        the website. Apple and Google are not parties to these terms.
      </p>
      <h2 className="pt-4 font-serif text-2xl text-navy">Contact</h2>
      <p>
        <a className="font-semibold text-accent" href="mailto:hello@chapterkin.com">
          hello@chapterkin.com
        </a>
      </p>
    </LegalShell>
  );
}
