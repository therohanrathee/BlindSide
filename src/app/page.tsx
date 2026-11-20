"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SplashLoader from "@/components/SplashLoader";
import s from "./page.module.css";
import EyeLogo from "@/components/EyeLogo";
import JourneyPath from "@/components/JourneyPath";
import PrivacyPath from "@/components/PrivacyPath";
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

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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
  const privacyFlowRef = useRef<HTMLDivElement>(null);
  const privacyStepRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    privacyStepRefs.current.forEach((step) => {
      if (!step) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            step.classList.add(s.stepVisible);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
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
                        <span className={s.chatTargetSub}>KRMU • Shared Interests: Reading, Vinyl</span>
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
              Dating on campus shouldn’t mean broadcasting your face to strangers. BlindSide is built with privacy and encryption by default, giving you total control over your identity, data, and conversations.
            </p>
          </div>

          <div className={s.privacyFlow} ref={privacyFlowRef}>
            {/* SVG path drawn on scroll: starts coming out of the right side of the screen */}
            <PrivacyPath containerRef={privacyFlowRef} stepRefs={privacyStepRefs} />

            {/* Step 1: Identity in Your Control (stepLeft: info left, preview right) */}
            <div
              ref={(el) => {
                privacyStepRefs.current[0] = el;
              }}
              className={`${s.privacyStep} ${s.privacyStepLeft}`}
            >
              <div className={s.mobileNode} aria-hidden="true" />
              <div className={s.stepInfo}>
                <span className={s.stepNumber}>01</span>
                <h3 className={s.stepTitle}>Identity in Your Control</h3>
                <span className={s.stepSubtitle}>Zero Public Photos or Profiles</span>
                <p className={s.stepDesc}>
                  No public galleries, no searchable directory, and no awkward campus browsing. Your photos and name stay hidden by default. You choose if and when to reveal them — only with mutual consent.
                </p>
              </div>

              <div className={s.stepPreview}>
                <div className={s.previewCardIdentity}>
                  <div className={s.privacyCardHeader}>
                    <div className={s.privacyCardTitleGroup}>
                      <ShieldIcon />
                      <span>Identity Control</span>
                    </div>
                    <span className={s.privacyCardBadge}>Hidden by Default</span>
                  </div>

                  <div className={s.frostedAvatarContainer}>
                    <div className={s.frostedAvatarFrame}>
                      <div className={s.frostedSilhouette}>
                        <UserCheckIcon />
                      </div>
                      <div className={s.frostedVeil}>
                        <div className={s.frostedLockBadge}>
                          <LockIcon />
                        </div>
                      </div>
                    </div>
                    <span className={s.frostedStatusText}>
                      Identity Protected
                    </span>
                  </div>

                  <div className={s.featureChecksBox}>
                    <div className={s.featureCheckRow}>
                      <span>Campus Directory Search</span>
                      <span className={s.checkBadgeOff}>Blocked</span>
                    </div>
                    <div className={s.featureCheckRow}>
                      <span>Public Photo Broadcast</span>
                      <span className={s.checkBadgeOff}>Disabled</span>
                    </div>
                    <div className={s.featureCheckRow}>
                      <span>Mutual Consent Reveal</span>
                      <span className={s.checkBadgeOn}>Required</span>
                    </div>
                  </div>

                  <div className={s.mutualConsentPill}>
                    <span>Mutual Consent Required to Reveal Profile</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Encrypted Architecture (stepRight: preview left, info right) */}
            <div
              ref={(el) => {
                privacyStepRefs.current[1] = el;
              }}
              className={`${s.privacyStep} ${s.privacyStepRight}`}
            >
              <div className={s.mobileNode} aria-hidden="true" />
              <div className={s.stepInfo}>
                <span className={s.stepNumber}>02</span>
                <h3 className={s.stepTitle}>Encrypted by Default</h3>
                <span className={s.stepSubtitle}>bcrypt Hashing &amp; TLS 1.3</span>
                <p className={s.stepDesc}>
                  All personal details, account data, and passwords are encrypted by default. Passwords are protected using one-way bcrypt cryptographic hashing — we never store or see your plaintext password. All web traffic is secured with modern TLS 1.3 encryption.
                </p>
              </div>

              <div className={s.stepPreview}>
                <div className={s.previewCardEncryption}>
                  <div className={s.privacyCardHeader}>
                    <div className={s.privacyCardTitleGroup}>
                      <LockIcon />
                      <span>Data Encryption</span>
                    </div>
                    <span className={s.privacyCardBadgeGreen}>bcrypt • TLS 1.3</span>
                  </div>

                  <div className={s.cryptoPipeline}>
                    <div className={s.pipelineStage}>
                      <span className={s.pipelineStageLabel}>User Password</span>
                      <span className={s.pipelineStageVal}>••••••••••••</span>
                    </div>

                    <div className={s.pipelineArrowRow}>
                      <span className={s.pipelineArrowIcon}>↓</span>
                      <span>One-Way bcrypt Hashing</span>
                    </div>

                    <div className={s.pipelineStage}>
                      <span className={s.pipelineStageLabel}>bcrypt Hash</span>
                      <span className={s.pipelineStageVal}>$2b$10$e8K9q...</span>
                    </div>
                  </div>

                  <div className={s.featureChecksBox}>
                    <div className={s.featureCheckRow}>
                      <span>Plaintext Storage</span>
                      <span className={s.checkBadgeOff}>Never Stored</span>
                    </div>
                    <div className={s.featureCheckRow}>
                      <span>Personal Details</span>
                      <span className={s.checkBadgeOn}>Encrypted by Default</span>
                    </div>
                    <div className={s.featureCheckRow}>
                      <span>Database Security</span>
                      <span className={s.checkBadgeOn}>Row-Level Security</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Private Conversations (stepLeft: info left, preview right) */}
            <div
              ref={(el) => {
                privacyStepRefs.current[2] = el;
              }}
              className={`${s.privacyStep} ${s.privacyStepLeft}`}
            >
              <div className={s.mobileNode} aria-hidden="true" />
              <div className={s.stepInfo}>
                <span className={s.stepNumber}>03</span>
                <h3 className={s.stepTitle}>Private 48-Hour Conversations</h3>
                <span className={s.stepSubtitle}>Automatically Deleted After 48 Hours</span>
                <p className={s.stepDesc}>
                  Your blind conversations are strictly private between you and your match. Every conversation has an automatic 48-hour window — once time runs out, the chat auto-deletes completely. Zero ad trackers and zero message profiling.
                </p>
              </div>

              <div className={s.stepPreview}>
                <div className={s.previewCardEphemeral}>
                  <div className={s.privacyCardHeader}>
                    <div className={s.privacyCardTitleGroup}>
                      <MessageSquareIcon />
                      <span>Private 48-Hour Chat</span>
                    </div>
                    <span className={s.privacyCardBadge}>48h Auto-Delete</span>
                  </div>

                  <div className={s.ephemeralChatBox}>
                    <span className={s.ephemeralWatermark}>Private • 48H Chat</span>
                    <div className={s.ephemeralBubbleRec}>
                      It&apos;s refreshing to talk without someone judging your photos first.
                    </div>
                    <div className={s.ephemeralBubbleSent}>
                      Exactly. And when the 48 hours are up, everything is automatically deleted.
                    </div>
                  </div>

                  <div className={s.featureChecksBox}>
                    <div className={s.featureCheckRow}>
                      <span>Commercial Ad Trackers</span>
                      <span className={s.checkBadgeOn}>Zero</span>
                    </div>
                    <div className={s.featureCheckRow}>
                      <span>AI Reading Messages</span>
                      <span className={s.checkBadgeOff}>Prohibited</span>
                    </div>
                    <div className={s.featureCheckRow}>
                      <span>Chat Lifetime</span>
                      <span className={s.checkBadgeOn}>Auto-Deletes in 48h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Instant Full Data Deletion (stepRight: preview left, info right) */}
            <div
              ref={(el) => {
                privacyStepRefs.current[3] = el;
              }}
              className={`${s.privacyStep} ${s.privacyStepRight}`}
            >
              <div className={s.mobileNode} aria-hidden="true" />
              <div className={s.stepInfo}>
                <span className={s.stepNumber}>04</span>
                <h3 className={s.stepTitle}>Instant Full Data Deletion</h3>
                <span className={s.stepSubtitle}>You Control Your Data</span>
                <p className={s.stepDesc}>
                  You own your digital footprint. Request deletion anytime with a single tap, and our systems permanently delete your profile, photos, chat history, and wallet records forever. Zero residual data.
                </p>
              </div>

              <div className={s.stepPreview}>
                <div className={s.previewCardDeletion}>
                  <div className={s.privacyCardHeader}>
                    <div className={s.privacyCardTitleGroup}>
                      <TrashIcon />
                      <span>Full Data Deletion</span>
                    </div>
                    <span className={s.privacyCardBadgeGreen}>1-Tap Erasure</span>
                  </div>

                  <div className={s.purgeChecklist}>
                    <div className={s.purgeItem}>
                      <div className={s.purgeItemTarget}>
                        <span>Profile &amp; Photos</span>
                      </div>
                      <span className={s.purgeStatusWiped}>Deleted</span>
                    </div>
                    <div className={s.purgeItem}>
                      <div className={s.purgeItemTarget}>
                        <span>Chat History</span>
                      </div>
                      <span className={s.purgeStatusWiped}>Deleted</span>
                    </div>
                    <div className={s.purgeItem}>
                      <div className={s.purgeItemTarget}>
                        <span>Location Coordinates</span>
                      </div>
                      <span className={s.purgeStatusWiped}>Purged</span>
                    </div>
                    <div className={s.purgeItem}>
                      <div className={s.purgeItemTarget}>
                        <span>Credentials &amp; Wallet</span>
                      </div>
                      <span className={s.purgeStatusWiped}>Erased</span>
                    </div>
                  </div>

                  <div className={s.purgeFooterBar}>
                    <span className={s.purgeStat}>Residual Data: 0 bytes</span>
                    <span className={s.purgeGuarantee}>100% Erased</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Highlights — 3 Sleek Security Assurance Cards */}
          <div className={s.privacyAssuranceGrid}>
            <div className={s.assuranceCard}>
              <div className={`${s.assuranceIconBox} ${s.assuranceIconRose}`}>
                <LockIcon />
              </div>
              <div className={s.assuranceText}>
                <h4 className={s.assuranceTitle}>Encrypted by Default</h4>
                <p className={s.assuranceDesc}>Passwords &amp; personal details hashed with bcrypt</p>
              </div>
            </div>

            <div className={s.assuranceCard}>
              <div className={`${s.assuranceIconBox} ${s.assuranceIconPurple}`}>
                <ClockIcon />
              </div>
              <div className={s.assuranceText}>
                <h4 className={s.assuranceTitle}>48-Hour Auto-Delete</h4>
                <p className={s.assuranceDesc}>Blind chats automatically shredded upon expiry</p>
              </div>
            </div>

            <div className={s.assuranceCard}>
              <div className={`${s.assuranceIconBox} ${s.assuranceIconEmerald}`}>
                <TrashIcon />
              </div>
              <div className={s.assuranceText}>
                <h4 className={s.assuranceTitle}>1-Tap Total Erasure</h4>
                <p className={s.assuranceDesc}>Permanently wipe your account and all data anytime</p>
              </div>
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
