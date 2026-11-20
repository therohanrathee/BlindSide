"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./legal.module.css";

const LEGAL_TABS = [
  { href: "/privacy", label: "Privacy Policy", icon: "🛡️" },
  { href: "/terms", label: "Terms of Service", icon: "📜" },
  { href: "/security", label: "Security Guidelines", icon: "🔒" },
];

export default function LegalNav() {
  const pathname = usePathname();

  return (
    <div className={styles.tabNavWrapper}>
      <nav className={styles.tabNav} aria-label="Legal document selection">
        {LEGAL_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
