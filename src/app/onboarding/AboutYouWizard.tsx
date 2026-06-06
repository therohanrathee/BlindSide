"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import a from "./about-you.module.css";

/* ── constants ─────────────────────────────────────────────── */

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ITEM_H = 44;              // scroll-wheel item height (desktop)
const ITEM_H_M = 36;            // mobile
const MIN_CM = 122;              // 4'0"
const MAX_CM = 213;              // 7'0"
const DEFAULT_CM = 170;          // 5'7"
const MIN_KG = 30;
const MAX_KG = 150;
const DEFAULT_KG = 65;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 80;   // oldest
const MAX_YEAR = CURRENT_YEAR - 18;   // youngest (18+)

/* ── helpers ───────────────────────────────────────────────── */

function cmToFtIn(cm: number) {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) { return { ft: ft + 1, inches: 0 }; }
  return { ft, inches };
}

function kgToLbs(kg: number) {
  return Math.round(kg * 2.20462);
}

function calcAge(y: number, m: number, d: number): number {
  const today = new Date();
  const birth = new Date(y, m - 1, d);
  let age = today.getFullYear() - birth.getFullYear();
  const mDiff = today.getMonth() - birth.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function daysInMonth(m: number, y: number): number {
  return new Date(y, m, 0).getDate();
}

/* ── SVG silhouettes ───────────────────────────────────────── */

function MaleSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 80 120" fill={fill} className={a.genderIcon}>
      <circle cx="40" cy="18" r="13"/>
      <path d="M20 46 Q20 34 30 34 L50 34 Q60 34 60 46 L57 82 Q56 87 51 87 L29 87 Q24 87 23 82 Z"/>
      <rect x="25" y="89" width="11" height="28" rx="5"/>
      <rect x="44" y="89" width="11" height="28" rx="5"/>
    </svg>
  );
}

function FemaleSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 80 120" fill={fill} className={a.genderIcon}>
      <circle cx="40" cy="18" r="13"/>
      <path d="M28 46 Q28 34 34 34 L46 34 Q52 34 52 46 L54 60 Q54 65 48 68 L52 87 Q53 90 48 90 L32 90 Q27 90 28 87 L32 68 Q26 65 26 60 Z"/>
      <rect x="29" y="92" width="10" height="26" rx="5"/>
      <rect x="41" y="92" width="10" height="26" rx="5"/>
    </svg>
  );
}

function NonBinarySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 80 120" fill={fill} className={a.genderIcon}>
      <circle cx="40" cy="18" r="13"/>
      <path d="M25 46 Q25 34 33 34 L47 34 Q55 34 55 46 L53 82 Q52 87 47 87 L33 87 Q28 87 27 82 Z"/>
      <rect x="28" y="89" width="10" height="28" rx="5"/>
      <rect x="42" y="89" width="10" height="28" rx="5"/>
      {/* Non-binary symbol */}
      <circle cx="40" cy="56" r="8" fill="none" stroke={fill} strokeWidth="2.5"/>
      <line x1="40" y1="48" x2="40" y2="42" stroke={fill} strokeWidth="2.5"/>
      <line x1="36" y1="62" x2="33" y2="67" stroke={fill} strokeWidth="2.5"/>
      <line x1="44" y1="62" x2="47" y2="67" stroke={fill} strokeWidth="2.5"/>
    </svg>
  );
}

/* ── ScrollWheel sub-component ─────────────────────────────── */

interface WheelProps {
  items: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  label: string;
}

