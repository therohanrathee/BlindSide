import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — BlindSide",
  description:
    "BlindSide Privacy Policy: Transparent data practices, encrypted communications, private-by-default chats, and complete right-to-be-forgotten deletion under India DPDP Act 2023.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className={styles.docContent}>
      {/* Header */}
      <header className={styles.docHeader}>
        <div className={styles.docTag}>DPDP Act 2023 & IT Act 2000 Compliant</div>
        <h1 className={styles.docTitle}>Privacy Policy</h1>
        <p className={styles.docSubtitle}>
          We believe intimacy and romance require discretion. BlindSide is engineered so you retain absolute ownership over your identity, private chats, and personal data.
        </p>
        <div className={styles.docMetaBar}>
          <span className={styles.docMetaItem}>
            <strong>Last Updated:</strong> November 20, 2026
          </span>
          <span className={styles.docMetaItem}>
            <strong>Jurisdiction:</strong> Republic of India
          </span>
          <span className={styles.docMetaItem}>
            <strong>Status:</strong> Legally Active
          </span>
        </div>
      </header>

      {/* 1. Introduction */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>1</span>
          Introduction
        </h2>
        <div className={styles.prose}>
          <p>
            Welcome to <strong>BlindSide</strong> (&quot;BlindSide&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), accessible via <code>blindside.in</code> and associated progressive web applications. BlindSide is a privacy-first, campus-focused social discovery and blind-dating platform designed exclusively for verified college and university students.
          </p>
          <p>
            We respect your privacy and are committed to protecting your personal data. This Privacy Policy details what data we collect, why we collect it, how it is safeguarded, and your rights under applicable privacy legislation, including the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, and the <strong>Digital Personal Data Protection Act (DPDP), 2023</strong> of India.
          </p>
        </div>
      </section>

      {/* 2. Information We Collect */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>2</span>
          Information We Collect
        </h2>
        <div className={styles.prose}>
          <p>We only collect data strictly necessary to provide and secure our matchmaking, verification, and communication services:</p>
          <ul>
            <li>
              <strong>Authentication &amp; Identity Data:</strong> Primary Login Email (e.g., personal Gmail or Outlook) used for account credentials and password resets; Institutional University Email (e.g., <code>@krmu.edu.in</code>) used exclusively to verify active university student affiliation; and cryptographically salted, hashed passwords (via bcrypt). We never store or have access to raw passwords.
            </li>
            <li>
              <strong>Profile &amp; Lifestyle Information:</strong> First name, date of birth (used strictly for 18+ age verification), gender, height preferences, dietary choices, drinking/smoking habits, fitness level, hobbies, and relationship intent. Profile photographs are stored in private, restricted cloud storage and remain unrevealed to other users by default.
            </li>
            <li>
              <strong>Location Information:</strong> Exact device coordinates (latitude and longitude acquired with explicit device/browser permission) or approximate location derived from your network IP. Location data is used <em>strictly</em> to calculate mutual proximity distances using the Haversine formula. <strong>We never display, broadcast, or share your exact GPS coordinates, address, or live location with any other user.</strong>
            </li>
            <li>
              <strong>Communications &amp; Messages:</strong> Text messages exchanged within the 48-hour blind chat window, and date proposals (proposed meetup date, time, public venue name, and Google Maps URL).
            </li>
            <li>
              <strong>Transactional &amp; Payment Data:</strong> Wallet balances, promotional credit records, and Razorpay order/payment identifiers. <strong>We do not store your credit card numbers, debit card details, UPI PINs, or net banking passwords.</strong> All payments are processed through Razorpay (a PCI-DSS Level 1 certified gateway).
            </li>
            <li>
              <strong>Technical &amp; Log Data:</strong> IP addresses, browser user-agent, operating system, and push notification tokens required for delivering chat alerts and date updates.
            </li>
          </ul>
        </div>
      </section>

      {/* 3. How We Use Your Information */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>3</span>
          How We Use Your Information
        </h2>
        <div className={styles.prose}>
          <p>We process your data exclusively for the following lawful purposes:</p>
          <ul>
            <li><strong>Core Matchmaking:</strong> Running our matching algorithm based on your specified gender preferences, mutual values, interests, and location radius.</li>
            <li><strong>Campus Verification:</strong> Validating that every member belongs to an authentic, accredited educational institution using campus email OTP verification.</li>
            <li><strong>Transactional Communications:</strong> Sending essential account emails (login codes, password recovery, credit drop alerts, and date confirmations) via authorized delivery partners.</li>
            <li><strong>Community Safety &amp; Anti-Fraud:</strong> Detecting and mitigating fake accounts, bots, harassment, impersonation, hate speech, and fraudulent transactions.</li>
          </ul>
        </div>
      </section>

      {/* 4. Privacy by Design: Our Default Protections */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>4</span>
          Privacy by Design: Our Default Protections
        </h2>
        <div className={styles.prose}>
          <p>Unlike conventional dating platforms, BlindSide is built with privacy as the default state:</p>
          <ul>
            <li>
              <strong>Blind Mode by Default:</strong> Your profile photos and full name are completely hidden from other users during discovery and initial chatting. Other users only see your first name, age, college name, and shared lifestyle interests. Photos and identities are only revealed when <em>both</em> participants grant mutual consent.
            </li>
            <li>
              <strong>No Public Directories:</strong> BlindSide maintains no searchable public user directory, browse gallery, or social feed. Strangers cannot search for you, view your profile, or know that you are registered on the platform.
            </li>
            <li>
              <strong>Zero Commercial Data Selling:</strong> We <strong>never</strong> sell, rent, monetize, or trade your personal data, profile information, or chat transcripts to third-party data brokers, analytics firms, or advertisers.
            </li>
          </ul>
        </div>
      </section>

      {/* 5. Chat Privacy & Moderation Auditing Disclosures */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>5</span>
          Chat Privacy &amp; Moderation Auditing Disclosures
        </h2>
        <div className={styles.prose}>
          <p>
            Your 48-hour blind conversations are private communications between you and your matched partner. BlindSide does not intercept, read, or sell personal conversations in the normal course of business.
          </p>

          <div className={styles.noticeBox}>
            <div className={`${styles.noticeHeader} ${styles.noticeHeaderPrimary}`}>
              🛡️ Critical Safety &amp; Incident Audit Disclosure
            </div>
            <p className={styles.noticeText}>
              To safeguard students against harassment, threats, non-consensual explicit material, hate speech, stalking, or extortion: <strong>If a user submits an official Report or safety flag regarding an ongoing or expired match, authorized BlindSide human administrators reserve the right to review the reported chat transcript and associated date proposals.</strong> Access is strictly restricted to investigating the reported violation and taking necessary safety action (such as account bans, device blacklisting, or referral to campus authorities/law enforcement).
            </p>
          </div>

          <p>
            By using BlindSide, you acknowledge and consent to this conditional safety audit protocol, which is required under Indian Intermediary Rules (2021) to maintain a secure environment for all participants.
          </p>
        </div>
      </section>

      {/* 6. Data Storage & Security Standards */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>6</span>
          Data Storage &amp; Security Standards
        </h2>
        <div className={styles.prose}>
          <p>We deploy defense-in-depth security measures to protect your digital assets:</p>
          <ul>
            <li><strong>Encryption in Transit:</strong> All data exchanged between your browser and our servers is secured with TLS 1.3 encryption over HTTPS.</li>
            <li><strong>Encryption at Rest:</strong> Database tables, storage volumes, and user backups are encrypted using AES-256 standard encryption.</li>
            <li><strong>Database Row-Level Security (RLS):</strong> Granular Postgres RLS policies ensure users can never query another user&apos;s private coordinates, sensitive metadata, or unrevealed photos directly.</li>
            <li><strong>Administrative Access:</strong> Internal database operations are restricted to authorized engineers via hardware keys, multi-factor authentication (MFA), and audited logs.</li>
          </ul>
        </div>
      </section>

      {/* 7. Data Retention & The Right to Complete Deletion */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>7</span>
          Data Retention &amp; The Right to Complete Deletion
        </h2>
        <div className={styles.prose}>
          <p>
            Under the Digital Personal Data Protection Act (DPDP), 2023, you have the unconditional <strong>Right to be Forgotten</strong>:
          </p>
          <ul>
            <li><strong>Instant Self-Serve Deletion:</strong> You can permanently delete your account at any time directly within your account settings, or by emailing <code>support@blindside.in</code>.</li>
            <li><strong>Complete Cascade Wipe:</strong> Upon deletion, our systems immediately and permanently wipe:
              <ol>
                <li>Your profile details, bio, photos, and files from storage buckets.</li>
                <li>All active search requests, queues, and past match histories.</li>
                <li>All chat transcripts, proposal logs, and message records.</li>
                <li>All post-date ratings and feedback entries.</li>
                <li>Your wallet balance records and authentication credentials.</li>
              </ol>
            </li>
            <li><strong>Zero Residual Footprint:</strong> Zero residual personal data remains on active databases. If you register again in the future, you will be onboarded as a completely new user.</li>
          </ul>
        </div>
      </section>

      {/* 8. Third-Party Infrastructure Providers */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>8</span>
          Third-Party Infrastructure Providers
        </h2>
        <div className={styles.prose}>
          <p>We collaborate with industry-leading infrastructure partners bound by strict data processing agreements:</p>
          <div className={styles.partnerGrid}>
            <div className={styles.partnerCard}>
              <div className={styles.partnerName}>Supabase Inc.</div>
              <div className={styles.partnerRole}>Encrypted PostgreSQL database, Row Level Security, and private asset storage.</div>
            </div>
            <div className={styles.partnerCard}>
              <div className={styles.partnerName}>Vercel Inc.</div>
              <div className={styles.partnerRole}>Global serverless edge hosting and zero-downtime deployment infrastructure.</div>
            </div>
            <div className={styles.partnerCard}>
              <div className={styles.partnerName}>Razorpay Software Pvt Ltd</div>
              <div className={styles.partnerRole}>PCI-DSS Level 1 compliant payment processing for credits and wallet recharge.</div>
            </div>
            <div className={styles.partnerCard}>
              <div className={styles.partnerName}>Resend Inc.</div>
              <div className={styles.partnerRole}>Encrypted transactional email delivery for OTP codes and account alerts.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Age Restriction */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>9</span>
          Age Restriction (Strict 18+ Policy)
        </h2>
        <div className={styles.prose}>
          <div className={`${styles.noticeBox} ${styles.noticeWarning}`}>
            <div className={`${styles.noticeHeader} ${styles.noticeHeaderWarning}`}>
              ⚠️ Adults Only (18+)
            </div>
            <p className={styles.noticeText}>
              BlindSide is exclusively for individuals who are <strong>at least 18 years of age</strong> and actively enrolled in an accredited higher education institution. We do not knowingly collect personal data from minors. Any profile discovered to belong to an individual under 18 will be permanently deleted immediately without notice.
            </p>
          </div>
        </div>
      </section>

      {/* 10. Grievance Officer */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>10</span>
          Grievance Officer &amp; Statutory Disclosures
        </h2>
        <div className={styles.prose}>
          <p>
            In accordance with the Information Technology Act, 2000 and the Intermediary Guidelines (2021), the details of the Grievance Officer for BlindSide are as follows:
          </p>
          <ul>
            <li><strong>Officer Title:</strong> Legal &amp; Grievance Officer, BlindSide</li>
            <li><strong>Official Email:</strong> <code>support@blindside.in</code> / <code>grievance@blindside.in</code></li>
            <li><strong>Physical Location:</strong> Delhi NCR, Republic of India</li>
            <li><strong>Response Timelines:</strong> Acknowledgment within 24 hours; resolution within 15 days as mandated by applicable statutory rules.</li>
          </ul>
        </div>
      </section>
    </article>
  );
}
