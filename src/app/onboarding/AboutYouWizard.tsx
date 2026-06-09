"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import a from "./about-you.module.css";
import s from "./onboarding.module.css";

/* ── constants ─────────────────────────────────────────────── */

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ITEM_H = 44;              // scroll-wheel item height (desktop)
const MIN_CM = 122;              // 4'0"
const MAX_CM = 213;              // 7'0"
const DEFAULT_CM = 170;          // 5'7"
const MIN_KG = 30;
const MAX_KG = 150;
const DEFAULT_KG = 65;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 80;   // oldest
const MAX_YEAR = CURRENT_YEAR - 18;   // youngest (18+)

const HOBBIES_LIST = [
  { name: "Reading",      emoji: "📚" },
  { name: "Gaming",       emoji: "🎮" },
  { name: "Fitness",      emoji: "💪" },
  { name: "Travel",       emoji: "✈️" },
  { name: "Cooking",      emoji: "🍳" },
  { name: "Music",        emoji: "🎵" },
  { name: "Photography",  emoji: "📷" },
  { name: "Hiking",       emoji: "🥾" },
  { name: "Art",          emoji: "🎨" },
  { name: "Dancing",      emoji: "💃" },
  { name: "Movies",       emoji: "🎬" },
  { name: "Sports",       emoji: "⚽" },
  { name: "Yoga",         emoji: "🧘" },
  { name: "Coffee",       emoji: "☕" },
  { name: "Nightlife",    emoji: "🌃" },
  { name: "Pets",         emoji: "🐾" },
  { name: "Volunteering", emoji: "🤝" },
  { name: "Tech",         emoji: "💻" },
  { name: "Fashion",      emoji: "👗" },
  { name: "Foodie",       emoji: "🍕" },
  { name: "Writing",      emoji: "✍️" },
  { name: "Gardening",    emoji: "🌱" },
  { name: "Board Games",  emoji: "🎲" },
  { name: "Anime",        emoji: "🎌" },
  { name: "Singing",      emoji: "🎤" },
  { name: "Cycling",      emoji: "🚴" },
  { name: "Astronomy",    emoji: "🔭" },
  { name: "DIY",          emoji: "🔧" },
  { name: "Swimming",     emoji: "🏊" },
  { name: "Meditation",   emoji: "🧘‍♂️" },
];


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
      <circle cx="40" cy="56" r="8" fill="none" stroke={fill} strokeWidth="2.5"/>
      <line x1="40" y1="48" x2="40" y2="42" stroke={fill} strokeWidth="2.5"/>
      <line x1="36" y1="62" x2="33" y2="67" stroke={fill} strokeWidth="2.5"/>
      <line x1="44" y1="62" x2="47" y2="67" stroke={fill} strokeWidth="2.5"/>
    </svg>
  );
}

/* ── Diet SVGs ─────────────────────────────────────────────── */

function VegSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 1.35 4.3 0 10a8.9 8.9 0 0 1-8 8z" />
      <path d="M19 2c-2.26 4.33-5.27 7.14-8 10" />
    </svg>
  );
}

function NonVegSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Symmetrical vertical chicken leg - simple and appealing */}
      <path d="M12 2C8 2 5 5.5 5 10c0 3.5 2 6 3.5 7.5L10 20v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1l1.5-2.5c1.5-1.5 3.5-4 3.5-7.5 0-4.5-3-8-7-8z" />
      <circle cx="10" cy="21" r="1" fill={fill} />
      <circle cx="14" cy="21" r="1" fill={fill} />
    </svg>
  );
}

function VeganSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      <circle cx="12" cy="12" r="10" />
      {/* Leaf seedling sprout */}
      <path d="M12 18v-8" />
      <path d="M12 10c2.5-2.5 5-2 6 0-1 2-3.5 2-6 0z" />
      <path d="M12 13c-2.5-2.5-5-2-6 0 1 2 3.5 2 6 0z" />
    </svg>
  );
}

function EggetarianSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Egg silhouette: slightly egg-shaped (tapered top) but rounder */}
      <path d="M12 3C8.5 3 5.5 8 5.5 13a6.5 6.5 0 0 0 13 0c0-5-3-10-6.5-10z" />
      <circle cx="12" cy="13" r="3" fill={fill} />
    </svg>
  );
}

/* ── Drinking & Smoking SVGs ────────────────────────────────── */

function SoberSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}

function DrinkOccasionallySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Perfectly symmetrical wine glass */}
      <path d="M6 4h12v6c0 3.3-2.7 6-6 6s-6-2.7-6-6V4z" />
      <line x1="12" y1="16" x2="12" y2="20" />
      <line x1="9" y1="20" x2="15" y2="20" />
    </svg>
  );
}

function DrinkSociallySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Left Mug - scaled up with fill/level line */}
      <path d="M4 8h5v9H4V8z" />
      <path d="M4 10H2v4h2" />
      <line x1="4" y1="11" x2="9" y2="11" />
      <path d="M3.5 8c0-1 1-1.5 2-1s1 .5 1.5 0 1-.5 2 0S10 8 9.5 8" />

      {/* Right Mug - scaled up with fill/level line */}
      <path d="M15 8h5v9h-5V8z" />
      <path d="M20 10h2v4h-2" />
      <line x1="15" y1="11" x2="20" y2="11" />
      <path d="M14.5 8c0-1 1-1.5 2-1s1 .5 1.5 0 1-.5 2 0S21 8 20.5 8" />

      {/* Splashes */}
      <path d="M11.5 4.5l1-1M13.5 4.5l-1-1" />
    </svg>
  );
}

function DrinkRegularlySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Alcohol Decanter/Whiskey Bottle */}
      <path d="M6 8h5v11H6V8z" />
      <path d="M7.5 8V5.5h2V8" />
      <path d="M7 5.5h3v-2H7z" />
      {/* Decanter label line */}
      <path d="M7.5 12h2" />
      {/* Wine/Cocktail Glass next to it */}
      <path d="M14 9h6v4c0 1.5-1 2.5-2.5 2.5S15 14.5 15 13V9z" />
      <path d="M17.5 15.5v4.5" />
      <path d="M15.5 20h4" />
    </svg>
  );
}

function SmokeOccasionallySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Single cigarette */}
      <path d="M3 14h14v3H3z" />
      <path d="M6 14v3" />
      {/* Smoke */}
      <path d="M19 12c.5-1 1-1.5 2-1.5M18 14c.5-1 1-1.5 2-1.5" />
    </svg>
  );
}

function SmokeSociallySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Left cigarette (angled up-right) */}
      <path d="M2 17l6-6 1 1-6 6z" />
      <path d="M3.5 15.5l1 1" /> {/* filter line */}
      
      {/* Right cigarette (angled up-left) */}
      <path d="M22 17l-6-6-1 1 6 6z" />
      <path d="M20.5 15.5l-1 1" /> {/* filter line */}
      
      {/* Smoke rising from tips */}
      <path d="M9 9c0-2 .5-2.5 1-4M15 9c0-2-.5-2.5-1-4" />
    </svg>
  );
}

function SmokeRegularlySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Elegant Dunhill smoking pipe */}
      <path d="M15 9h4v4c0 2-1.5 3.5-3.5 3.5S14 15 14 13.5V9z" />
      <path d="M14 14.5H5c-1.5 0-2-1-2-2.5S4 10.5 5 10.5" />
      <path d="M3 11v3" />
      {/* Smoke */}
      <path d="M17 7c0-1.5.5-2 1-2.5M19 7c0-1.5.5-2 1-2.5" />
    </svg>
  );
}

function NonSmokingSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      <circle cx="12" cy="12" r="10" stroke={fill} />
      <path d="M18 12H6v3h12v-3z" />
      <path d="M4.93 4.93l14.14 14.14" stroke={fill} strokeWidth="1.5" />
    </svg>
  );
}

/* ── Fitness SVGs ──────────────────────────────────────────── */

function FitnessRelaxedSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Cozy Sofa/Couch */}
      <path d="M3 13V9c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v4" />
      <path d="M2 13h20v3c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-3z" />
      <path d="M6 18v2M18 18v2" />
      <path d="M12 7v6" />
    </svg>
  );
}

function FitnessCasualSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      {/* Bicycle Wheels */}
      <circle cx="5.5" cy="15.5" r="3.5" />
      <circle cx="18.5" cy="15.5" r="3.5" />
      {/* Frame */}
      <path d="M5.5 15.5l5-6.5H16l2.5 6.5" />
      <path d="M10.5 9L12.5 15.5" />
      {/* Handlebar & seat */}
      <path d="M15 9.5l1.5-2h1.5" />
      <path d="M9.5 9H12" />
    </svg>
  );
}

function FitnessActiveSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      <rect x="2" y="10" width="3" height="4" rx="1" />
      <rect x="19" y="10" width="3" height="4" rx="1" />
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" />
      <line x1="5" y1="8" x2="5" y2="16" />
      <line x1="19" y1="8" x2="19" y2="16" />
    </svg>
  );
}

function FitnessGymRatSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={a.genderIcon}>
      <rect x="1" y="9" width="2" height="6" rx="0.5" />
      <rect x="3" y="7" width="2" height="10" rx="1" />
      <rect x="19" y="7" width="2" height="10" rx="1" />
      <rect x="21" y="9" width="2" height="6" rx="0.5" />
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="3" />
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

  const PAD = ITEM_H * 2;

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
  dietary: string;
  drinking: string;
  smoking: string;
  fitness: string;
  hobbies: string[];
}