function ScrollWheel({ items, selectedIndex, onSelect, label }: WheelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const isUserScroll = useRef(true);

  // scroll to initial position on mount
  useEffect(() => {
    if (scrollRef.current) {
      isUserScroll.current = false;
      scrollRef.current.scrollTop = selectedIndex * ITEM_H;
      // Re-enable after programmatic scroll
      setTimeout(() => { isUserScroll.current = true; }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = useCallback(() => {
    if (!isUserScroll.current) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const idx = Math.round(scrollRef.current.scrollTop / ITEM_H);
      if (idx >= 0 && idx < items.length && idx !== selectedIndex) {
        onSelect(idx);
      }
    }, 80);
  }, [items.length, selectedIndex, onSelect]);

  // keep wheel in sync when selectedIndex changes externally
  useEffect(() => {
    if (scrollRef.current) {
      const expected = selectedIndex * ITEM_H;
      const current = scrollRef.current.scrollTop;
      if (Math.abs(current - expected) > ITEM_H / 2) {
        isUserScroll.current = false;
        scrollRef.current.scrollTo({ top: expected, behavior: "smooth" });
        setTimeout(() => { isUserScroll.current = true; }, 300);
      }
    }
  }, [selectedIndex]);

  const PAD = ITEM_H * 2; // padding to allow first/last to center

  return (
    <div className={a.wheelCol}>
      <div className={a.wheelLabel}>{label}</div>
      <div className={a.wheelOuter}>
        <div className={a.wheelFadeTop}/>
        <div className={a.wheelHighlight}/>
        <div className={a.wheelFadeBottom}/>
        <div
          className={a.wheelScroll}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div style={{ height: PAD }}/>
          {items.map((item, i) => (
            <div
              key={i}
              className={`${a.wheelItem} ${i === selectedIndex ? a.wheelItemActive : ""}`}
              style={{ height: ITEM_H }}
            >
              {item}
            </div>
          ))}
          <div style={{ height: PAD }}/>
        </div>
      </div>
    </div>
  );
}

/* ── Height reference marks ────────────────────────────────── */

const HEIGHT_MARKS = [
  { cm: 122, label: "4′0″" },
  { cm: 137, label: "4′6″" },
  { cm: 152, label: "5′0″" },
  { cm: 167, label: "5′6″" },
  { cm: 183, label: "6′0″" },
  { cm: 198, label: "6′6″" },
  { cm: 213, label: "7′0″" },
];

const WEIGHT_MARKS_KG = [30, 50, 70, 90, 110, 130, 150];

/* ── Main wizard component ─────────────────────────────────── */

interface WizardResult {
  firstName: string;
  lastName: string;
  dob: string;
  gender: "male" | "female" | "nonbinary";
  heightCm: number;
  heightUnit: "ft" | "cm";
  weightKg: number;
}

interface Props {
  initialFirstName?: string;
  initialLastName?: string;
  initialDob?: string;
  initialGender?: string;
  initialHeightCm?: number;
  initialWeightKg?: number;
  onComplete: (result: WizardResult) => void;
  onError: (msg: string) => void;
}

export default function AboutYouWizard({
  initialFirstName = "",
  initialLastName = "",
  initialDob = "",
  initialGender = "",
  initialHeightCm,
  initialWeightKg,
  onComplete,
  onError,
}: Props) {
  /* --- sub-step state --- */
  const [sub, setSub] = useState(0);
  const [dir, setDir] = useState<"forward" | "back">("forward");

  /* --- name --- */
  const [fullName, setFullName] = useState(
    initialFirstName ? `${initialFirstName}${initialLastName ? " " + initialLastName : ""}` : ""
  );
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [showGreeting, setShowGreeting] = useState(false);
  const [needLastName, setNeedLastName] = useState(false);

  /* --- dob --- */
  const initDate = initialDob ? new Date(initialDob) : null;
  const [dobDay, setDobDay] = useState(initDate ? initDate.getDate() : 15);
  const [dobMonth, setDobMonth] = useState(initDate ? initDate.getMonth() + 1 : 6);
  const [dobYear, setDobYear] = useState(initDate ? initDate.getFullYear() : 2000);
  const [ageShown, setAgeShown] = useState(false);

  /* --- gender --- */
  const [gender, setGender] = useState(initialGender);

  /* --- height --- */
  const [heightVal, setHeightVal] = useState(initialHeightCm ?? DEFAULT_CM);

  /* --- weight --- */
  const [weightVal, setWeightVal] = useState(initialWeightKg ?? DEFAULT_KG);

  /* --- morph --- */
  const [showMorph, setShowMorph] = useState(false);
  const [morphDir, setMorphDir] = useState<"v2h" | "h2v">("v2h");

  /* --- refs --- */
  const heightRef = useRef<HTMLDivElement>(null);
  const weightRef = useRef<HTMLDivElement>(null);

  /* resume: if name already set, jump to last sub-step */
  useEffect(() => {
    if (initialFirstName) setSub(4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- navigation --- */
  const goForward = () => { setDir("forward"); setSub(s => s + 1); };
  const goBack = ()    => { setDir("back");    setSub(s => s - 1); };

  /* special morph transitions between height ↔ weight */
  const goToWeight = () => {
    setMorphDir("v2h");
    setShowMorph(true);
    setTimeout(() => { setShowMorph(false); setDir("forward"); setSub(4); }, 580);
  };
  const goBackToHeight = () => {
    setMorphDir("h2v");
    setShowMorph(true);
    setTimeout(() => { setShowMorph(false); setDir("back"); setSub(3); }, 580);
  };

  /* --- name handlers --- */
  const handleNameSubmit = () => {
    const trimmed = fullName.trim();
    if (!trimmed) return;
    const spaceIdx = trimmed.indexOf(" ");
    if (spaceIdx === -1) {
      setFirstName(trimmed);
      setLastName("");
      setShowGreeting(true);
      setNeedLastName(true);
    } else {
      setFirstName(trimmed.slice(0, spaceIdx));
      setLastName(trimmed.slice(spaceIdx + 1).trim());
      setShowGreeting(true);
      setNeedLastName(false);
      setTimeout(goForward, 1200);
    }
  };

  const handleLastNameSubmit = () => {
    if (!lastName.trim()) return;
    setNeedLastName(false);
    setTimeout(goForward, 600);
  };

  /* --- dob handlers --- */
  const age = calcAge(dobYear, dobMonth, dobDay);
  const maxDay = daysInMonth(dobMonth, dobYear);
  const clampedDay = Math.min(dobDay, maxDay);

  const handleDobConfirm = () => {
    if (age < 18) {
      onError("You must be at least 18 years old to join BlindSide.");
      return;
    }
    onError("");
    goForward();
  };

  /* --- gender handler --- */
  const handleGenderPick = (g: string) => {
    setGender(g);
    setTimeout(goForward, 400);
  };

  /* --- ruler lock + hover logic --- */
  const [heightLocked, setHeightLocked] = useState(false);
  const [weightLocked, setWeightLocked] = useState(false);

  const updateHeight = useCallback((clientY: number) => {
    if (!heightRef.current) return;
    const r = heightRef.current.getBoundingClientRect();
    const frac = 1 - ((clientY - r.top) / r.height);
    const clamped = Math.max(0, Math.min(1, frac));
    setHeightVal(Math.round(MIN_CM + clamped * (MAX_CM - MIN_CM)));
  }, []);

  const updateWeight = useCallback((clientX: number) => {
    if (!weightRef.current) return;
    const r = weightRef.current.getBoundingClientRect();
    const frac = (clientX - r.left) / r.width;
    const clamped = Math.max(0, Math.min(1, frac));
    setWeightVal(Math.round(MIN_KG + clamped * (MAX_KG - MIN_KG)));
  }, []);

  /* Desktop: hover tracks value unless locked. Click toggles lock. Leave unlocks. */
  const onHeightMouseMove = useCallback((e: React.MouseEvent) => { if (!heightLocked) updateHeight(e.clientY); }, [heightLocked, updateHeight]);
  const onHeightClick = useCallback((e: React.MouseEvent) => {
    if (heightLocked) { setHeightLocked(false); updateHeight(e.clientY); } else { setHeightLocked(true); }
  }, [heightLocked, updateHeight]);
  const onHeightMouseLeave = useCallback(() => { setHeightLocked(false); }, []);

  const onWeightMouseMove = useCallback((e: React.MouseEvent) => { if (!weightLocked) updateWeight(e.clientX); }, [weightLocked, updateWeight]);
  const onWeightClick = useCallback((e: React.MouseEvent) => {
    if (weightLocked) { setWeightLocked(false); updateWeight(e.clientX); } else { setWeightLocked(true); }
  }, [weightLocked, updateWeight]);
  const onWeightMouseLeave = useCallback(() => { setWeightLocked(false); }, []);

  /* Mobile: touch-drag always updates, lift finger locks. */
  const onHeightTouchMove = useCallback((e: React.TouchEvent) => { e.preventDefault(); updateHeight(e.touches[0].clientY); }, [updateHeight]);
  const onWeightTouchMove = useCallback((e: React.TouchEvent) => { e.preventDefault(); updateWeight(e.touches[0].clientX); }, [updateWeight]);

  /* --- completion --- */
  const handleComplete = () => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dobStr = `${dobYear}-${pad(dobMonth)}-${pad(clampedDay)}`;
    onComplete({
      firstName,
      lastName,
      dob: dobStr,
      gender: gender as "male" | "female" | "nonbinary",
      heightCm: heightVal,
      heightUnit: "ft",
      weightKg: weightVal,
    });
  };

  /* --- build scroll-wheel data --- */
  const dayItems = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const monthItems = MONTHS;
  const yearItems = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => (MAX_YEAR - i).toString());

  /* --- render helpers --- */
  const { ft, inches } = cmToFtIn(heightVal);
  const lbs = kgToLbs(weightVal);

  const heightFrac = (heightVal - MIN_CM) / (MAX_CM - MIN_CM);
  const weightFrac = (weightVal - MIN_KG) / (MAX_KG - MIN_KG);

  /* ── render sub-steps ──────────────────────────────────── */

  function renderSub() {
    switch (sub) {

      /* ─── 4a: NAME ─── */
      case 0:
        return (
          <div className={a.nameContent}>
            <h2 className={a.subTitle}>What should we call you?</h2>
            <p className={a.subHint}>Enter your full name — first and last.</p>

            <input
              className={a.nameInput}
              type="text"
              placeholder="e.g. Rohan Rathee"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleNameSubmit(); }}
              autoFocus
            />

            {showGreeting && (
              <div className={a.greeting}>
                Nice to meet you, <span className={a.greetingName}>{firstName}!</span>
              </div>
            )}

            {needLastName && showGreeting && (
              <div className={a.lastNameRow}>
                <div className={a.lastNameLabel}>And your last name?</div>
                <input
                  className={a.nameInput}
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleLastNameSubmit(); }}
                  autoFocus
                />
                <button
                  className={a.confirmBtn}
                  onClick={handleLastNameSubmit}
                  disabled={!lastName.trim()}
                >
                  Continue →
                </button>
              </div>
            )}

            {!showGreeting && (
              <button
                className={a.confirmBtn}
                onClick={handleNameSubmit}
                disabled={!fullName.trim()}
              >
                Continue →
              </button>
            )}
          </div>
        );

      /* ─── 4b: DOB ─── */
      case 1:
        return (
          <div className={a.dobContent}>
            <h2 className={a.subTitle}>When were you born?</h2>
            <p className={a.subHint}>Scroll to pick your date of birth.</p>

            <div className={a.wheelRow}>
              <ScrollWheel
                label="Day"
                items={dayItems}
                selectedIndex={clampedDay - 1}
                onSelect={i => setDobDay(i + 1)}
              />
              <ScrollWheel
                label="Month"
                items={monthItems}
                selectedIndex={dobMonth - 1}
                onSelect={i => setDobMonth(i + 1)}
              />
              <ScrollWheel
                label="Year"
                items={yearItems}
                selectedIndex={MAX_YEAR - dobYear}
                onSelect={i => setDobYear(MAX_YEAR - i)}
              />
            </div>

            {/* age card always visible */}
            <div className={a.ageCard} key={`${dobYear}-${dobMonth}-${clampedDay}`}>
              {age >= 18 ? (
                <>
                  <div className={a.ageText}>You&apos;re</div>
                  <div className={a.ageNumber}>{age}</div>
                  <div className={a.ageText}>years old?</div>
                </>
              ) : (
                <div className={`${a.ageText} ${a.ageError}`}>
                  You must be at least 18 to join.
                </div>
              )}
            </div>

            <div className={a.navRow}>
              <button className={a.navBack} onClick={goBack}>← Back</button>
              <button
                className={a.confirmBtn}
                onClick={handleDobConfirm}
                disabled={age < 18}
                style={{ marginTop: 0 }}
              >
                That&apos;s right! →
              </button>
            </div>
          </div>
        );

      /* ─── 4c: GENDER ─── */
      case 2:
        return (
          <div className={a.genderContent}>
            <h2 className={a.subTitle}>How do you identify?</h2>
            <p className={a.subHint}>Select the option that best represents you.</p>

            <div className={a.genderGrid}>
              {([
                { key: "male",      label: "Male",       Svg: MaleSVG },
                { key: "female",    label: "Female",     Svg: FemaleSVG },
                { key: "nonbinary", label: "Non-binary", Svg: NonBinarySVG },
              ] as const).map(g => {
                const active = gender === g.key;
                const accentFill = active
                  ? "url(#accentGrad)"
                  : "var(--text-muted)";
                return (
                  <button
                    key={g.key}
                    className={`${a.genderBtn} ${active ? a.genderBtnActive : ""}`}
                    onClick={() => handleGenderPick(g.key)}
                    type="button"
                  >
                    <svg width="0" height="0" style={{ position: "absolute" }}>
                      <defs>
                        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(340,82%,55%)" />
                          <stop offset="100%" stopColor="hsl(255,65%,60%)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <g.Svg fill={accentFill} />
                    <span className={a.genderName}>{g.label}</span>
                  </button>
                );
              })}
            </div>

            <div className={a.navRow}>
              <button className={a.navBack} onClick={goBack}>← Back</button>
              <div/>
            </div>
          </div>
        );

      /* ─── 4d: HEIGHT ─── */
      case 3:
        return (
          <div>
            <h2 className={a.rulerTitle}>How tall are you?</h2>

            {/* badge */}
            <div className={a.rulerBadge}>
              <span className={a.badgeValue}>{ft}′{inches}″</span>
              <span className={a.badgeDivider}/>
              <span className={a.badgeAlt}>{heightVal} cm</span>
            </div>

            {/* vertical ruler */}
            <div
              className={`${a.heightRuler} ${heightLocked ? a.rulerLocked : ""}`}
              ref={heightRef}
              onMouseMove={onHeightMouseMove}
              onClick={onHeightClick}
              onMouseLeave={onHeightMouseLeave}
              onTouchMove={onHeightTouchMove}
            >
              {/* left labels (ft'in") */}
              <div className={`${a.heightLabelsCol} ${a.right}`}>
                {HEIGHT_MARKS.map(m => {
                  const d = Math.abs(heightVal - m.cm);
                  const cls = d === 0 ? "current" : d <= 8 ? "near" : "";
                  return (
                    <span key={m.cm} className={`${a.rulerMarkLabel} ${cls ? a[cls] : ""}`} style={cls === "current" ? { color: "var(--accent-primary)", fontWeight: 800, fontSize: 13 } : cls === "near" ? { color: "var(--text-secondary)", fontSize: 11 } : undefined}>
                      {m.label}
                    </span>
                  );
                }).reverse()}
              </div>

              {/* track */}
              <div className={a.heightTrackArea}>
                <div className={a.heightTrack}>
                  <div className={a.heightFill} style={{ height: `${heightFrac * 100}%` }}/>
                </div>
                {/* ticks every 1 cm — major (10cm), medium (5cm), minor (1cm) */}
                <div className={a.heightTicks}>
                  {Array.from({ length: MAX_CM - MIN_CM + 1 }, (_, i) => {
                    const cm = MIN_CM + i;
                    const pct = ((cm - MIN_CM) / (MAX_CM - MIN_CM)) * 100;
                    const isCurrent = heightVal === cm;
                    const isMajor = cm % 10 === 0;
                    const isMedium = cm % 5 === 0 && !isMajor;
                    const isMinor = !isMajor && !isMedium;
                    const sizeClass = isMajor ? a.major : isMedium ? a.medium : a.minor;
                    return (
                      <div key={cm} style={{ position: "absolute", bottom: `${pct}%`, left: 0, right: 0 }}>
                        <div className={`${a.heightTick} ${a.left} ${sizeClass} ${isCurrent ? a.active : ""}`}/>
                        <div className={`${a.heightTick} ${a.right} ${sizeClass} ${isCurrent ? a.active : ""}`}/>
                      </div>
                    );
                  })}
                </div>
                {/* thumb */}
                <div className={`${a.heightThumb} ${heightLocked ? a.thumbLocked : ""}`} style={{ bottom: `${heightFrac * 100}%` }}/>
              </div>

              {/* right labels (cm) */}
              <div className={`${a.heightLabelsCol} ${a.left}`}>
                {HEIGHT_MARKS.map(m => {
                  const d = Math.abs(heightVal - m.cm);
                  return (
                    <span key={m.cm} className={a.rulerMarkLabel} style={d === 0 ? { color: "var(--accent-primary)", fontWeight: 800, fontSize: 13 } : d <= 8 ? { color: "var(--text-secondary)", fontSize: 11 } : undefined}>
                      {m.cm}
                    </span>
                  );
                }).reverse()}
              </div>
            </div>

            <div className={a.navRow}>
              <button className={a.navBack} onClick={goBack}>← Back</button>
              <button className={a.confirmBtn} onClick={goToWeight} style={{ marginTop: 0 }}>
                Continue →
              </button>
            </div>
          </div>
        );

      /* ─── 4e: WEIGHT ─── */
      case 4:
        return (
          <div>
            <h2 className={a.rulerTitle}>What do you weigh?</h2>

            {/* badge */}
            <div className={a.rulerBadge}>
              <span className={a.badgeValue}>{weightVal} kg</span>
              <span className={a.badgeDivider}/>
              <span className={a.badgeAlt}>{lbs} lbs</span>
            </div>

            {/* horizontal ruler */}
            <div
              className={`${a.weightRuler} ${weightLocked ? a.rulerLocked : ""}`}
              ref={weightRef}
              onMouseMove={onWeightMouseMove}
              onClick={onWeightClick}
              onMouseLeave={onWeightMouseLeave}
              onTouchMove={onWeightTouchMove}
            >
              {/* top labels (kg) */}
              <div className={a.weightLabelsRow}>
                {WEIGHT_MARKS_KG.map(kg => {
                  const d = Math.abs(weightVal - kg);
                  return (
                    <span key={kg} className={a.rulerMarkLabel} style={d <= 3 ? { color: "var(--accent-primary)", fontWeight: 800, fontSize: 13 } : d <= 10 ? { color: "var(--text-secondary)", fontSize: 11 } : undefined}>
                      {kg}
                    </span>
                  );
                })}
              </div>

              {/* track */}
              <div className={a.weightTrackArea}>
                <div className={a.weightTrack}>
                  <div className={a.weightFill} style={{ width: `${weightFrac * 100}%` }}/>
                </div>
                {/* ticks every 1 kg — major (10kg), medium (5kg), minor (1kg) */}
                <div className={a.weightTicks}>
                  {Array.from({ length: MAX_KG - MIN_KG + 1 }, (_, i) => {
                    const kg = MIN_KG + i;
                    const pct = ((kg - MIN_KG) / (MAX_KG - MIN_KG)) * 100;
                    const isCurrent = weightVal === kg;
                    const isMajor = kg % 10 === 0;
                    const isMedium = kg % 5 === 0 && !isMajor;
                    const isMinor = !isMajor && !isMedium;
                    const sizeClass = isMajor ? a.major : isMedium ? a.medium : a.minor;
                    return (
                      <div key={kg} style={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0 }}>
                        <div className={`${a.weightTick} ${a.top} ${sizeClass} ${isCurrent ? a.active : ""}`}/>
                        <div className={`${a.weightTick} ${a.bottom} ${sizeClass} ${isCurrent ? a.active : ""}`}/>
                      </div>
                    );
                  })}
                </div>
                {/* thumb */}
                <div className={`${a.weightThumb} ${weightLocked ? a.thumbLocked : ""}`} style={{ left: `${weightFrac * 100}%` }}/>
              </div>

              {/* bottom labels (lbs) */}
              <div className={a.weightLabelsRow}>
                {WEIGHT_MARKS_KG.map(kg => {
                  const lb = kgToLbs(kg);
                  const d = Math.abs(weightVal - kg);
                  return (
                    <span key={kg} className={a.rulerMarkLabel} style={d <= 3 ? { color: "var(--accent-primary)", fontWeight: 800, fontSize: 13 } : d <= 10 ? { color: "var(--text-secondary)", fontSize: 11 } : undefined}>
                      {lb}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className={a.navRow}>
              <button className={a.navBack} onClick={goBackToHeight}>← Back</button>
              <button className={a.confirmBtn} onClick={handleComplete} style={{ marginTop: 0 }}>
                Looks good! ✓
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  /* ── main render ───────────────────────────────────────── */

  return (
    <div className={a.wizard}>
      {/* progress dots */}
      <div className={a.dotRow}>
        {[0, 1, 2, 3, 4].map((i, idx) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className={`${a.dot} ${i === sub ? a.dotActive : i < sub ? a.dotComplete : ""}`}/>
            {idx < 4 && (
              <div className={`${a.dotConnector} ${i < sub ? a.dotConnectorDone : ""}`}/>
            )}
          </div>
        ))}
      </div>

      {/* slide panels */}
      <div className={a.slideWrapper}>
        {showMorph && (
          <div className={a.morphOverlay}>
            <div className={morphDir === "v2h" ? a.morphBarVtoH : a.morphBarHtoV}/>
          </div>
        )}

        {!showMorph && (
          <div
            key={sub}
            className={`${a.slidePanel} ${dir === "forward" ? a.slideRight : a.slideLeft}`}
          >
            {renderSub()}
          </div>
        )}
      </div>
    </div>
  );
}
