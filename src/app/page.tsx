"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import s from "./page.module.css";

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

function MessageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [chatStage, setChatStage] = useState(0);

  // Monitor scroll for navbar transitions
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simple auto-advancing simulated chat
  useEffect(() => {
    if (activeStep === 2) {
      const interval = setInterval(() => {
        setChatStage((prev) => (prev < 3 ? prev + 1 : 0));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [activeStep]);

  const steps = [
    {
      title: "1. Verify Identity",
      subtitle: "University Verification",
      desc: "Confirm your status with a valid university email. A single OTP verification ensures all profiles are active, authenticated students from your specific campus network.",
    },
    {
      title: "2. Set Scope & Match",
      subtitle: "Personality First",
      desc: "Request a match to begin. Our algorithm analyzes core values, interests, and lifestyle intent to pair you with high-compatibility candidates.",
    },
    {
      title: "3. Chat Blind",
      subtitle: "Focus on Dialogue",
      desc: "A secure, text-only chat window opens for 48 hours. No photographs. No superficial reviews. We filter out contact details so you focus purely on the conversation.",
    },
    {
      title: "4. The Reveal",
      subtitle: "The Signature Moment",
      desc: "If both parties agree to meet, plan your date in-app. Exactly four hours before your date, we email both of you your match's photograph and confirmed location details.",
    },
  ];

  return (
    <div className={s.landing}>
      {/* Background Ambience */}
      <div className={s.ambientBg} aria-hidden="true">
        <div className={s.aurora} />
      </div>

      {/* ---- Navigation ---- */}
      <nav className={`${s.navbar} ${scrolled ? s.navbarScrolled : ""}`} role="navigation" aria-label="Main navigation">
        <div className={s.navbarInner}>
          <Link href="/" className={s.logo} id="nav-logo">
            <svg className={s.logoEye} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
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
        <div className={s.heroContent}>
          <span className={s.heroBadge}>A quiet space for real connection</span>
          <h1 className={s.heroTitle}>
            Connect in the dark.
            <br />
            <span className={s.heroTitleSecondary}>Meet in the light.</span>
          </h1>
          <p className={s.heroSubtitle}>
            A verified blind-matching platform for university students. No photo grids, no shallow swiping. Converse blind for 48 hours, plan a meeting, and reveal your identities before you meet.
          </p>

          <div className={s.heroActions}>
            <Link href="/auth" className={s.heroCta} id="hero-cta">
              Enter BlindSide
            </Link>
            <a href="#how-it-works" className={s.heroSecondary} id="hero-learn-more">
              How it unfolds
            </a>
          </div>

          {/* Simple organic divider */}
          <div className={s.heroScrollNote}>
            <span className={s.scrollText}>Scroll to explore</span>
            <div className={s.scrollDot} />
          </div>
        </div>
      </section>

      {/* ---- The Journey (Interactive Walkthrough) ---- */}
      <section className={s.journeySection} id="how-it-works">
        <div className={s.sectionHeader}>
          <span className={s.sectionTag}>The Experience</span>
          <h2 className={s.sectionTitle}>The Blind Match Journey</h2>
          <p className={s.sectionSubtitle}>
            We strip away superficial judgment to let authentic compatibility guide your first meeting.
          </p>
        </div>

        <div className={s.journeyGrid}>
          {/* Left Panel: Steps Selector */}
          <div className={s.journeySteps}>
            {steps.map((step, idx) => (
              <button
                key={idx}
                className={`${s.stepButton} ${activeStep === idx ? s.stepActive : ""}`}
                onClick={() => {
                  setActiveStep(idx);
                  if (idx === 2) setChatStage(0);
                }}
                aria-label={`View step ${idx + 1}: ${step.title}`}
              >
                <div className={s.stepNum}>0{idx + 1}</div>
                <div className={s.stepText}>
                  <h3 className={s.stepTitleText}>{step.title}</h3>
                  <span className={s.stepSubtitleText}>{step.subtitle}</span>
                  <p className={s.stepDescription}>{step.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Panel: Immersive Interactive Screen */}
          <div className={s.journeyPreviewContainer}>
            <div className={s.journeyPreviewInner}>
              {/* Step 1: Verification Preview */}
              {activeStep === 0 && (
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
              {activeStep === 1 && (
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
              {activeStep === 2 && (
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
                      It's quite nice talking without knowing what you look like.
                    </div>
                    <div className={`${s.chatBubble} ${s.chatBubbleSent} ${chatStage >= 1 ? s.bubbleVisible : ""}`}>
                      Yeah. It forces us to actually listen. What are you reading lately?
                    </div>
                    <div className={`${s.chatBubble} ${s.chatBubbleReceived} ${chatStage >= 2 ? s.bubbleVisible : ""}`}>
                      A collection of essays on architectural design. You?
                    </div>
                    <div className={`${s.chatBubble} ${s.chatBubbleSent} ${chatStage >= 3 ? s.bubbleVisible : ""}`}>
                      Just poetry. Let's get coffee and talk about both.
                    </div>
                  </div>

                  <div className={s.chatInputFake}>
                    <span>Type a message...</span>
                    <span className={s.sendButtonFake}>Send</span>
                  </div>
                </div>
              )}

              {/* Step 4: Reveal Preview */}
              {activeStep === 3 && (
                <div className={s.previewCardReveal}>
                  <div className={s.revealTag}>T-4 Hours Before Date</div>
                  
                  <div 
                    className={`${s.envelope} ${envelopeOpen ? s.envelopeOpenState : ""}`}
                    onMouseEnter={() => setEnvelopeOpen(true)}
                    onMouseLeave={() => setEnvelopeOpen(false)}
                    onClick={() => setEnvelopeOpen(!envelopeOpen)}
                  >
                    <div className={s.envelopeFlap} />
                    <div className={s.envelopePaper}>
                      <div className={s.paperHeader}>
                        <span>Date Details Revealed</span>
                      </div>
                      
                      <div className={s.avatarContainer}>
                        <div className={s.blurredAvatar}>
                          <div className={s.avatarAbstractGradient} />
                        </div>
                        <div className={s.avatarCheckIcon}>✓</div>
                      </div>

                      <h4 className={s.paperName}>Priya, 22</h4>
                      <p className={s.paperLocation}>Café Dori, Dhan Mill</p>
                      <span className={s.paperTime}>Today at 5:00 PM</span>
                      <div className={s.paperMapLink}>Open in Google Maps</div>
                    </div>
                    <div className={s.envelopeFront} />
                  </div>
                  
                  <p className={s.envelopeHint}>Hover or tap the envelope to inspect your match details</p>
                </div>
              )}
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
              No photos are shared in-app, protecting your identity. All communications are private and secure, and campus network filters block external or unverified accounts.
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

      {/* ---- Pricing Section ---- */}
      <section className={s.pricingSection} id="pricing">
        <div className={s.pricingLayout}>
          <div className={s.pricingInfo}>
            <span className={s.sectionTag}>Transparent Plans</span>
            <h2 className={s.sectionTitle}>Simple Pay-Per-Match</h2>
            <p className={s.pricingSubtitle}>
              No recurrent memberships or predatory microtransactions. Pay a simple flat rate per search. If we cannot find a suitable partner in 7 days, receive a 100% refund.
            </p>

            <div className={s.pricingBenefits}>
              <div className={s.benefitItem}>
                <div className={s.benefitIcon}>
                  <ShieldIcon />
                </div>
                <div className={s.benefitText}>
                  <h4>Campus Verified Only</h4>
                  <p>Matches are strictly restricted to students inside your official university network.</p>
                </div>
              </div>
              <div className={s.benefitItem}>
                <div className={s.benefitIcon}>
                  <KeyIcon />
                </div>
                <div className={s.benefitText}>
                  <h4>Double-Blind Security</h4>
                  <p>No photos or contact details are shared in-app, protecting your discretion at all times.</p>
                </div>
              </div>
              <div className={s.benefitItem}>
                <div className={s.benefitIcon}>
                  <WalletIcon />
                </div>
                <div className={s.benefitText}>
                  <h4>7-Day Refund Guarantee</h4>
                  <p>If the system cannot locate a matching profile within 7 days, the fee is fully refunded.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: University */}
          <div className={s.pricingCard}>
            <span className={s.cardLabel}>Campus Exclusive</span>
            <h3 className={s.cardPlanTitle}>My Campus</h3>
            <div className={s.priceBox}>
              <span className={s.priceCurrency}>₹</span>
              <span className={s.priceVal}>49</span>
              <span className={s.pricePer}>/first search</span>
            </div>
            <div className={s.firstMatchPromo}>Regular rate: ₹69/search</div>
            <ul className={s.planFeatures}>
              <li>
                <span className={s.checkMark}>✓</span> Matches restricted to your campus network
              </li>
              <li>
                <span className={s.checkMark}>✓</span> Verified student status verification
              </li>
              <li>
                <span className={s.checkMark}>✓</span> 48-hour secure chat timer
              </li>
              <li>
                <span className={s.checkMark}>✓</span> Envelope reveal sent via email 4h before
              </li>
              <li>
                <span className={s.checkMark}>✓</span> 7-day match guarantee or 100% refund
              </li>
            </ul>
            <Link href="/auth" className={s.planCta} id="pricing-uni-cta">
              Start Matching
            </Link>
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
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
