import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Hazy",
  description: "Terms of Service for hazy.tech link-in-bio gaming identity cards.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 4, 2026">
      <LegalSection title="1. Agreement to Terms">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of
          hazy.tech and related services (the &quot;Service&quot;) operated by Hazy
          (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an account,
          authenticating with Discord, or otherwise using the Service, you agree to be
          bound by these Terms. If you do not agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. Account Creation via Discord OAuth">
        <p>
          Accounts on Hazy are created and authenticated exclusively through Discord
          OAuth. By signing in, you authorize us to receive and store public Discord
          profile information necessary to operate your account, including your Discord
          user ID, username, display name, and avatar. You are responsible for
          maintaining the security of your Discord account and for all activity that
          occurs under your Hazy profile.
        </p>
        <p>
          You must be at least 13 years of age (or the minimum digital consent age in
          your jurisdiction) to use the Service. If you are under 18, you represent that
          you have parental or guardian consent to accept these Terms.
        </p>
      </LegalSection>

      <LegalSection title="3. Profiles, Vanity URLs, and Badges">
        <p>
          When you claim a username, you receive a vanity profile URL on hazy.tech.
          Usernames, vanity URLs, Pro badges, cosmetic badges, and similar identity
          features are licensed for your personal use on the Service and are not your
          property. They are non-transferable and may not be sold, traded, gifted,
          rented, or otherwise assigned to another person or account without our prior
          written consent.
        </p>
        <p>
          We reserve the right to reclaim, rename, or disable usernames that infringe
          trademarks, impersonate others, violate these Terms, or are otherwise
          inappropriate. Inactive or abandoned vanity URLs may be released at our
          discretion.
        </p>
      </LegalSection>

      <LegalSection title="4. Pro Subscriptions and Billing via Stripe">
        <p>
          Hazy Pro and other paid features are billed through Stripe. By purchasing a
          subscription, you authorize Stripe to charge your selected payment method on a
          recurring basis according to the plan you choose until you cancel. Prices,
          features, and billing intervals are described on our Pricing page and may
          change with notice.
        </p>
        <p>
          Subscriptions renew automatically unless canceled before the end of the
          current billing period. You can manage or cancel through the billing portal or
          by contacting{" "}
          <a
            href="mailto:support@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            support@hazy.tech
          </a>
          . Except where required by law, fees are non-refundable once a billing period
          has begun. Chargebacks initiated without first contacting support may result
          in suspension of Pro features or your account.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable Use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc space-y-2 pl-5 text-white/60">
          <li>Harass, threaten, dox, or abuse other users or third parties</li>
          <li>
            Upload, embed, or distribute malicious scripts, malware, phishing pages, or
            exploit kits
          </li>
          <li>
            Host or link to illegal materials, including child sexual abuse material,
            stolen credentials, or content that facilitates criminal activity
          </li>
          <li>Impersonate another person, brand, or entity in a deceptive manner</li>
          <li>
            Attempt unauthorized access to Hazy systems, other accounts, or related
            infrastructure
          </li>
          <li>
            Scrape, overload, or interfere with the Service in ways that degrade
            availability for others
          </li>
        </ul>
        <p>
          We may remove content, revoke badges or vanity URLs, or suspend accounts that
          violate this policy, with or without prior notice.
        </p>
      </LegalSection>

      <LegalSection title="6. User Content">
        <p>
          You retain ownership of content you submit to your profile (links, text,
          media, guestbook posts you author, and similar materials). You grant Hazy a
          worldwide, non-exclusive, royalty-free license to host, display, and
          distribute that content solely as needed to operate and promote the Service.
          You represent that you have the rights necessary to grant this license and that
          your content does not infringe third-party rights.
        </p>
      </LegalSection>

      <LegalSection title="7. Termination">
        <p>
          You may stop using the Service at any time. You may request account deletion
          by contacting{" "}
          <a
            href="mailto:support@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            support@hazy.tech
          </a>
          . We may suspend or terminate your access immediately if you breach these
          Terms, if required by law, or if continued operation of your account creates
          risk to Hazy, other users, or third parties.
        </p>
        <p>
          Upon termination, your right to use the Service ends. Vanity URLs, badges, and
          Pro entitlements associated with the account may be revoked. Provisions that
          by their nature should survive (including ownership disclaimers, limitation of
          liability, and indemnity) will survive termination.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers and Limitation of Liability">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
          WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY
          LAW, HAZY IS NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, DATA, OR GOODWILL ARISING FROM
          YOUR USE OF THE SERVICE.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          We may update these Terms from time to time. Material changes will be
          reflected by updating the &quot;Last updated&quot; date on this page. Continued
          use of the Service after changes become effective constitutes acceptance of
          the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these Terms may be sent to{" "}
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
