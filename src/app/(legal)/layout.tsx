import React from "react";
import Link from "next/link";
import EyeLogo from "@/components/EyeLogo";
import LegalNav from "./LegalNav";
import styles from "./legal.module.css";

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.legalPageWrapper}>
      <div className={styles.legalAmbient} aria-hidden="true" />

      {/* Top Navbar */}
      <header className={styles.legalNavHeader}>
        <div className={styles.legalNavInner}>
          <Link href="/" className={styles.legalBrandLink} id="legal-home-link">
            <EyeLogo width={22} height={22} animated={false} />
            <span>BlindSide</span>
          </Link>

          <div className={styles.legalNavActions}>
            <Link href="/" className={styles.tabBtn} style={{ fontSize: "0.8rem" }}>
              ← Return Home
            </Link>
            <Link href="/auth" className={styles.enterBtn} id="legal-enter-btn">
              Enter BlindSide
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.legalMain}>
        <LegalNav />
        {children}

        {/* Global Support Card */}
        <section className={styles.supportBanner} aria-label="Contact Legal Support">
          <div className={styles.supportBannerContent}>
            <h3>Have Questions or Safety Inquiries?</h3>
            <p>
              Our legal, compliance, and user safety team is available to assist students, campus authorities, and law enforcement.
            </p>
          </div>
          <a
            href="mailto:support@blindside.in"
            className={styles.supportMailBtn}
            id="legal-support-mail-btn"
          >
            <MailIcon />
            <span>Contact support@blindside.in</span>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.legalFooter}>
        <div className={styles.legalFooterInner}>
          <div className={styles.legalFooterBrand}>
            <span>BlindSide</span>
            <span className={styles.legalFooterCopy}>
              &copy; {new Date().getFullYear()} BlindSide. All rights reserved.
            </span>
          </div>

          <div className={styles.legalFooterLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/security">Security Guidelines</Link>
            <a
              href="mailto:support@blindside.in"
              className={styles.footerSupportBadge}
            >
              <MailIcon /> Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