interface Props {
  initialFirstName?: string;
  initialLastName?: string;
  initialDob?: string;
  initialGender?: string;
  initialHeightCm?: number;
  initialWeightKg?: number;
  initialDietary?: string;
  initialDrinking?: string;
  initialSmoking?: string;
  initialFitness?: string;
  initialHobbies?: string[];
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
  initialDietary = "no_preference",
  initialDrinking = "sober",
  initialSmoking = "non_smoker",
  initialFitness = "not_active",
  initialHobbies = [],
  onComplete,
  onError,
}: Props) {
  /* --- sub-step state --- */
  const [sub, setSub] = useState(0);
  const [dir, setDir] = useState<"forward" | "back">("forward");

  /* --- hobbies --- */
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(initialHobbies);

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

  /* --- lifestyle details --- */
  const [dietary, setDietary] = useState(initialDietary);
  const [drinking, setDrinking] = useState(initialDrinking);
  const [smoking, setSmoking] = useState(initialSmoking);
  const [fitness, setFitness] = useState(initialFitness);

  /* --- morph --- */
  const [showMorph, setShowMorph] = useState(false);
  const [morphDir, setMorphDir] = useState<"v2h" | "h2v">("v2h");

  /* --- refs --- */
  const heightRef = useRef<HTMLDivElement>(null);
  const weightRef = useRef<HTMLDivElement>(null);

  /* resume: if name already set, jump to last sub-step */
  useEffect(() => {
    if (initialFirstName) {
      if (initialFitness && initialFitness !== "not_active") {
        setSub(9); // jump to hobbies if fitness is already set
      } else {
        setSub(8); // jump to fitness
      }
    }
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

  /* --- lifestyle pick handlers (auto advance) --- */
  const handleDietaryPick = (d: string) => {
    setDietary(d);
    setTimeout(goForward, 400);
  };

  const handleDrinkingPick = (d: string) => {
    setDrinking(d);
    setTimeout(goForward, 400);
  };

  const handleSmokingPick = (s: string) => {
    setSmoking(s);
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
      dietary,
      drinking,
      smoking,
      fitness,
      hobbies: selectedHobbies,
    });
  };

  const dayItems = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const monthItems = MONTHS;
  const yearItems = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => (MAX_YEAR - i).toString());

  const { ft, inches } = cmToFtIn(heightVal);
  const lbs = kgToLbs(weightVal);

  const heightFrac = (heightVal - MIN_CM) / (MAX_CM - MIN_CM);
  const weightFrac = (weightVal - MIN_KG) / (MAX_KG - MIN_KG);

  /* ── render sub-steps ──────────────────────────────────── */

  function renderSub() {
    switch (sub) {

      /* ─── 0: NAME ─── */
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

      /* ─── 1: DOB ─── */
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

      /* ─── 2: GENDER ─── */
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
                const accentFill = active ? "url(#accentGradGender)" : "var(--text-muted)";
                return (
                  <button
                    key={g.key}
                    className={`${a.genderBtn} ${active ? a.genderBtnActive : ""}`}
                    onClick={() => handleGenderPick(g.key)}
                    type="button"
                  >
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

      /* ─── 3: HEIGHT ─── */
      case 3:
        return (
          <div>
            <h2 className={a.rulerTitle}>How tall are you?</h2>

            <div className={a.rulerBadge}>
              <span className={a.badgeValue}>{ft}′{inches}″</span>
              <span className={a.badgeDivider}/>
              <span className={a.badgeAlt}>{heightVal} cm</span>
            </div>

            <div
              className={`${a.heightRuler} ${heightLocked ? a.rulerLocked : ""}`}
              ref={heightRef}
              onMouseMove={onHeightMouseMove}
              onClick={onHeightClick}
              onMouseLeave={onHeightMouseLeave}
              onTouchMove={onHeightTouchMove}
            >
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

              <div className={a.heightTrackArea}>
                <div className={a.heightTrack}>
                  <div className={a.heightFill} style={{ height: `${heightFrac * 100}%` }}/>
                </div>
                <div className={a.heightTicks}>
                  {Array.from({ length: MAX_CM - MIN_CM + 1 }, (_, i) => {
                    const cm = MIN_CM + i;
                    const pct = ((cm - MIN_CM) / (MAX_CM - MIN_CM)) * 100;
                    const isCurrent = heightVal === cm;
                    const isMajor = cm % 10 === 0;
                    const isMedium = cm % 5 === 0 && !isMajor;
                    const sizeClass = isMajor ? a.major : isMedium ? a.medium : a.minor;
                    return (
                      <div key={cm} style={{ position: "absolute", bottom: `${pct}%`, left: 0, right: 0 }}>
                        <div className={`${a.heightTick} ${a.left} ${sizeClass} ${isCurrent ? a.active : ""}`}/>
                        <div className={`${a.heightTick} ${a.right} ${sizeClass} ${isCurrent ? a.active : ""}`}/>
                      </div>
                    );
                  })}
                </div>
                <div className={`${a.heightThumb} ${heightLocked ? a.thumbLocked : ""}`} style={{ bottom: `${heightFrac * 100}%` }}/>
              </div>

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

      /* ─── 4: WEIGHT ─── */
      case 4:
        return (
          <div>
            <h2 className={a.rulerTitle}>What do you weigh?</h2>

            <div className={a.rulerBadge}>
              <span className={a.badgeValue}>{weightVal} kg</span>
              <span className={a.badgeDivider}/>
              <span className={a.badgeAlt}>{lbs} lbs</span>
            </div>

            <div
              className={`${a.weightRuler} ${weightLocked ? a.rulerLocked : ""}`}
              ref={weightRef}
              onMouseMove={onWeightMouseMove}
              onClick={onWeightClick}
              onMouseLeave={onWeightMouseLeave}
              onTouchMove={onWeightTouchMove}
            >
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

              <div className={a.weightTrackArea}>
                <div className={a.weightTrack}>
                  <div className={a.weightFill} style={{ width: `${weightFrac * 100}%` }}/>
                </div>
                <div className={a.weightTicks}>
                  {Array.from({ length: MAX_KG - MIN_KG + 1 }, (_, i) => {
                    const kg = MIN_KG + i;
                    const pct = ((kg - MIN_KG) / (MAX_KG - MIN_KG)) * 100;
                    const isCurrent = weightVal === kg;
                    const isMajor = kg % 10 === 0;
                    const isMedium = kg % 5 === 0 && !isMajor;
                    const sizeClass = isMajor ? a.major : isMedium ? a.medium : a.minor;
                    return (
                      <div key={kg} style={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0 }}>
                        <div className={`${a.weightTick} ${a.top} ${sizeClass} ${isCurrent ? a.active : ""}`}/>
                        <div className={`${a.weightTick} ${a.bottom} ${sizeClass} ${isCurrent ? a.active : ""}`}/>
                      </div>
                    );
                  })}
                </div>
                <div className={`${a.weightThumb} ${weightLocked ? a.thumbLocked : ""}`} style={{ left: `${weightFrac * 100}%` }}/>
              </div>

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
              <button className={a.confirmBtn} onClick={goForward} style={{ marginTop: 0 }}>
                Looks good! ✓
              </button>
            </div>
          </div>
        );

      /* ─── 5: DIETARY ─── */
      case 5:
        return (
          <div className={a.genderContent}>
            <h2 className={a.subTitle}>What is your diet?</h2>
            <p className={a.subHint}>Select your dietary preference.</p>

            <div className={a.optionGrid}>
              {([
                { key: "veg",        label: "Vegetarian",     Svg: VegSVG },
                { key: "vegan",      label: "Vegan",          Svg: VeganSVG },
                { key: "eggetarian", label: "Eggitarian",     Svg: EggetarianSVG },
                { key: "nonveg",     label: "Non-Vegetarian", Svg: NonVegSVG },
              ] as const).map(g => {
                const active = dietary === g.key;
                const accentFill = active ? "url(#accentGrad)" : "var(--text-muted)";
                return (
                  <button
                    key={g.key}
                    className={`${a.genderBtn} ${active ? a.genderBtnActive : ""}`}
                    onClick={() => handleDietaryPick(g.key)}
                    type="button"
                  >
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

      /* ─── 6: DRINKING ─── */
      case 6:
        return (
          <div className={a.genderContent}>
            <h2 className={a.subTitle}>Do you drink alcohol?</h2>
            <p className={a.subHint}>How often do you drink?</p>

            <div className={a.optionGrid}>
              {([
                { key: "sober",        label: "Sober / Never",   Svg: SoberSVG },
                { key: "occasionally", label: "Occasionally",    Svg: DrinkOccasionallySVG },
                { key: "socially",     label: "Socially",        Svg: DrinkSociallySVG },
                { key: "regularly",    label: "Regularly",       Svg: DrinkRegularlySVG },
              ] as const).map(g => {
                const active = drinking === g.key;
                const accentFill = active ? "url(#accentGrad)" : "var(--text-muted)";
                return (
                  <button
                    key={g.key}
                    className={`${a.genderBtn} ${active ? a.genderBtnActive : ""}`}
                    onClick={() => handleDrinkingPick(g.key)}
                    type="button"
                  >
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

      /* ─── 7: SMOKING ─── */
      case 7:
        return (
          <div className={a.genderContent}>
            <h2 className={a.subTitle}>Do you smoke?</h2>
            <p className={a.subHint}>How often do you smoke / vape?</p>

            <div className={a.optionGrid}>
              {([
                { key: "non_smoker",   label: "Non-smoker",     Svg: NonSmokingSVG },
                { key: "occasionally", label: "Occasionally",    Svg: SmokeOccasionallySVG },
                { key: "socially",     label: "Socially",        Svg: SmokeSociallySVG },
                { key: "regularly",    label: "Regularly",       Svg: SmokeRegularlySVG },
              ] as const).map(g => {
                const active = smoking === g.key;
                const accentFill = active ? "url(#accentGrad)" : "var(--text-muted)";
                return (
                  <button
                    key={g.key}
                    className={`${a.genderBtn} ${active ? a.genderBtnActive : ""}`}
                    onClick={() => handleSmokingPick(g.key)}
                    type="button"
                  >
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

      /* ─── 8: FITNESS ─── */
      case 8:
        return (
          <div className={a.genderContent}>
            <h2 className={a.subTitle}>How active are you?</h2>
            <p className={a.subHint}>Select your fitness and workout level.</p>

            <div className={a.optionGrid}>
              {([
                { key: "not_active",   label: "Relaxed / Chill",    Svg: FitnessRelaxedSVG },
                { key: "occasionally", label: "Casual Fitness",     Svg: FitnessCasualSVG },
                { key: "active",       label: "Active / Regular",    Svg: FitnessActiveSVG },
                { key: "gym_rat",      label: "Gym Rat / Daily",     Svg: FitnessGymRatSVG },
              ] as const).map(g => {
                const active = fitness === g.key;
                const accentFill = active ? "url(#accentGrad)" : "var(--text-muted)";
                return (
                  <button
                    key={g.key}
                    className={`${a.genderBtn} ${active ? a.genderBtnActive : ""}`}
                    onClick={() => {
                      setFitness(g.key);
                      setTimeout(goForward, 400);
                    }}
                    type="button"
                  >
                    <g.Svg fill={accentFill} />
                    <span className={a.genderName}>{g.label}</span>
                  </button>
                );
              })}
            </div>

            <div className={a.navRow}>
              <button className={a.navBack} onClick={goBack}>← Back</button>
              <div />
            </div>
          </div>
        );

      /* ─── 9: HOBBIES ─── */
      case 9:
        return (
          <div className={a.genderContent} style={{ width: "100%" }}>
            <h2 className={a.subTitle}>Choose your vibe</h2>
            <p className={a.subHint}>Pick 3 hobbies that represent you best.</p>

            <div className={s.vibeGrid} style={{ width: "100%" }}>
              {HOBBIES_LIST.map((hobby) => {
                const isSelected = selectedHobbies.includes(hobby.name);
                const isMax = selectedHobbies.length >= 3 && !isSelected;
                return (
                  <button
                    key={hobby.name}
                    type="button"
                    disabled={isMax}
                    className={`${s.vibeCard} ${isSelected ? s.vibeCardActive : ""} ${isMax ? s.vibeCardDisabled : ""}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedHobbies(selectedHobbies.filter((h) => h !== hobby.name));
                      } else if (selectedHobbies.length < 3) {
                        setSelectedHobbies([...selectedHobbies, hobby.name]);
                      }
                    }}
                  >
                    <span className={s.vibeEmoji}>{hobby.emoji}</span>
                    <span className={s.vibeName}>{hobby.name}</span>
                    {isSelected && <span className={s.vibeCheck}>✓</span>}
                  </button>
                );
              })}
            </div>

            <div className={s.vibeCounter}>
              <div className={s.vibeCounterDots}>
                {[0, 1, 2].map(i => (
                  <div key={i} className={`${s.vibeCounterDot} ${i < selectedHobbies.length ? s.vibeCounterDotFilled : ""}`} />
                ))}
              </div>
              <span className={s.vibeCounterText}>{selectedHobbies.length} / 3</span>
            </div>

            <div className={a.navRow}>
              <button className={a.navBack} onClick={goBack}>← Back</button>
              <button
                className={a.confirmBtn}
                onClick={handleComplete}
                disabled={selectedHobbies.length !== 3}
                style={{ marginTop: 0 }}
              >
                Continue →
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
      <svg width="0" height="0" style={{ position: "absolute", visibility: "hidden" }}>
        <defs>
          <linearGradient id="accentGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(340,82%,55%)" />
            <stop offset="100%" stopColor="hsl(255,65%,60%)" />
          </linearGradient>
          <linearGradient id="accentGradGender" x1="0" y1="0" x2="80" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(340,82%,55%)" />
            <stop offset="100%" stopColor="hsl(255,65%,60%)" />
          </linearGradient>
        </defs>
      </svg>
      {/* progress dots */}
      <div className={a.dotRow}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i, idx) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className={`${a.dot} ${i === sub ? a.dotActive : i < sub ? a.dotComplete : ""}`}/>
            {idx < 9 && (
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
