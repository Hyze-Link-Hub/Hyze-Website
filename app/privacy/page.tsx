import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Hazy",
  description: "Privacy Policy for hazy.tech, including Discord data, PostHog analytics, and Stripe payments.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 4, 2026">
      <LegalSection title="1. Overview">
        <p>
          This Privacy Policy explains how Hazy (&quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;) collects, uses, and shares information when you use
          hazy.tech and related services (the &quot;Service&quot;). By using the
          Service, you acknowledge the practices described here.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p className="font-medium text-white/80">Discord account data</p>
        <p>
          When you sign in with Discord OAuth, we collect public Discord user data
          required to create and operate your profile, including your Discord user ID,
          username, global display name (where available), and avatar URL. We do not
          receive or store your Discord password.
        </p>
        <p className="font-medium text-white/80">Profile and usage content</p>
        <p>
          We store information you provide on Hazy, such as your vanity username, bio,
          links, appearance settings, badges, guestbook entries, and integration
          preferences.
        </p>
        <p className="font-medium text-white/80">Site usage telemetry (PostHog)</p>
        <p>
          We use PostHog to understand how the Service is used. This may include pages
          viewed, feature interactions, device/browser metadata, approximate location
          derived from IP address, and similar product analytics events. Telemetry helps
          us improve reliability, performance, and product design.
        </p>
        <p className="font-medium text-white/80">Payment data (Stripe)</p>
        <p>
          Paid subscriptions are processed by Stripe. Stripe collects and processes
          payment details according to its own privacy policy. Hazy does not store
          complete cardholder secrets (such as full card numbers or CVV) on our servers.
          We may retain billing metadata from Stripe, including customer ID,
          subscription status, plan type, and invoice history, to manage Pro access.
        </p>
      </LegalSection>

      <LegalSection title="3. How We Use Information">
        <ul className="list-disc space-y-2 pl-5 text-white/60">
          <li>Authenticate accounts and render public or private profile experiences</li>
          <li>Provide Pro subscriptions, badges, and billing-related features</li>
          <li>Monitor abuse, security incidents, and Terms of Service violations</li>
          <li>Analyze product usage via PostHog to improve the Service</li>
          <li>Respond to support, legal, and business inquiries</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How We Share Information">
        <p>
          We share information with service providers that help us operate Hazy,
          including Discord (authentication), Stripe (payments), PostHog (analytics),
          and hosting/infrastructure vendors. We may also disclose information if
          required by law, to protect rights and safety, or in connection with a merger,
          acquisition, or asset transfer. We do not sell personal information.
        </p>
        <p>
          Public profile content you choose to publish (username, avatar, links, and
          similar fields) is visible to visitors of your Hazy page.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <p>
          We retain account and profile data for as long as your account remains active
          and as needed to provide the Service. Analytics events and billing records may
          be retained for legitimate business, security, and legal purposes according to
          applicable retention schedules.
        </p>
      </LegalSection>

      <LegalSection title="6. GDPR and CCPA Rights">
        <p>
          Depending on your location, you may have rights to access, correct, export, or
          delete personal information we hold about you, and to object to or restrict
          certain processing. California residents may also have rights under the CCPA,
          including the right to know what personal information is collected and to
          request deletion.
        </p>
        <p>
          To submit an access or deletion request, email{" "}
          <a
            href="mailto:support@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            support@hazy.tech
          </a>{" "}
          from the Discord-linked email associated with your account (or include enough
          detail for us to verify ownership). We will respond within the timeframe
          required by applicable law. Account deletion requests permanently remove your
          Hazy profile, vanity URL claim, and associated user content, subject to
          limited records we must retain for legal or billing compliance.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We implement reasonable technical and organizational measures to protect
          personal information. No method of transmission or storage is completely
          secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="8. Children's Privacy">
        <p>
          The Service is not directed to children under 13 (or the equivalent minimum
          age in your jurisdiction). We do not knowingly collect personal information
          from children below that age. If you believe a child has provided us data,
          contact{" "}
          <a
            href="mailto:support@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            support@hazy.tech
          </a>{" "}
          and we will take appropriate steps to delete it.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          We may update this Privacy Policy periodically. The &quot;Last updated&quot;
          date at the top of this page will change when revisions are published.
          Continued use of the Service after an update constitutes acknowledgment of the
          revised policy.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Privacy questions and data requests:{" "}
          <a
            href="mailto:support@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            support@hazy.tech
          </a>
          . Legal correspondence:{" "}
          <a
            href="mailto:legal@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            legal@hazy.tech
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
