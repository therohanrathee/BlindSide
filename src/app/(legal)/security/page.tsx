import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Security Guidelines & Safety Policy — BlindSide",
  description:
    "BlindSide Community Safety & Security Policy: Technical encryption safeguards, the 6 Golden Rules for offline blind dates, and swift incident response protocols.",
};

const GOLDEN_RULES = [
  {
    num: "1",
    title: "Always Meet in Public Spaces",
    desc: "Pick a busy campus cafe, college food court, or popular restaurant with high foot traffic. Never agree to meet in secluded areas, dark alleys, parked vehicles, or private residences for a first date.",
  },
  {
    num: "2",
    title: "Arrange Your Own Independent Transport",
    desc: "Arrive and leave on your own terms. Do not allow your date to pick you up from your home, hostel, or dorm room on the first meetup. Maintaining independent transit ensures you can leave whenever you wish.",
  },
  {
    num: "3",
    title: "Inform a Roommate or Trusted Friend",
    desc: "Before heading out, tell a close friend or roommate where you are going, who you are meeting, and what time you expect to return. Consider sharing your live location with them via your phone.",
  },
  {
    num: "4",
    title: "Guard Your Financial & Identification Details",
    desc: "Never reveal your UPI PINs, bank account numbers, hostel room number, or passwords. BlindSide will never ask for financial credentials or personal deposits. If anyone asks for money or loans, report them immediately.",
  },
  {
    num: "5",
    title: "Keep Early Communications on BlindSide",
    desc: "Resist the urge to prematurely move to WhatsApp, Instagram, or Telegram before meeting in person. Our in-app 48-hour chat protects your personal phone number until you have confirmed mutual chemistry.",
  },
  {
    num: "6",
    title: "Trust Your Intuition & Leave Anytime",
    desc: "If at any point you feel uncomfortable, pressured, or unsafe, end the date immediately and walk away into a populated area. You do not owe anyone your time, politeness, or an explanation.",
  },
];

export default function SecurityGuidelinesPage() {
  return (
    <article className={styles.docContent}>
      {/* Header */}
      <header className={styles.docHeader}>
        <div className={styles.docTag}>Community Safety &amp; Trust</div>
        <h1 className={styles.docTitle}>Security Guidelines</h1>
        <p className={styles.docSubtitle}>
          Your safety is our highest priority. Here is how we secure our infrastructure, alongside essential protocols for meeting blind matches in the real world.
        </p>
        <div className={styles.docMetaBar}>
          <span className={styles.docMetaItem}>
            <strong>Last Updated:</strong> November 20, 2026
          </span>
          <span className={styles.docMetaItem}>
            <strong>Protection Standard:</strong> Enterprise TLS 1.3 &amp; AES-256
          </span>
          <span className={styles.docMetaItem}>
            <strong>Emergency Help:</strong> support@blindside.in
          </span>
        </div>
      </header>

      {/* 1. Technical Platform Controls */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>1</span>
          Platform Technical Security Controls
        </h2>
        <div className={styles.prose}>
          <p>We deploy rigorous technical safeguards across our backend and frontend infrastructure:</p>
          <ul>
            <li>
              <strong>Zero Plaintext Passwords:</strong> Passwords are cryptographically salted and hashed using industry-standard bcrypt. We never store or transmit plaintext passwords.
            </li>
            <li>
              <strong>Database Row Level Security (RLS):</strong> Direct database access is locked down. Strict RLS policies prevent unauthorized queries, ensuring no user can view private metadata or unrevealed photos of other students.
            </li>
            <li>
              <strong>Encrypted Data Volumes:</strong> All data is encrypted in transit using TLS 1.3 and at rest with AES-256 storage standards.
            </li>
            <li>
              <strong>Ephemeral 48-Hour Lifecycle:</strong> Blind chat sessions expire automatically after 48 hours, eliminating lingering message logs on active device caches.
            </li>
          </ul>
        </div>
      </section>

      {/* 2. The 6 Golden Rules */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>2</span>
          The 6 Golden Rules for Real-World Blind Dates
        </h2>
        <div className={styles.prose}>
          <p>
            When transitioning from an in-app blind conversation to an in-person campus date, always adhere strictly to these six safety practices:
          </p>

          <div className={styles.rulesGrid}>
            {GOLDEN_RULES.map((rule) => (
              <div key={rule.num} className={styles.ruleCard}>
                <div className={styles.ruleNumber}>{rule.num}</div>
                <div className={styles.ruleBody}>
                  <h4>{rule.title}</h4>
                  <p>{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Incident Reporting & Response */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.sectionNumber}>3</span>
          How to Report a User &amp; Emergency Escalation
        </h2>
        <div className={styles.prose}>
          <p>
            BlindSide takes an uncompromising approach to misconduct. If you experience harassment, aggressive remarks, offensive content, no-shows, or feel threatened:
          </p>

          <ol>
            <li>
              <strong>Tap &quot;Report User&quot;:</strong> Available directly within the chat header or match management view.
            </li>
            <li>
              <strong>Select Violation Reason:</strong> Choose the appropriate category (Harassment, Inappropriate Content, Impersonation, Suspicious Behavior) and provide details.
            </li>
            <li>
              <strong>Swift Audit &amp; Enforcement:</strong> Our safety team audits reported transcripts within 24 hours. The offending user is immediately blocked from contacting you, and upon review, permanently expelled across all campus networks.
            </li>
            <li>
              <strong>Law Enforcement Cooperation:</strong> If an incident involves illegal physical threats, violence, or stalking, BlindSide cooperates fully with police authorities and campus security.
            </li>
          </ol>

          <div className={`${styles.noticeBox} ${styles.noticeSecurity}`}>
            <div className={`${styles.noticeHeader} ${styles.noticeHeaderSecurity}`}>
              🔒 Immediate Campus Assistance
            </div>
            <p className={styles.noticeText}>
              For urgent safety assistance or to flag an immediate concern, email our designated safety desk directly at <strong>support@blindside.in</strong> with the subject line <code>[URGENT SAFETY REPORT]</code> for high-priority response.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
