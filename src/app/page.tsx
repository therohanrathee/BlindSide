"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SplashLoader from "@/components/SplashLoader";
import s from "./page.module.css";
import EyeLogo from "@/components/EyeLogo";
import JourneyPath from "@/components/JourneyPath";
import AnonymousNodes from "@/components/AnonymousNodes";

/* ============================================
   LINE-ART SVG ICONS (Serene, minimal)
   ============================================ */
function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  );
}

function MessageSquareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error);
        }
        if (session?.user) {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Failed to check auth session:", err);
      }
    };
    checkUser();
  }, [router]);

  // Remove splash loader once client is hydrated and layout is settled
  useEffect(() => {
    // A small delay ensures the browser has painted the heavy DOM tree
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Removed envelopeOpen state as it's no longer used
  const [chatStage, setChatStage] = useState(0);

  const journeyFlowRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Monitor scroll for navbar transitions
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for step reveal (once visible, stays visible)
  // OPTIMIZATION: Use direct DOM manipulation to avoid re-rendering the whole page
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((step, i) => {
      if (!step) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            step.classList.add(s.stepVisible);
            setVisibleSteps((prev) => {
              if (prev.has(i)) return prev;
              const next = new Set(prev);
              next.add(i);
              return next;
            });
            observer.disconnect(); // Stop observing once visible
          }
        },
        { threshold: 0.15 } // Trigger slightly earlier on mobile
      );
      observer.observe(step);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Auto-advancing simulated chat (triggers when step 3 becomes visible)
  useEffect(() => {
    if (visibleSteps.has(2)) {
      const interval = setInterval(() => {
        setChatStage((prev) => (prev < 3 ? prev + 1 : 0));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [visibleSteps]);

  const handleEyeClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/auth");
    }, 800);
  };

  const steps = [
    {
      num: "01",
      title: "Verify Identity",
      subtitle: "University Verification",
      desc: "Confirm your status with a valid university email. A single OTP verification ensures all profiles are active, authenticated students from your specific campus network.",
    },
    {
      num: "02",
      title: "Set Scope & Match",
      subtitle: "Personality First",
      desc: "Request a match to begin. Our algorithm analyzes core values, interests, and lifestyle intent to pair you with high-compatibility candidates.",
    },
    {
      num: "03",
      title: "Chat Blind",
      subtitle: "Focus on Dialogue",
      desc: "A secure chat window opens for 48 hours. You are in complete control of your privacy. Choose to reveal your name or photo only when you feel comfortable, or remain totally anonymous.",
    },
    {
      num: "04",
      title: "Plan the Date",
      subtitle: "Seamless Coordination",
      desc: "If the vibe is right, coordinate your meeting directly in-app. Once mutually confirmed, instantly add the event to your calendar and get directions via Google Maps.",
    },
  ];

  return (
    <>
      <SplashLoader className={!isPageLoading ? s.splashHidden : ""} />

      <div className={`${s.landing} ${isPageLoading ? s.noScroll : ""}`}>
        {/* Background Ambience */}
      <div className={s.ambientBg} aria-hidden="true">
        <div className={s.aurora} />
      </div>

      {/* ---- Navigation ---- */}
      <nav className={`${s.navbar} ${scrolled ? s.navbarScrolled : ""}`} role="navigation" aria-label="Main navigation">
        <div className={s.navbarInner}>
          <Link href="/" className={s.logo} id="nav-logo">
            <EyeLogo className={s.logoEye} width={24} height={24} animated={true} />
            BlindSide
          </Link>
          <div className={s.navActions}>
            <Link href="/auth" className="btn btn-secondary btn-pill" id="nav-enter">
              Enter BlindSide
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- Hero Section ---- */}
      <section className={s.hero} id="hero">
        <AnonymousNodes />
        <div className={s.heroContent}>
          <div className={s.heroPills}>
            <span className={s.heroPill}>No Swiping</span>
            <span className={s.heroPill}>Anonymous First</span>
            <span className={s.heroPill}>Campus Verified</span>
          </div>
          <h1 className={s.heroTitle}>
            Connect in the dark.
            <br />
            <span className={s.heroTitleSecondary}>Meet in the light.</span>
          </h1>
          <p className={s.heroSubtitle}>
            A verified platform exclusively for university students. <br className={s.mobileHidden} />Converse anonymously, build genuine chemistry, and reveal your identity only when you're ready.
          </p>

          <div 
            className={`${s.heroEyeContainer} ${isTransitioning ? s.eyeTransitioning : ""}`}
            onClick={handleEyeClick}
            role="button"
            tabIndex={0}
          >
            <EyeLogo className={s.heroEye} width={96} height={96} animated={!isTransitioning} />
            <span className={s.eyeHint}>Enter the blindside</span>
          </div>

          {/* Simple organic divider */}
          <div className={s.heroScrollNote}>
            <span className={s.scrollText}>Scroll to explore</span>
            <div className={s.scrollDot} />
          </div>
        </div>
      </section>

      {/* ---- The Journey (Scroll-Driven Flow) ---- */}
      <section className={s.journeySection} id="how-it-works">
        <div className={s.sectionHeader}>
          <span className={s.sectionTag}>The Experience</span>
          <h2 className={s.sectionTitle}>The Blind Match Journey</h2>
          <p className={s.sectionSubtitle}>
            We strip away superficial judgment to let authentic compatibility guide your first meeting.
          </p>
        </div>

        <div className={s.journeyFlow} ref={journeyFlowRef}>
          {/* SVG path drawn on scroll (desktop only — CSS line on mobile) */}
          <JourneyPath containerRef={journeyFlowRef} stepRefs={stepRefs} />

          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className={`${s.journeyStep} ${i % 2 === 0 ? s.stepLeft : s.stepRight}`}
            >
              {/* Mobile-only node dot (replaces SVG nodes on small screens) */}
              <div className={s.mobileNode} aria-hidden="true" />

              {/* Text information */}
              <div className={s.stepInfo}>
                <span className={s.stepNumber}>{step.num}</span>
                <h3 className={s.stepTitle}>{step.title}</h3>
                <span className={s.stepSubtitle}>{step.subtitle}</span>
                <p className={s.stepDesc}>{step.desc}</p>
              </div>

              {/* Interactive preview card */}
              <div className={s.stepPreview}>
                {/* Step 1: Verification Preview */}
                {i === 0 && (
                  <div className={s.previewCardVerify}>
                    <div className={s.verifyHeader}>
                      <ShieldIcon />
                      <span>Campus Verification</span>
                    </div>
                    <p className={s.previewCardText}>Enter your institutional email address to join your college community.</p>
                    <div className={s.fakeInputContainer}>
                      <div className={s.fakeInput}>student@jnu.ac.in</div>
                      <div className={s.fakeVerifyBadge}>Send OTP</div>
                    </div>
                    <div className={s.fakeOtpContainer}>
                      <span className={s.otpDot}>4</span>
                      <span className={s.otpDot}>9</span>
                      <span className={s.otpDot}>2</span>
                      <span className={`${s.otpDot} ${s.otpDotPulse}`}>•</span>
                      <span className={s.otpDot}>•</span>
                      <span className={s.otpDot}>•</span>
                    </div>
                    <div className={s.verifyFooter}>
                      <span>Only @ac.in or verified domains allowed</span>
                    </div>
                  </div>
                )}

                {/* Step 2: Match Preview */}
                {i === 1 && (
                  <div className={s.previewCardMatch}>
                    <div className={s.matchHeader}>
                      <StarIcon />
                      <span>Finding Compatibility</span>
                    </div>
                    <div className={s.matchVisual}>
                      <div className={s.matchOrbLeft} />
                      <div className={s.matchOrbRight} />
                      <div className={s.matchPulseLine} />
                    </div>
                    <div className={s.matchDetails}>
                      <p className={s.matchQuery}>Looking for matches in Delhi NCR...</p>
                      <div className={s.matchingFilters}>
                        <span className={s.matchFilterTag}>Mutual Interests</span>
                        <span className={s.matchFilterTag}>Similar Lifestyle</span>
                        <span className={s.matchFilterTag}>Serious Intent</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Chat Preview */}
                {i === 2 && (
                  <div className={s.previewCardChat}>
                    <div className={s.chatHeader}>
                      <div className={s.chatAvatar}>
                        <span className={s.avatarMask} />
                      </div>
                      <div className={s.chatHeaderInfo}>
                        <span className={s.chatTargetName}>Mystery Match</span>
                        <span className={s.chatTargetSub}>JNU • Shared Interests: Reading, Vinyl</span>
                      </div>
                      <div className={s.chatTimer}>47:59:12</div>
                    </div>

                    <div className={s.chatMessages}>
                      <div className={`${s.chatBubble} ${s.chatBubbleReceived} ${chatStage >= 0 ? s.bubbleVisible : ""}`}>
                        It&apos;s quite nice talking without knowing what you look like.
                      </div>
                      <div className={`${s.chatBubble} ${s.chatBubbleSent} ${chatStage >= 1 ? s.bubbleVisible : ""}`}>
                        Yeah. It forces us to actually listen. What are you reading lately?
                      </div>
                      <div className={`${s.chatBubble} ${s.chatBubbleReceived} ${chatStage >= 2 ? s.bubbleVisible : ""}`}>
                        A collection of essays on architectural design. You?
                      </div>
                      <div className={`${s.chatBubble} ${s.chatBubbleSent} ${chatStage >= 3 ? s.bubbleVisible : ""}`}>
                        Just poetry. Let&apos;s get coffee and talk about both.
                      </div>
                    </div>

                    <div className={s.chatInputFake}>
                      <span>Type a message...</span>
                      <span className={s.sendButtonFake}>Send</span>
                    </div>
                  </div>
                )}

                {/* Step 4: Date Planning Preview */}
                {i === 3 && (
                  <div className={s.previewCardDatePlanning}>
                    <div className={s.dateHeader}>
                      <span className={s.dateStatus}>✓ Mutual Agreement Reached</span>
                      <h4>Date Confirmed</h4>
                    </div>

                    <div className={s.dateDetailsBox}>
                      <div className={s.dateDetailRow}>
                        <div className={s.dateDetailIcon}>📍</div>
                        <div className={s.dateDetailText}>
                          <strong>Café Dori, Dhan Mill</strong>
                          <span>100ft Road, Chhatarpur</span>
                        </div>
                      </div>
                      <div className={s.dateDetailRow}>
                        <div className={s.dateDetailIcon}>🕒</div>
                        <div className={s.dateDetailText}>
                          <strong>Friday, Oct 24</strong>
                          <span>5:00 PM - 7:00 PM</span>
                        </div>
                      </div>
                    </div>

                    <div className={s.dateActions}>
                      <button className={s.btnCalendar}>
                        📅 Add to Calendar
                      </button>
                      <button className={s.btnMaps}>
                        📍 Open in Maps
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Dedicated Privacy & Discretion Section ---- */}
      <section className={s.privacySection} id="privacy-first">
        <div className={s.privacyContainer}>
          <div className={s.sectionHeader}>
            <span className={s.sectionTag}>Engineered for Discretion</span>
            <h2 className={s.sectionTitle}>Privacy First. Zero Compromise.</h2>
            <p className={s.sectionSubtitle}>
              Dating on campus shouldn’t mean broadcasting your face to strangers. BlindSide is designed so you retain absolute ownership over your identity, data, and conversations.
            </p>
          </div>

          <div className={s.privacyGrid}>
            {/* 1. Identity in Your Control */}
            <div className={s.privacyCard}>
              <div className={s.privacyIconWrapper}>
                <UserCheckIcon />
              </div>
              <h3 className={s.privacyCardTitle}>Identity in Your Control</h3>
              <p className={s.privacyCardDesc}>
                No public profiles, no searchable galleries, and no awkward campus directory. Your photos and full name are unrevealed by default. You choose if and when to reveal them through mutual consent.
              </p>
              <div className={s.privacyBadge}>
                <span>✓ Hidden by Default</span>
              </div>
            </div>

            {/* 2. End-to-End Encryption */}
            <div className={s.privacyCard}>
              <div className={s.privacyIconWrapper}>
                <LockIcon />
              </div>
              <h3 className={s.privacyCardTitle}>Encrypted Architecture</h3>
              <p className={s.privacyCardDesc}>
                All account credentials and passwords are encrypted using cryptographic hashing (bcrypt/Argon2). Communications are guarded by TLS 1.3 encryption, and data volumes are strictly encrypted at rest.
              </p>
              <div className={s.privacyBadge}>
                <span>🔒 Cryptographically Secured</span>
              </div>
            </div>

            {/* 3. Private Conversations */}
            <div className={s.privacyCard}>
              <div className={s.privacyIconWrapper}>
                <MessageSquareIcon />
              </div>
              <h3 className={s.privacyCardTitle}>Private-by-Default Chats</h3>
              <p className={s.privacyCardDesc}>
                Your 48-hour blind conversations are strictly private between you and your match. We never sell your personal data, run ad trackers, or perform automated profiling on your private messages.
              </p>
              <div className={s.privacyBadge}>
                <span>🛡️ Zero Ad Tracking</span>
              </div>
            </div>

            {/* 4. Complete Right to be Forgotten */}
            <div className={s.privacyCard}>
              <div className={s.privacyIconWrapper}>
                <TrashIcon />
              </div>
              <h3 className={s.privacyCardTitle}>Instant Full Data Deletion</h3>
              <p className={s.privacyCardDesc}>
                You own your digital footprint. Request deletion anytime with a single tap, and our systems permanently wipe your profile, photos, chat history, and wallet records forever. Zero residual data.
              </p>
              <div className={s.privacyBadge}>
                <span>⚡ 100% Right to Forget</span>
              </div>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className={s.privacyTrustBar}>
            <div className={s.trustBarItem}>
              <span className={s.trustBarIcon}>🎓</span>
              <span>Verified Campus Inboxes</span>
            </div>
            <div className={s.trustBarDivider} />
            <div className={s.trustBarItem}>
              <span className={s.trustBarIcon}>📍</span>
              <span>Exact Coordinates Never Disclosed</span>
            </div>
            <div className={s.trustBarDivider} />
            <div className={s.trustBarItem}>
              <span className={s.trustBarIcon}>🛡️</span>
              <span>Human Moderation & Incident Reporting</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Values / Philosophy ---- */}
      <section className={s.philosophySection}>
        <div className={s.philosophyInner}>
          <div className={s.philosophyColumn}>
            <div className={s.philosophyIcon}><ShieldIcon /></div>
            <h3 className={s.philosophyTitle}>Safety & Discretion</h3>
            <p className={s.philosophyDesc}>
              Your identity remains completely hidden by default. You have absolute control to reveal your name or photo only when you're ready. All communications are private and secure, and campus network filters block external or unverified accounts.
            </p>
          </div>
          <div className={s.philosophyColumn}>
            <div className={s.philosophyIcon}><KeyIcon /></div>
            <h3 className={s.philosophyTitle}>Mutual Intent</h3>
            <p className={s.philosophyDesc}>
              Matches occur only when profiles share matching relationship intent, verified values, and active consent. You only communicate with individuals who want what you want.
            </p>
          </div>
          <div className={s.philosophyColumn}>
            <div className={s.philosophyIcon}><WalletIcon /></div>
            <h3 className={s.philosophyTitle}>Honest Pricing</h3>
            <p className={s.philosophyDesc}>
              No recurrent memberships or predatory microtransactions. Pay a simple flat rate per match request. If we cannot find a suitable partner in 7 days, receive a 100% refund.
            </p>
          </div>
        </div>
      </section>


      {/* ---- CTA Section ---- */}
      <section className={s.ctaSection}>
        <div className={s.ctaContainer}>
          <h2 className={s.ctaTitle}>Ready to begin?</h2>
          <p className={s.ctaDesc}>
            Join other students in your college community who are prioritizing real conversations over superficial swipes. Setting up your profile takes less than two minutes.
          </p>
          <div className={s.ctaActions}>
            <Link href="/auth" className={s.ctaPrimaryBtn} id="cta-final">
              Enter BlindSide
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span className={s.footerLogo}>BlindSide</span>
          <p className={s.footerCopy}>&copy; {new Date().getFullYear()} BlindSide. All rights reserved.</p>
          <div className={s.footerLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/security">Security Guidelines</Link>
            <a href="mailto:support@blindside.in" className={s.footerSupportBtn} id="home-footer-support-btn">
              <MailIcon /> Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
