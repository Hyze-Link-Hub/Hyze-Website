import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Copyright Policy — Hazy",
  description: "DMCA takedown procedures and trademark disclaimers for hazy.tech.",
};

export default function CopyrightPage() {
  return (
    <LegalPage title="Copyright & DMCA Policy" updated="October 4, 2026">
      <LegalSection title="1. Respect for Intellectual Property">
        <p>
          Hazy respects the intellectual property rights of others and expects users of
          hazy.tech (the &quot;Service&quot;) to do the same. This Copyright Policy
          describes how we respond to claims of copyright infringement under the Digital
          Millennium Copyright Act, 17 U.S.C. § 512 (&quot;DMCA&quot;), and related
          trademark concerns.
        </p>
      </LegalSection>

      <LegalSection title="2. DMCA Notice of Claimed Infringement">
        <p>
          If you believe that material available on or through the Service infringes
          your copyright, you may submit a notification pursuant to 17 U.S.C. § 512(c)
          by sending a written notice to our designated copyright agent at:
        </p>
        <p>
          <a
            href="mailto:legal@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            legal@hazy.tech
          </a>
        </p>
        <p>Your DMCA notice must include substantially the following:</p>
        <ul className="list-disc space-y-2 pl-5 text-white/60">
          <li>
            A physical or electronic signature of the copyright owner or a person
            authorized to act on their behalf
          </li>
          <li>
            Identification of the copyrighted work claimed to have been infringed (or a
            representative list if multiple works are covered by a single notice)
          </li>
          <li>
            Identification of the material that is claimed to be infringing, and
            information reasonably sufficient to permit Hazy to locate the material
            (including the relevant hazy.tech URL)
          </li>
          <li>
            Your contact information, including name, mailing address, telephone number,
            and email address
          </li>
          <li>
            A statement that you have a good-faith belief that use of the material in
            the manner complained of is not authorized by the copyright owner, its
            agent, or the law
          </li>
          <li>
            A statement that the information in the notification is accurate, and under
            penalty of perjury, that you are authorized to act on behalf of the owner of
            an exclusive right that is allegedly infringed
          </li>
        </ul>
        <p>
          Upon receipt of a compliant notice under 17 U.S.C. § 512(c), we will take
          appropriate action in our discretion, which may include removing or disabling
          access to the allegedly infringing material and notifying the user who posted
          it.
        </p>
      </LegalSection>

      <LegalSection title="3. Counter-Notification">
        <p>
          If you believe material you posted was removed or disabled as a result of
          mistake or misidentification, you may send a counter-notification to{" "}
          <a
            href="mailto:legal@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            legal@hazy.tech
          </a>{" "}
          that includes:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-white/60">
          <li>Your physical or electronic signature</li>
          <li>
            Identification of the material that was removed or disabled and the location
            where it appeared before removal
          </li>
          <li>
            A statement under penalty of perjury that you have a good-faith belief the
            material was removed or disabled as a result of mistake or misidentification
          </li>
          <li>
            Your name, address, and telephone number, and a statement that you consent to
            the jurisdiction of the Federal District Court for the judicial district in
            which your address is located (or any judicial district in which Hazy may be
            found if outside the United States), and that you will accept service of
            process from the person who provided the original DMCA notice
          </li>
        </ul>
        <p>
          After a valid counter-notification, we may restore the material unless the
          original complainant files an action seeking a court order against you.
        </p>
      </LegalSection>

      <LegalSection title="4. Repeat Infringers">
        <p>
          In appropriate circumstances, Hazy will terminate accounts of users who are
          determined to be repeat infringers of copyright or related rights.
        </p>
      </LegalSection>

      <LegalSection title="5. Trademark Disclaimers">
        <p>
          Hazy is an independent platform and is not affiliated with, endorsed by, or
          sponsored by the following companies or their affiliates, except where
          expressly stated. All trademarks, service marks, logos, and trade names
          referenced on the Service belong to their respective owners:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-white/60">
          <li>
            Epic Games, Fortnite, Unreal Engine, and related marks are trademarks or
            registered trademarks of Epic Games, Inc.
          </li>
          <li>
            Riot Games, League of Legends, VALORANT, and related marks are trademarks or
            registered trademarks of Riot Games, Inc.
          </li>
          <li>
            Discord and the Discord logo are trademarks or registered trademarks of
            Discord Inc.
          </li>
          <li>
            Valve, Steam, Counter-Strike, Dota, and related marks are trademarks or
            registered trademarks of Valve Corporation.
          </li>
        </ul>
        <p>
          Any use of third-party trademarks on Hazy is for descriptive or referential
          purposes only and does not imply partnership or endorsement. Users who upload
          or display third-party branding on their profiles are solely responsible for
          ensuring they have the rights to do so.
        </p>
      </LegalSection>

      <LegalSection title="6. Hazy Brand Assets">
        <p>
          The Hazy name, logo, and related brand assets are owned by Hazy. You may not
          use them in a way that suggests endorsement, sponsorship, or affiliation
          without our prior written permission.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Copyright and trademark notices should be sent to{" "}
          <a
            href="mailto:legal@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            legal@hazy.tech
          </a>
          . General support remains available at{" "}
          <a
            href="mailto:support@hazy.tech"
            className="text-brand-glow underline-offset-2 hover:underline"
          >
            support@hazy.tech
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
