import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Service — BlindSide",
  description:
    "BlindSide Terms of Service: Platform usage guidelines, campus eligibility, wallet refund guarantees, conduct standards, and offline date liability limitations.",
};

export default function TermsOfServicePage() {
  return (
    <article className={styles.docContent}>
      {/* Header */}
      <header className={styles.docHeader}>
        <div className={styles.docTag}>Legally Binding Agreement</div>
        <h1 className={styles.docTitle}>Terms of Service</h1>
        <p className={styles.docSubtitle}>
          Please read these terms carefully before creating an account or using BlindSide. They define your rights, responsibilities, and key safety obligations.
        </p>
        <div className={styles.docMetaBar}>
          <span className={styles.docMetaItem}>
            <strong>Last Updated:</strong> November 20, 2026
          </span>
          <span className={styles.docMetaItem}>
            <strong>Governing Law:</strong> Republic of India
          </span>
          <span className={styles.docMetaItem}>
            <strong>Forum:</strong> Gurugram / New Delhi
          </span>
        </div>
      </header>

      {/* 1. Acceptance */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>1</span>
          Acceptance of Terms
        </h2>
        <div className={styles.prose}>
          <p>
            By accessing <code>blindside.in</code>, registering an account, or interacting with our mobile and web applications, you agree to be bound by these <strong>Terms of Service</strong> (&quot;Terms&quot;) and our Privacy Policy. If you do not accept all of these terms without reservation, do not access or use the platform.
          </p>
        </div>
      </section>

      {/* 2. Eligibility & Verification */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>2</span>
          Eligibility &amp; Campus Verification
        </h2>
        <div className={styles.prose}>
          <p>To use BlindSide, you represent and warrant that you fulfill all of the following requirements:</p>
          <ul>
            <li>You are at least <strong>18 years of age</strong> at the time of registration.</li>
            <li>You are an actively enrolled university student, faculty member, or verified affiliate possessing a valid, authentic educational email domain (e.g. <code>.edu</code>, <code>.edu.in</code>, <code>.ac.in</code>).</li>
            <li>You have never been convicted of a violent felony, sexual offense, or harassment crime, and are not registered on any sex offender registry.</li>
            <li>You will create and maintain strictly <strong>one personal account</strong>. Synthetic profiles, automated bots, shared logins, or fraudulent registrations are strictly prohibited and result in permanent platform revocation.</li>
          </ul>
        </div>
      </section>

      {/* 3. Code of Conduct */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>3</span>
          Code of Conduct &amp; Zero Tolerance Policy
        </h2>
        <div className={styles.prose}>
          <p>BlindSide fosters a respectful, wholesome dating environment. You agree that you will <strong>never</strong> engage in any of the following prohibited behaviors:</p>
          <ul>
            <li><strong>Harassment &amp; Threats:</strong> Harassing, stalking, intimidating, defaming, bullying, or threatening any other user in chats or offline.</li>
            <li><strong>Unsolicited Explicit Content:</strong> Sending obscene remarks, unsolicited sexually explicit messages, non-consensual images, or extortionate content.</li>
            <li><strong>Impersonation &amp; Deception:</strong> Creating fake accounts, using another student&apos;s identity or college email, or misleading users regarding your age or gender.</li>
            <li><strong>Financial Exploitation:</strong> Asking for money, loans, UPI transfers, donations, crypto investments, or promoting commercial services.</li>
            <li><strong>Scraping &amp; Hacking:</strong> Employing automated crawlers, scrapers, API reverse engineering, or exploiting security loopholes.</li>
          </ul>

          <div className={`${styles.noticeBox} ${styles.noticeWarning}`}>
            <div className={`${styles.noticeHeader} ${styles.noticeHeaderWarning}`}>
              ⚠️ Sanctions for Non-Compliance
            </div>
            <p className={styles.noticeText}>
              Any violation of this Code of Conduct will trigger immediate suspension or permanent banning of your account, forfeiture of all wallet credits, device hardware blacklisting, and where necessary, formal disclosure to campus disciplinary committees and law enforcement.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Matching, Wallets & Financial Terms */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>4</span>
          Matching, Wallets &amp; Financial Terms
        </h2>
        <div className={styles.prose}>
          <ul>
            <li>
              <strong>Match Request Fee:</strong> Initiating an active blind match search requires a flat matching fee (deducted from your in-app wallet balance or paid directly via UPI/cards).
            </li>
            <li>
              <strong>100% Refund Guarantee:</strong> If our matching engine is unable to pair you with a compatible candidate within our 7-day search window, your match fee is <strong>100% automatically refunded back to your BlindSide Wallet</strong>.
            </li>
            <li>
              <strong>Promotional Credits &amp; Gift Drops:</strong> Promotional credits (such as ₹69 registration drops, referral perks, or marketing drops) are non-cash utility credits. They cannot be transferred between accounts, exchanged for fiat cash, or withdrawn to bank accounts.
            </li>
            <li>
              <strong>Payment Gateway:</strong> All financial transactions are processed securely through Razorpay. BlindSide does not handle or store card numbers or UPI PINs.
            </li>
          </ul>
        </div>
      </section>

      {/* 5. In-Person Meetup & Date Disclaimer */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>5</span>
          In-Person Meetup &amp; Offline Date Disclaimer
        </h2>
        <div className={styles.prose}>
          <div className={styles.noticeBox}>
            <div className={`${styles.noticeHeader} ${styles.noticeHeaderPrimary}`}>
              🛡️ Assumption of Risk &amp; Limitation of Liability
            </div>
            <p className={styles.noticeText}>
              <strong>BlindSide is an online intermediary facilitator, NOT a security agency, chaperone, or criminal background investigation service.</strong> Choosing to meet another user in person is solely your voluntary, personal decision. You agree to schedule dates strictly in public, crowded, well-lit spaces (such as busy cafes or campus hubs), arrange your own transport, and exercise personal caution. To the maximum extent permitted by applicable law, BlindSide disclaims all liability for any bodily injury, distress, loss, or property damage resulting from offline interactions.
            </p>
          </div>
          <p>
            Please review our <strong>Security Guidelines</strong> for our 6 Golden Rules before meeting anyone offline.
          </p>
        </div>
      </section>

      {/* 6. Moderation & Audit Rights */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>6</span>
          Moderation &amp; Safety Audit Rights
        </h2>
        <div className={styles.prose}>
          <p>
            While your 48-hour chats are private between you and your match, you explicitly agree that BlindSide administrators retain the legal right to review chat logs, date proposals, and report details if either participant submits a safety report or policy complaint. This audit power exists exclusively to protect students from abuse and uphold campus safety.
          </p>
        </div>
      </section>

      {/* 7. Intellectual Property */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>7</span>
          Intellectual Property
        </h2>
        <div className={styles.prose}>
          <p>
            The BlindSide brand, eye logo, website architecture, matching algorithms, animations, and graphic designs are the proprietary intellectual property of BlindSide. Users are granted a limited, personal, non-transferable, revocable license to access the application for individual social matchmaking purposes.
          </p>
        </div>
      </section>

      {/* 8. Disclaimer of Warranties */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>8</span>
          Disclaimer of Warranties
        </h2>
        <div className={styles.prose}>
          <p>
            The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. We do not guarantee that you will always receive a match, that matches will lead to romantic outcomes, or that the service will operate without temporary server disruptions.
          </p>
        </div>
      </section>

      {/* 9. Indemnification */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>9</span>
          Indemnification
        </h2>
        <div className={styles.prose}>
          <p>
            You agree to defend, indemnify, and hold harmless BlindSide, its founders, directors, employees, and contractors against any third-party claims, legal damages, or expenses arising from your violation of these Terms, your offline conduct, or your violation of the rights of another student.
          </p>
        </div>
      </section>

      {/* 10. Governing Law & Dispute Resolution */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>10</span>
          Governing Law &amp; Dispute Resolution
        </h2>
        <div className={styles.prose}>
          <p>
            These Terms are governed by and construed in accordance with the substantive laws of <strong>India</strong>. Any legal dispute, arbitration, or proceeding arising under or in relation to these Terms shall be subject to the exclusive jurisdiction of the competent civil courts situated in <strong>Gurugram / New Delhi, India</strong>.
          </p>
        </div>
      </section>
    </article>
  );
}
