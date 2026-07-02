"use client";

import { useState, useEffect, useRef, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import s from "./dashboard.module.css";
import SplashLoader from "@/components/SplashLoader";

// Minimal Icons
function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// Preference SVG Icons
function MaleSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 80 120" fill={fill} className={s.genderIcon}>
      <circle cx="40" cy="18" r="13"/>
      <path d="M20 46 Q20 34 30 34 L50 34 Q60 34 60 46 L57 82 Q56 87 51 87 L29 87 Q24 87 23 82 Z"/>
      <rect x="25" y="89" width="11" height="28" rx="5"/>
      <rect x="44" y="89" width="11" height="28" rx="5"/>
    </svg>
  );
}

function FemaleSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 80 120" fill={fill} className={s.genderIcon}>
      <circle cx="40" cy="18" r="13"/>
      <path d="M28 46 Q28 34 34 34 L46 34 Q52 34 52 46 L54 60 Q54 65 48 68 L52 87 Q53 90 48 90 L32 90 Q27 90 28 87 L32 68 Q26 65 26 60 Z"/>
      <rect x="29" y="92" width="10" height="26" rx="5"/>
      <rect x="41" y="92" width="10" height="26" rx="5"/>
    </svg>
  );
}

function EveryoneSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 100 120" fill={fill} className={s.genderIcon}>
      {/* Figure 1 (Left, Female-ish) */}
      <g opacity="0.8" transform="translate(-8, 5) scale(0.9)">
        <circle cx="35" cy="18" r="12"/>
        <path d="M25 44 Q25 34 31 34 L39 34 Q45 34 45 44 L47 56 Q47 60 42 63 L45 78 Q46 81 41 81 L29 81 Q24 81 25 78 L29 63 Q23 60 23 56 Z"/>
      </g>
      {/* Figure 2 (Right, Male-ish) */}
      <g opacity="0.8" transform="translate(18, 5) scale(0.9)">
        <circle cx="45" cy="18" r="12"/>
        <path d="M29 44 Q29 34 37 34 L49 34 Q57 34 57 44 L55 74 Q54 78 50 78 L34 78 Q30 78 29 74 Z"/>
      </g>
      {/* Figure 3 (Center, Foreground) */}
      <g transform="translate(5, 0)">
        <circle cx="40" cy="18" r="13"/>
        <path d="M24 46 Q24 34 32 34 L48 34 Q56 34 56 46 L53 82 Q52 87 47 87 L33 87 Q28 87 27 82 Z"/>
      </g>
    </svg>
  );
}

function VegSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 1.35 4.3 0 10a8.9 8.9 0 0 1-8 8z" />
      <path d="M19 2c-2.26 4.33-5.27 7.14-8 10" />
    </svg>
  );
}

function NonVegSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      <path d="M16 3c-2.5 0-5 1.5-6.5 3.5C8 8.5 7.5 11 8 13.5l-5.5 5.5c-.8.8-.8 2 0 2.8.8.8 2 .8 2.8 0L10.8 16c2.5.5 5 0 7-1.5 2-1.5 3.5-4 3.5-6.5C21.3 5 19 3 16 3z" />
      <circle cx="16" cy="8" r="2" fill={fill} />
    </svg>
  );
}

function VeganSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      <path d="M2 22c1.25-3.87 3.55-7.07 6.55-9" />
      <path d="M8.5 13C12 9 17 8 22 6c-1 5-4.5 9.5-8.5 12.5" />
      <path d="M11 15.5c-2.5 1-4.7 2.8-6 5.5" />
      <path d="M16.5 11.5c1-2.5 2.5-4.5 4.5-6" />
    </svg>
  );
}

function DietNoPrefSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      <path d="M6 3v7a3 3 0 0 0 6 0V3M9 3v7" />
      <path d="M18 3v13h-3v5" />
      <path d="M9 13v8" />
    </svg>
  );
}

function DrinkingSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      <path d="M5 3h14l-7 8-7-8z" />
      <path d="M12 11v9" />
      <path d="M8 20h8" />
      <circle cx="12" cy="6" r="1" fill={fill} />
    </svg>
  );
}

function SoberSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}

function DrinkNoPrefSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      {/* Martini glass on the left */}
      <path d="M4 6h6l-3 3.5-3-3.5z" />
      <path d="M7 9.5v5.5" />
      <path d="M5 15h4" />
      
      {/* Water droplet on the right */}
      <path d="M17 17a3 3 0 0 0 3-3c0-1.85-3-4.71-3-4.71S14 12.15 14 14a3 3 0 0 0 3 3z" />
    </svg>
  );
}

function DrinkSociallySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      {/* Left Mug */}
      <path d="M4 8h5v9H4V8z" />
      <path d="M4 10H2v4h2" />
      <line x1="4" y1="11" x2="9" y2="11" />
      <path d="M3.5 8c0-1 1-1.5 2-1s1 .5 1.5 0 1-.5 2 0S10 8 9.5 8" />

      {/* Right Mug */}
      <path d="M15 8h5v9h-5V8z" />
      <path d="M20 10h2v4h-2" />
      <line x1="15" y1="11" x2="20" y2="11" />
      <path d="M14.5 8c0-1 1-1.5 2-1s1 .5 1.5 0 1-.5 2 0S21 8 20.5 8" />

      {/* Splashes */}
      <path d="M11.5 4.5l1-1M13.5 4.5l-1-1" />
    </svg>
  );
}

function SmokingSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      <path d="M18 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h15" />
      <path d="M14 12v4" />
      <path d="M18 12c1.5 0 2 1 2 2s-.5 2-2 2" />
      <path d="M22 8c-1-1.5-2-1.5-2 0s-1 1.5-2 0" />
    </svg>
  );
}

function SmokeOccasionallySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      {/* Single cigarette */}
      <path d="M3 14h14v3H3z" />
      <path d="M6 14v3" />
      {/* Smoke */}
      <path d="M19 12c.5-1 1-1.5 2-1.5M18 14c.5-1 1-1.5 2-1.5" />
    </svg>
  );
}

function SmokeRegularlySVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      {/* Elegant pipe */}
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
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      <circle cx="12" cy="12" r="10" stroke={fill} />
      <path d="M18 12H6v3h12v-3z" />
      <path d="M4.93 4.93l14.14 14.14" stroke={fill} strokeWidth="1.5" />
    </svg>
  );
}

function SmokeNoPrefSVG({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={s.prefIcon}>
      <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14a7 7 0 0 0-13.78 1.86 5 5 0 0 0 6.5 7h10" />
    </svg>
  );
}

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
];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isFirstMatch, setIsFirstMatch] = useState(true);

  // Match State Machine
  const [dashboardState, setDashboardState] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any | null>(null);

  // Master Dashboard States (State 0)
  const [myFirstName, setMyFirstName] = useState("");
  const [myLastName, setMyLastName] = useState("");
  const [myDob, setMyDob] = useState("");
  const [myGender, setMyGender] = useState("male");
  const [myHeightCm, setMyHeightCm] = useState(170);
  const [myWeightKg, setMyWeightKg] = useState(65);
  const [myPhotoUrl, setMyPhotoUrl] = useState("");
  const [myPhotoSignedUrl, setMyPhotoSignedUrl] = useState("");
  const [myDietary, setMyDietary] = useState("no_preference");
  const [myDrinking, setMyDrinking] = useState("sober");
  const [mySmoking, setMySmoking] = useState("non_smoker");
  const [myFitness, setMyFitness] = useState("not_active");
  const [myHobbies, setMyHobbies] = useState<string[]>([]);
  const [matchStatus, setMatchStatus] = useState<"none" | "searching" | "matched" | "feedback" | "unpaid">("none");

  // Profile Edit Modal States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("male");
  const [editHeightCm, setEditHeightCm] = useState(170);
  const [editWeightKg, setEditWeightKg] = useState(65);
  const [editDietary, setEditDietary] = useState("no_preference");
  const [editDrinking, setEditDrinking] = useState("sober");
  const [editSmoking, setEditSmoking] = useState("non_smoker");
  const [editFitness, setEditFitness] = useState("not_active");
  const [editHobbies, setEditHobbies] = useState<string[]>([]);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoDataUrl, setEditPhotoDataUrl] = useState("");
  const [editScale, setEditScale] = useState(1.0);
  const [editOffset, setEditOffset] = useState({ x: 0, y: 0 });
  const [editIsDragging, setEditIsDragging] = useState(false);
  const [editDragStart, setEditDragStart] = useState({ x: 0, y: 0 });
  const [editPhotoLoading, setEditPhotoLoading] = useState(false);

  // State 1: Search Preferences
  const [prefSlide, setPrefSlide] = useState(1);
  const [prefGender, setPrefGender] = useState<"male" | "female" | "everyone">("everyone");
  const [prefAgeMin, setPrefAgeMin] = useState(20);
  const [prefAgeMax, setPrefAgeMax] = useState(26);
  const [prefHeightNoPref, setPrefHeightNoPref] = useState(false);
  const [prefHeightMinCm, setPrefHeightMinCm] = useState(152);
  const [prefHeightMaxCm, setPrefHeightMaxCm] = useState(198);
  const [prefDietary, setPrefDietary] = useState("no_preference");
  const [prefDrinking, setPrefDrinking] = useState("no_preference");
  const [prefSmoking, setPrefSmoking] = useState("no_preference");
  const [requestId, setRequestId] = useState<string | null>(null);

  // Transition & range slider dragging states
  const [slideDir, setSlideDir] = useState<"forward" | "back">("forward");
  const [showMorph, setShowMorph] = useState(false);
  const [morphDir, setMorphDir] = useState<"v2h" | "h2v">("h2v");
  const [dragHeightActive, setDragHeightActive] = useState<"min" | "max" | null>(null);
  const [dragAgeActive, setDragAgeActive] = useState<"min" | "max" | null>(null);

  // Range Slider Refs and constants
  const heightRef = useRef<HTMLDivElement>(null);
  const ageRef = useRef<HTMLDivElement>(null);
  const editImgRef = useRef<HTMLImageElement>(null);
  const editContainerRef = useRef<HTMLDivElement>(null);

  const MIN_CM = 122;
  const MAX_CM = 213;

  const cmToFtIn = (cm: number) => {
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    let inches = Math.round(totalInches % 12);
    if (inches === 12) {
      return { ft: ft + 1, inches: 0 };
    }
    return { ft, inches };
  };

  const changePrefSlide = (targetSlide: number) => {
    setActionError("");
    const currentSlide = prefSlide;

    if (targetSlide > currentSlide) {
      setSlideDir("forward");
    } else {
      setSlideDir("back");
    }

    // Morph animation check between Age (Slide 2) <-> Height (Slide 3)
    if (currentSlide === 2 && targetSlide === 3) {
      setMorphDir("h2v");
      setShowMorph(true);
      setTimeout(() => {
        setShowMorph(false);
        setPrefSlide(3);
      }, 580);
      return;
    }

    if (currentSlide === 3 && targetSlide === 2) {
      setMorphDir("v2h");
      setShowMorph(true);
      setTimeout(() => {
        setShowMorph(false);
        setPrefSlide(2);
      }, 580);
      return;
    }

    setPrefSlide(targetSlide);
  };

  const handleHeightStartDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!heightRef.current) return;
    const rect = heightRef.current.getBoundingClientRect();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const frac = 1 - (clientY - rect.top) / rect.height;
    const clampedFrac = Math.max(0, Math.min(1, frac));
    const cm = Math.round(MIN_CM + clampedFrac * (MAX_CM - MIN_CM));

    // Determine closer thumb
    const distMin = Math.abs(cm - prefHeightMinCm);
    const distMax = Math.abs(cm - prefHeightMaxCm);
    const target = distMin < distMax ? "min" : "max";

    setDragHeightActive(target);
    setPrefHeightNoPref(false); // dragging automatically opts-in

    if (target === "min") {
      setPrefHeightMinCm(Math.min(cm, prefHeightMaxCm - 1));
    } else {
      setPrefHeightMaxCm(Math.max(cm, prefHeightMinCm + 1));
    }
  };

  useEffect(() => {
    if (!dragHeightActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!heightRef.current) return;
      const rect = heightRef.current.getBoundingClientRect();
      const frac = 1 - (e.clientY - rect.top) / rect.height;
      const clampedFrac = Math.max(0, Math.min(1, frac));
      const cm = Math.round(MIN_CM + clampedFrac * (MAX_CM - MIN_CM));

      if (dragHeightActive === "min") {
        setPrefHeightMinCm(Math.min(cm, prefHeightMaxCm - 1));
      } else {
        setPrefHeightMaxCm(Math.max(cm, prefHeightMinCm + 1));
      }
    };

    const handleMouseUp = () => {
      setDragHeightActive(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragHeightActive, prefHeightMinCm, prefHeightMaxCm]);

  useEffect(() => {
    if (!dragHeightActive) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!heightRef.current || e.touches.length === 0) return;
      const rect = heightRef.current.getBoundingClientRect();
      const frac = 1 - (e.touches[0].clientY - rect.top) / rect.height;
      const clampedFrac = Math.max(0, Math.min(1, frac));
      const cm = Math.round(MIN_CM + clampedFrac * (MAX_CM - MIN_CM));

      if (dragHeightActive === "min") {
        setPrefHeightMinCm(Math.min(cm, prefHeightMaxCm - 1));
      } else {
        setPrefHeightMaxCm(Math.max(cm, prefHeightMinCm + 1));
      }
    };

    const handleTouchEnd = () => {
      setDragHeightActive(null);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragHeightActive, prefHeightMinCm, prefHeightMaxCm]);

  const handleAgeStartDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ageRef.current) return;
    const rect = ageRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const frac = (clientX - rect.left) / rect.width;
    const clampedFrac = Math.max(0, Math.min(1, frac));
    const age = 18 + clampedFrac * 12; // range 18 to 30 is 12 broad

    const distMin = Math.abs(age - prefAgeMin);
    const distMax = Math.abs(age - prefAgeMax);
    const target = distMin < distMax ? "min" : "max";

    setDragAgeActive(target);

    if (target === "min") {
      setPrefAgeMin(Math.min(age, prefAgeMax - 1));
    } else {
      setPrefAgeMax(Math.max(age, prefAgeMin + 1));
    }
  };

  useEffect(() => {
    // Keep age state clamped between 18 and 30
    if (prefAgeMin > 30) setPrefAgeMin(30);
    if (prefAgeMax > 30) setPrefAgeMax(30);
    if (prefAgeMin < 18) setPrefAgeMin(18);
    if (prefAgeMax < 18) setPrefAgeMax(18);
  }, [prefAgeMin, prefAgeMax]);

  useEffect(() => {
    if (!dragAgeActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ageRef.current) return;
      const rect = ageRef.current.getBoundingClientRect();
      const frac = (e.clientX - rect.left) / rect.width;
      const clampedFrac = Math.max(0, Math.min(1, frac));
      const age = 18 + clampedFrac * 12;

      if (dragAgeActive === "min") {
        setPrefAgeMin(Math.min(age, prefAgeMax - 1));
      } else {
        setPrefAgeMax(Math.max(age, prefAgeMin + 1));
      }
    };

    const handleMouseUp = () => {
      setDragAgeActive(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragAgeActive, prefAgeMin, prefAgeMax]);

  useEffect(() => {
    if (!dragAgeActive) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!ageRef.current || e.touches.length === 0) return;
      const rect = ageRef.current.getBoundingClientRect();
      const frac = (e.touches[0].clientX - rect.left) / rect.width;
      const clampedFrac = Math.max(0, Math.min(1, frac));
      const age = 18 + clampedFrac * 12;

      if (dragAgeActive === "min") {
        setPrefAgeMin(Math.min(age, prefAgeMax - 1));
      } else {
        setPrefAgeMax(Math.max(age, prefAgeMin + 1));
      }
    };

    const handleTouchEnd = () => {
      setDragAgeActive(null);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragAgeActive, prefAgeMin, prefAgeMax]);

  // State 2: Searching Timer
  const [countdownText, setCountdownText] = useState("7d 00h 00m 00s");

  // State 3: Active Match & Chat
  const [chatCountdownText, setChatCountdownText] = useState("48:00:00");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [userWantsMeet, setUserWantsMeet] = useState(false);
  const [partnerWantsMeet, setPartnerWantsMeet] = useState(false);
  const [userSharesPhoto, setUserSharesPhoto] = useState(false);
  const [partnerSharesPhoto, setPartnerSharesPhoto] = useState(false);
  const [userSharesName, setUserSharesName] = useState(false);
  const [partnerSharesName, setPartnerSharesName] = useState(false);
  
  // State 3: Date Planning
  const [dateProposed, setDateProposed] = useState("");
  const [timeProposed, setTimeProposed] = useState("");
  const [locationProposed, setLocationProposed] = useState("");
  const [proposalStatus, setProposalStatus] = useState<"none" | "pending_them" | "pending_me" | "confirmed">("none");
  const [currentProposal, setCurrentProposal] = useState<any | null>(null);

  // State 4: Feedback
  const [feedbackAttended, setFeedbackAttended] = useState<boolean>(true);
  const [feedbackVibeRating, setFeedbackVibeRating] = useState(3);
  const [feedbackConversationRating, setFeedbackConversationRating] = useState(3);
  const [feedbackWouldMeet, setFeedbackWouldMeet] = useState<"yes" | "maybe" | "no">("maybe");
  const [feedbackComments, setFeedbackComments] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  // Timer Refs for clean interval management
  const searchingIntervalRef = useRef<any>(null);
  const chatIntervalRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (searchingIntervalRef.current) clearInterval(searchingIntervalRef.current);
      if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    };
  }, []);

  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);


  // 1. Fetch User and Active Requests on Mount
  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/auth";
        return;
      }

      setUserId(session.user.id);
      
      // Load User info
      const { data: userRecord } = await supabase
        .from("users")
        .select("first_name, last_name, is_onboarding_complete, university_id, universities(name), date_of_birth, gender, height_cm, weight_kg")
        .eq("id", session.user.id)
        .single();

      if (!userRecord?.is_onboarding_complete) {
        window.location.href = "/onboarding";
        return;
      }

      const fullName = `${userRecord.first_name || ""} ${userRecord.last_name || ""}`.trim();
      setUserName(fullName || "User");
      setUniversityName((userRecord.universities as any)?.name || "Campus");

      // Load Profile
      const { data: profileRecord } = await supabase
        .from("profiles")
        .select("photo_url, dietary, drinking, smoking, fitness, hobbies")
        .eq("user_id", session.user.id)
        .single();

      if (userRecord) {
        setMyFirstName(userRecord.first_name || "");
        setMyLastName(userRecord.last_name || "");
        setMyDob(userRecord.date_of_birth || "");
        setMyGender(userRecord.gender || "male");
        setMyHeightCm(userRecord.height_cm || 170);
        setMyWeightKg(userRecord.weight_kg || 65);
      }
      if (profileRecord) {
        setMyPhotoUrl(profileRecord.photo_url || "");
        setMyDietary(profileRecord.dietary || "no_preference");
        setMyDrinking(profileRecord.drinking || "sober");
        setMySmoking(profileRecord.smoking || "non_smoker");
        setMyFitness(profileRecord.fitness || "not_active");
        setMyHobbies(profileRecord.hobbies || []);

        if (profileRecord.photo_url) {
          const { data: signedData } = await supabase.storage
            .from("photos")
            .createSignedUrl(profileRecord.photo_url, 3600 * 24);
          if (signedData?.signedUrl) {
            setMyPhotoSignedUrl(signedData.signedUrl);
          }
        }
      }

      // Load Wallet
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", session.user.id)
        .single();
      if (wallet) setWalletBalance(parseFloat(wallet.balance as any));

      // Check if this is the user's first paid match search request
      const { count: paidCount, error: countError } = await supabase
        .from("match_requests")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .not("status", "eq", "unpaid");

      if (!countError && paidCount !== null) {
        setIsFirstMatch(paidCount === 0);
      }

      await refreshMatchStatus(session.user.id);
      setLoading(false);
    }
    loadDashboard();
  }, [supabase, router]);

  // Realtime subscription for chat messages, meet toggles, and date proposals
  useEffect(() => {
    if (!activeMatch?.id || !userId) return;

    console.log("Subscribing to realtime channels for match:", activeMatch.id);
    const channel = supabase
      .channel(`match:${activeMatch.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${activeMatch.id}`,
        },
        (payload) => {
          console.log("Realtime message received:", payload.new);
          setChatMessages((prev) => {
            if (prev.some((msg) => msg.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${activeMatch.id}`,
        },
        (payload) => {
          console.log("Realtime match update received:", payload.new);
          setActiveMatch(payload.new);
          const isUserA = payload.new.user_a_id === userId;
          setUserWantsMeet(isUserA ? payload.new.user_a_wants_meet : payload.new.user_b_wants_meet);
          setPartnerWantsMeet(isUserA ? payload.new.user_b_wants_meet : payload.new.user_a_wants_meet);
          setUserSharesPhoto(isUserA ? payload.new.user_a_shares_photo : payload.new.user_b_shares_photo);
          setPartnerSharesPhoto(isUserA ? payload.new.user_b_shares_photo : payload.new.user_a_shares_photo);
          setUserSharesName(isUserA ? payload.new.user_a_shares_name : payload.new.user_b_shares_name);
          setPartnerSharesName(isUserA ? payload.new.user_b_shares_name : payload.new.user_a_shares_name);

          loadPartnerDetails(payload.new, userId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "date_proposals",
          filter: `match_id=eq.${activeMatch.id}`,
        },
        (payload) => {
          console.log("Realtime date proposal event:", payload);
          loadDateProposal(activeMatch.id, userId);
        }
      )
      .subscribe();

    return () => {
      console.log("Unsubscribing from realtime channels for match:", activeMatch.id);
      supabase.removeChannel(channel);
    };
  }, [activeMatch?.id, userId, supabase]);

  // Refresh match status machine
  const refreshMatchStatus = async (uid: string) => {
    const { data: request } = await supabase
      .from("match_requests")
      .select("*")
      .eq("user_id", uid)
      .in("status", ["unpaid", "active", "matched"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!request) {
      // Check if there is an active match pending feedback
      const { data: completedMatch } = await supabase
        .from("matches")
        .select("*")
        .or(`user_a_id.eq.${uid},user_b_id.eq.${uid}`)
        .eq("status", "active")
        .maybeSingle();

      if (completedMatch) {
        // Date timer passed or manually completed, need feedback
        setActiveMatch(completedMatch);
        setMatchStatus("feedback");
      } else {
        setMatchStatus("none");
      }
      return;
    }

    setActiveRequest(request);
    setRequestId(request.id);

    if (request.status === "unpaid") {
      setMatchStatus("unpaid");
      // Pre-fill fields from request
      setPrefGender(request.pref_gender);
      setPrefAgeMin(Math.max(18, Math.min(30, request.pref_age_min)));
      setPrefAgeMax(Math.max(18, Math.min(30, request.pref_age_max)));
      setPrefHeightNoPref(false);
      setPrefHeightMinCm(request.pref_height_min_cm || 152);
      setPrefHeightMaxCm(request.pref_height_max_cm || 198);
      setPrefDietary(request.pref_dietary);
      setPrefDrinking(request.pref_drinking);
      setPrefSmoking(request.pref_smoking);
    } else if (request.status === "active") {
      setMatchStatus("searching");
      startSearchingCountdown(request.expires_at);
    } else if (request.status === "matched") {
      // Find the associated match details
      const { data: match } = await supabase
        .from("matches")
        .select("*")
        .or(`request_a_id.eq.${request.id},request_b_id.eq.${request.id}`)
        .in("status", ["active", "date_planned", "date_confirmed"])
        .single();

      if (match) {
        const isChatExpired = new Date(match.chat_expires_at).getTime() < Date.now();
        if (isChatExpired) {
          setActiveMatch(match);
          setMatchStatus("feedback");
          return;
        }

        setActiveMatch(match);
        setMatchStatus("matched");

        const isUserA = match.user_a_id === uid;
        setUserWantsMeet(isUserA ? match.user_a_wants_meet : match.user_b_wants_meet);
        setPartnerWantsMeet(isUserA ? match.user_b_wants_meet : match.user_a_wants_meet);
        setUserSharesPhoto(isUserA ? match.user_a_shares_photo : match.user_b_shares_photo);
        setPartnerSharesPhoto(isUserA ? match.user_b_shares_photo : match.user_a_shares_photo);
        setUserSharesName(isUserA ? match.user_a_shares_name : match.user_b_shares_name);
        setPartnerSharesName(isUserA ? match.user_b_shares_name : match.user_a_shares_name);

        await loadPartnerDetails(match, uid);

        // Start Chat countdown
        startChatCountdown(match.chat_expires_at);
        // Load messages
        await loadMessages(match.id);
        // Load proposal
        await loadDateProposal(match.id, uid);
      } else {
        setMatchStatus("searching");
        startSearchingCountdown(request.expires_at);
      }
    }
  };

  // 2. State 2 countdown timer
  const startSearchingCountdown = (expiryStr: string) => {
    if (searchingIntervalRef.current) {
      clearInterval(searchingIntervalRef.current);
    }
    const expiry = new Date(expiryStr).getTime();
    searchingIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const diff = expiry - now;
      if (diff <= 0) {
        if (searchingIntervalRef.current) {
          clearInterval(searchingIntervalRef.current);
          searchingIntervalRef.current = null;
        }
        setCountdownText("Search Expired");
        refreshMatchStatus(userId!);
      } else {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((diff % (60 * 1000)) / 1000);
        setCountdownText(`${days}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`);
      }
    }, 1000);
  };

  // 3. State 3 Chat countdown
  const startChatCountdown = (expiryStr: string) => {
    if (chatIntervalRef.current) {
      clearInterval(chatIntervalRef.current);
    }
    const expiry = new Date(expiryStr).getTime();
    
    // If the expiry is more than 30 days in the future, display infinite time for development
    if (expiry - Date.now() > 30 * 24 * 60 * 60 * 1000) {
      setChatCountdownText("∞ (No Expiry)");
      return;
    }

    chatIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const diff = expiry - now;
      if (diff <= 0) {
        if (chatIntervalRef.current) {
          clearInterval(chatIntervalRef.current);
          chatIntervalRef.current = null;
        }
        setChatCountdownText("00:00:00");
        refreshMatchStatus(userId!);
      } else {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((diff % (60 * 1000)) / 1000);
        setChatCountdownText(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);
  };

  const loadMessages = async (matchId: string) => {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });
    if (msgs) setChatMessages(msgs);
  };

  const loadPartnerDetails = async (match: any, uid: string) => {
    const isUserA = match.user_a_id === uid;
    const partnerId = isUserA ? match.user_b_id : match.user_a_id;
    const isPhotoShared = isUserA ? match.user_b_shares_photo : match.user_a_shares_photo;
    const isNameShared = isUserA ? match.user_b_shares_name : match.user_a_shares_name;

    console.log("loadPartnerDetails stats:", {
      matchId: match.id,
      isUserA,
      partnerId,
      isNameShared,
      isPhotoShared,
      user_a_shares_name: match.user_a_shares_name,
      user_b_shares_name: match.user_b_shares_name,
      user_a_shares_photo: match.user_a_shares_photo,
      user_b_shares_photo: match.user_b_shares_photo
    });

    // Fetch partner details
    const { data: partner, error: partnerErr } = await supabase
      .from("users")
      .select("first_name, last_name, date_of_birth, universities(name)")
      .eq("id", partnerId)
      .single();

    if (partnerErr) {
      console.error("loadPartnerDetails: error fetching partner from users:", partnerErr);
    }

    const { data: partnerProfileData, error: profileErr } = await supabase
      .from("profiles")
      .select("hobbies, photo_url")
      .eq("user_id", partnerId)
      .single();

    if (profileErr) {
      console.error("loadPartnerDetails: error fetching partner from profiles:", profileErr);
    }

    let partnerName = "Your Blind Date";
    let partnerAge = 21;
    let partnerUni = "Same Campus";
    let partnerHobbies = ["Hobbies Hidden"];
    let partnerPhotoUrl = "";

    if (partner) {
      if (isNameShared) {
        partnerName = `${partner.first_name || ""} ${partner.last_name || ""}`.trim() || "Your Blind Date";
      } else {
        partnerName = "Your Blind Date";
      }
      if (partner.date_of_birth) {
        const dob = new Date(partner.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        partnerAge = age;
      }
      partnerUni = (partner.universities as any)?.name || "Same Campus";
    }

    if (partnerProfileData) {
      partnerHobbies = partnerProfileData.hobbies || ["Hobbies Hidden"];
      if (isPhotoShared && partnerProfileData.photo_url) {
        const { data: signedData } = await supabase.storage
          .from("photos")
          .createSignedUrl(partnerProfileData.photo_url, 3600);
        if (signedData?.signedUrl) {
          partnerPhotoUrl = signedData.signedUrl;
        }
      }
    }

    setPartnerProfile({
      firstName: partnerName,
      rawFirstName: partner?.first_name || "",
      age: partnerAge,
      university: partnerUni,
      hobbies: partnerHobbies,
      compatibility: match.compatibility_score || 55,
      photoUrl: partnerPhotoUrl,
    });
  };

  const loadDateProposal = async (matchId: string, uid: string) => {
    const { data: proposal } = await supabase
      .from("date_proposals")
      .select("*")
      .eq("match_id", matchId)
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (proposal) {
      setCurrentProposal(proposal);
      if (proposal.status === "approved") {
        setProposalStatus("confirmed");
      } else {
        setProposalStatus(proposal.proposed_by === uid ? "pending_them" : "pending_me");
      }
    } else {
      setProposalStatus("none");
    }
  };

  // 4. Save preferences & checkout (State 1 triggers)
  const handleSavePreferences = async () => {
    setActionError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/match/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefGender,
          prefAgeMin: Math.round(prefAgeMin),
          prefAgeMax: Math.round(prefAgeMax),
          prefHeightMinCm: prefHeightNoPref ? null : prefHeightMinCm,
          prefHeightMaxCm: prefHeightNoPref ? null : prefHeightMaxCm,
          prefDietary,
          prefDrinking,
          prefSmoking,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequestId(data.requestId);
        setPrefSlide(7); // Go to checkout slide
      } else {
        setActionError(data.message || "Failed to save preferences.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (!requestId) return;
    setActionError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/match/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        setWalletBalance(data.newBalance);
        setDashboardState(0);
        await refreshMatchStatus(userId!);
      } else {
        setActionError(data.message || "Payment processing failed.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpayPay = async () => {
    console.log("handleRazorpayPay called! Current state:", {
      requestId,
      windowRazorpayExists: typeof (window as any).Razorpay !== "undefined",
      submitting
    });

    if (!requestId) {
      console.warn("handleRazorpayPay: Cannot proceed because requestId is missing (null/undefined).");
      setActionError("Internal error: Request ID is missing. Please refresh and try again.");
      return;
    }

    setActionError("");

    if (typeof (window as any).Razorpay === "undefined") {
      setActionError("Razorpay payment gateway failed to load. Please check your internet connection or disable ad-blockers.");
      console.error("Razorpay SDK not found on window object.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create order on backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.message || "Failed to create payment order.");
        setSubmitting(false);
        return;
      }

      // 2. Open Razorpay checkout modal
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "BlindSide",
        description: "Campus Match Search Fee",
        order_id: data.orderId,
        handler: async (response: any) => {
          setSubmitting(true);
          try {
            // 3. Verify signature on backend
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                requestId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setWalletBalance(verifyData.newBalance);
              setDashboardState(0);
              await refreshMatchStatus(userId!);
            } else {
              setActionError(verifyData.message || "Payment verification failed.");
            }
          } catch (err: any) {
            console.error("Payment verification failed:", err);
            setActionError("Payment verification network error.");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: userName,
        },
        theme: {
          color: "#e83a72",
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Failed to initiate Razorpay checkout:", err);
      setActionError("Failed to initiate Razorpay payment.");
      setSubmitting(false);
    }
  };


  // Chat Actions
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeMatch) return;

    const text = newMessageText.trim();
    setNewMessageText("");

    // optimistic update
    const tempMsg = {
      id: Math.random().toString(),
      sender_id: userId,
      content: text,
      created_at: new Date().toISOString(),
    };
    setChatMessages([...chatMessages, tempMsg]);

    const { error } = await supabase.from("messages").insert({
      match_id: activeMatch.id,
      sender_id: userId,
      content: text,
    });

    if (error) {
      console.error("Failed to send message:", error);
    } else {
      await loadMessages(activeMatch.id);
    }
  };

  const handleToggleMeet = async () => {
    if (!activeMatch) return;
    const nextVal = !userWantsMeet;
    setUserWantsMeet(nextVal);

    // Call Supabase update matches table directly since user is authenticated
    const isUserA = activeMatch.user_a_id === userId;
    const updateObj: any = {};
    if (isUserA) updateObj.user_a_wants_meet = nextVal;
    else updateObj.user_b_wants_meet = nextVal;

    const { error } = await supabase
      .from("matches")
      .update(updateObj)
      .eq("id", activeMatch.id);

    if (error) {
      console.error("Meet toggle error:", error);
      setUserWantsMeet(!nextVal); // rollback
    } else {
      // Check if both want to meet
      const { data: updatedMatch } = await supabase
        .from("matches")
        .select("*")
        .eq("id", activeMatch.id)
        .single();
      if (updatedMatch) {
        setActiveMatch(updatedMatch);
        setPartnerWantsMeet(isUserA ? updatedMatch.user_b_wants_meet : updatedMatch.user_a_wants_meet);
      }
    }
  };

  const handleSharePhoto = async () => {
    if (!activeMatch || !userId) return;
    const isUserA = activeMatch.user_a_id === userId;
    const updateObj: any = {};
    const nextVal = !userSharesPhoto;

    if (isUserA) updateObj.user_a_shares_photo = nextVal;
    else updateObj.user_b_shares_photo = nextVal;

    setUserSharesPhoto(nextVal);

    const { data: updatedMatch, error } = await supabase
      .from("matches")
      .update(updateObj)
      .eq("id", activeMatch.id)
      .select()
      .single();

    if (error) {
      console.error("Error sharing photo:", error);
      setUserSharesPhoto(!nextVal); // rollback
    } else {
      setActiveMatch(updatedMatch);
      await loadPartnerDetails(updatedMatch, userId);
    }
  };

  const handleShareName = async () => {
    if (!activeMatch || !userId) return;
    const isUserA = activeMatch.user_a_id === userId;
    const updateObj: any = {};
    const nextVal = !userSharesName;

    if (isUserA) updateObj.user_a_shares_name = nextVal;
    else updateObj.user_b_shares_name = nextVal;

    setUserSharesName(nextVal);

    const { data: updatedMatch, error } = await supabase
      .from("matches")
      .update(updateObj)
      .eq("id", activeMatch.id)
      .select()
      .single();

    if (error) {
      console.error("Error sharing name:", error);
      setUserSharesName(!nextVal); // rollback
    } else {
      setActiveMatch(updatedMatch);
      await loadPartnerDetails(updatedMatch, userId);
    }
  };

  // Propose Date
  const handleProposeDate = async (e: FormEvent) => {
    e.preventDefault();
    if (!dateProposed || !timeProposed || !locationProposed || !activeMatch) return;

    setActionError("");
    setSubmitting(true);

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationProposed)}`;

    const { error } = await supabase.from("date_proposals").insert({
      match_id: activeMatch.id,
      proposed_by: userId,
      proposed_date: dateProposed,
      proposed_time: timeProposed + ":00",
      location_text: locationProposed,
      google_maps_url: mapsUrl,
      status: "pending",
    });

    if (error) {
      console.error("Failed to insert proposal:", error);
      setActionError("Failed to submit proposal.");
    } else {
      await loadDateProposal(activeMatch.id, userId!);
      // send system message
      await supabase.from("messages").insert({
        match_id: activeMatch.id,
        sender_id: null,
        type: "date_proposal",
        content: `A date proposal has been suggested for ${dateProposed} at ${timeProposed} at ${locationProposed}.`,
      });
      await loadMessages(activeMatch.id);
    }
    setSubmitting(false);
  };

  const handleRespondProposal = async (approve: boolean) => {
    if (!currentProposal || !activeMatch) return;
    setSubmitting(true);

    if (approve) {
      // 1. Approve proposal in DB
      await supabase
        .from("date_proposals")
        .update({ status: "approved" })
        .eq("id", currentProposal.id);

      // 2. Set match status to date_planned
      await supabase
        .from("matches")
        .update({ status: "date_planned" })
        .eq("id", activeMatch.id);

      // 3. Create a confirmed date row
      const dateTimeStr = `${currentProposal.proposed_date}T${currentProposal.proposed_time}Z`;
      await supabase.from("confirmed_dates").insert({
        match_id: activeMatch.id,
        date_proposal_id: currentProposal.id,
        date_time: dateTimeStr,
        location_text: currentProposal.location_text,
        google_maps_url: currentProposal.google_maps_url,
      });

      // 4. Send system message
      await supabase.from("messages").insert({
        match_id: activeMatch.id,
        sender_id: null,
        type: "date_confirmed",
        content: `🎉 Date confirmed! Hauz Khas meets. Details locked in.`,
      });

      await loadDateProposal(activeMatch.id, userId!);
      await loadMessages(activeMatch.id);
    } else {
      // Reject proposal / suggest edit
      await supabase
        .from("date_proposals")
        .update({ status: "edited" })
        .eq("id", currentProposal.id);
      
      setProposalStatus("none");
      setCurrentProposal(null);
    }
    setSubmitting(false);
  };

  // Feedback submit (State 4)
  const handleSubmitFeedback = async () => {
    if (!activeMatch) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/match/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: activeMatch.id,
          attended: feedbackAttended,
          vibeRating: feedbackVibeRating,
          conversationRating: feedbackConversationRating,
          wouldMeetAgain: feedbackWouldMeet,
          comments: feedbackComments,
        }),
      });

      if (res.ok) {
        // Trigger reset endpoint to release match status
        await fetch("/api/match/reset", { method: "POST" });
        await refreshMatchStatus(userId!);
      } else {
        setActionError("Failed to record feedback.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================================================
  // PROFILE EDITING HELPER METHODS
  // ==================================================
  const handleStartEditing = () => {
    setEditFirstName(myFirstName);
    setEditLastName(myLastName);
    setEditDob(myDob);
    setEditGender(myGender);
    setEditHeightCm(myHeightCm);
    setEditWeightKg(myWeightKg);
    setEditDietary(myDietary);
    setEditDrinking(myDrinking);
    setEditSmoking(mySmoking);
    setEditFitness(myFitness);
    setEditHobbies(myHobbies);

    // Reset photo crop
    setEditPhotoFile(null);
    setEditPhotoDataUrl("");
    setEditScale(1.0);
    setEditOffset({ x: 0, y: 0 });
    setIsEditingProfile(true);
    setActionError("");
  };

  const handleToggleEditHobby = (hobbyName: string) => {
    if (editHobbies.includes(hobbyName)) {
      setEditHobbies(editHobbies.filter((h) => h !== hobbyName));
    } else {
      if (editHobbies.length >= 3) {
        // limit to exactly 3
        return;
      }
      setEditHobbies([...editHobbies, hobbyName]);
    }
  };

  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditPhotoFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setEditPhotoDataUrl(reader.result as string);
      setEditScale(1.0);
      setEditOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Drag constraints helper
  const clampEditOffset = (x: number, y: number, currentScale: number) => {
    if (!editImgRef.current) return { x, y };
    const w = editImgRef.current.naturalWidth;
    const h = editImgRef.current.naturalHeight;

    const cropRadius = 130; // radius of circle in crop box
    const viewportCenter = 140; // 280 / 2

    const renderW = 280 * currentScale;
    const renderH = 280 * currentScale * (h / w);

    const minX = viewportCenter - renderW + cropRadius;
    const maxX = viewportCenter - cropRadius;
    const minY = viewportCenter - renderH + cropRadius;
    const maxY = viewportCenter - cropRadius;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

  const handleEditMouseDown = (e: React.MouseEvent) => {
    if (!editPhotoDataUrl) return;
    setEditIsDragging(true);
    setEditDragStart({
      x: e.clientX - editOffset.x,
      y: e.clientY - editOffset.y,
    });
  };

  const handleEditMouseMove = (e: React.MouseEvent) => {
    if (!editIsDragging) return;
    const newX = e.clientX - editDragStart.x;
    const newY = e.clientY - editDragStart.y;
    const clamped = clampEditOffset(newX, newY, editScale);
    setEditOffset(clamped);
  };

  const handleEditMouseUp = () => {
    setEditIsDragging(false);
  };

  const handleEditTouchStart = (e: React.TouchEvent) => {
    if (!editPhotoDataUrl || e.touches.length === 0) return;
    setEditIsDragging(true);
    setEditDragStart({
      x: e.touches[0].clientX - editOffset.x,
      y: e.touches[0].clientY - editOffset.y,
    });
  };

  const handleEditTouchMove = (e: React.TouchEvent) => {
    if (!editIsDragging || e.touches.length === 0) return;
    const newX = e.touches[0].clientX - editDragStart.x;
    const newY = e.touches[0].clientY - editDragStart.y;
    const clamped = clampEditOffset(newX, newY, editScale);
    setEditOffset(clamped);
  };

  const handleSaveProfileChanges = async () => {
    if (!editFirstName.trim()) {
      setActionError("First Name is required.");
      return;
    }
    if (editHobbies.length !== 3) {
      setActionError("Please select exactly 3 hobbies.");
      return;
    }

    setSubmitting(true);
    setActionError("");

    try {
      let finalPhotoUrl = myPhotoUrl;

      // 1. Process and upload profile image if a new one is selected
      if (editPhotoFile && editImgRef.current) {
        setEditPhotoLoading(true);
        const img = editImgRef.current;
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to create canvas context");

        const ratio = 500 / 280;
        const destX = editOffset.x * ratio;
        const destY = editOffset.y * ratio;
        const destW = 500 * editScale;
        const destH = 500 * editScale * (h / w);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, destX, destY, destW, destH);

        const uploadBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/jpeg", 0.8);
        });

        if (!uploadBlob) throw new Error("Failed to crop image.");

        const filename = `${Date.now()}_profile.jpg`;
        const filePath = `${userId}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(filePath, uploadBlob, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw uploadError;
        finalPhotoUrl = filePath;
      }

      // 2. Update users table details
      const { error: usersError } = await supabase
        .from("users")
        .update({
          first_name: editFirstName.trim(),
          last_name: editLastName.trim() || null,
          date_of_birth: editDob || null,
          gender: editGender,
          height_cm: editHeightCm,
          weight_kg: editWeightKg,
        })
        .eq("id", userId!);

      if (usersError) throw usersError;

      // 3. Update profiles table details
      const { error: profilesError } = await supabase
        .from("profiles")
        .update({
          photo_url: finalPhotoUrl,
          dietary: editDietary,
          drinking: editDrinking,
          smoking: editSmoking,
          fitness: editFitness,
          hobbies: editHobbies,
        })
        .eq("user_id", userId!);

      if (profilesError) throw profilesError;

      // 4. Update local component state
      setMyFirstName(editFirstName.trim());
      setMyLastName(editLastName.trim());
      setMyDob(editDob);
      setMyGender(editGender);
      setMyHeightCm(editHeightCm);
      setMyWeightKg(editWeightKg);
      setMyPhotoUrl(finalPhotoUrl);
      setMyDietary(editDietary);
      setMyDrinking(editDrinking);
      setMySmoking(editSmoking);
      setMyFitness(editFitness);
      setMyHobbies(editHobbies);
      
      const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();
      setUserName(fullName || "User");

      // Regenerate signed url
      if (finalPhotoUrl) {
        const { data: signedData } = await supabase.storage
          .from("photos")
          .createSignedUrl(finalPhotoUrl, 3600 * 24);
        if (signedData?.signedUrl) {
          setMyPhotoSignedUrl(signedData.signedUrl);
        }
      }

      setIsEditingProfile(false);
    } catch (err: any) {
      console.error("Failed to save profile changes:", err);
      setActionError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
      setEditPhotoLoading(false);
    }
  };

  const handleResetMatch = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your search?\n\nYour current search will be canceled. You will have to initiate a new search, and the fee you paid will be fully refunded to your wallet."
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      // Clear timers immediately to avoid any ghost intervals running
      if (searchingIntervalRef.current) {
        clearInterval(searchingIntervalRef.current);
        searchingIntervalRef.current = null;
      }
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
        chatIntervalRef.current = null;
      }

      const res = await fetch("/api/match/reset", { method: "POST" });
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (data.newBalance !== null && data.newBalance !== undefined) {
          setWalletBalance(data.newBalance);
        }
        await refreshMatchStatus(userId!);
      } else {
        setActionError(data.message || "Failed to cancel search.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  if (loading) {
    return <SplashLoader text="Entering BlindSide..." />;
  }

  return (
    <div className={s.dashboardLayout}>
      {/* Header */}
      <header className={s.dashboardHeader}>
        <div className={s.headerLeft}>
          <span className={s.brand}>BlindSide</span>
          <span className={s.campusBadge}>{universityName}</span>
        </div>
        <div className={s.headerRight}>
          <div className={s.walletCard}>
            <span className={s.walletLabel}>Balance</span>
            <span className={s.walletVal}>₹{walletBalance}</span>
          </div>
          {dashboardState === 3 ? (
            <button type="button" className={s.signOutBtn} onClick={() => setDashboardState(0)}>
              My Profile
            </button>
          ) : (
            <button type="button" className={s.signOutBtn} onClick={handleSignOut}>
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className={s.mainContainer}>
        {/* ==================================================
            STATE 0: MASTER PROFILE DASHBOARD (PROFILE HOMEPAGE)
            ================================================== */}
        {dashboardState === 0 && (
          <div className={s.masterGrid}>
            {/* Left Column: Profile Card */}
            <div className={s.profileMasterCard}>

              <div className={s.profilePhotoWrapper}>
                <div className={s.profilePhotoContainer}>
                  {myPhotoSignedUrl ? (
                    <img src={myPhotoSignedUrl} alt="Avatar" className={s.profilePhotoImg} />
                  ) : (
                    <div className={s.profilePhotoPlaceholder}>👤</div>
                  )}
                </div>
                <h2 className={s.profileNameTitle}>
                  {myFirstName} {myLastName}
                </h2>
                <div className={s.profileUniText}>
                  🏫 {universityName}
                </div>
              </div>

              {/* Bio Details */}
              <div className={s.infoGrid}>
                <div className={s.infoCol}>
                  <span className={s.infoLabel}>Gender</span>
                  <span className={s.infoVal}>
                    {myGender === "male" ? "Male ♂️" : myGender === "female" ? "Female ♀️" : "Everyone ⚧️"}
                  </span>
                </div>
                <div className={s.infoCol}>
                  <span className={s.infoLabel}>Age</span>
                  <span className={s.infoVal}>
                    {myDob ? new Date().getFullYear() - new Date(myDob).getFullYear() : "—"}
                  </span>
                </div>
                <div className={s.infoCol}>
                  <span className={s.infoLabel}>Height</span>
                  <span className={s.infoVal}>
                    {myHeightCm ? `${cmToFtIn(myHeightCm).ft}′${cmToFtIn(myHeightCm).inches}″` : "—"}
                  </span>
                </div>
              </div>

              {/* Hobbies */}
              <div className={s.editFieldGroup}>
                <span className={s.infoLabel} style={{ textAlign: "center", marginBottom: "4px" }}>My Hobbies</span>
                <div className={s.hobbiesPillContainer}>
                  {myHobbies.map((hob) => {
                    const hObj = HOBBIES_LIST.find((x) => x.name === hob);
                    return (
                      <div key={hob} className={s.hobbyPill}>
                        <span>{hObj?.emoji || "✨"}</span>
                        <span>{hob}</span>
                      </div>
                    );
                  })}
                  {myHobbies.length === 0 && (
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>No hobbies selected</span>
                  )}
                </div>
              </div>

              {/* Lifestyle Summary */}
              <div className={s.editFieldGroup}>
                <span className={s.infoLabel} style={{ textAlign: "center", marginBottom: "4px" }}>Lifestyle Traits</span>
                <div className={s.lifestyleGrid}>
                  <div className={s.lifestyleItemCard}>
                    <span className={s.lifestyleItemLabel}>Dietary</span>
                    <span className={s.lifestyleItemVal}>
                      {myDietary === "veg" ? "Veg 🥦" : myDietary === "non_veg" ? "Non-Veg 🍗" : myDietary === "vegan" ? "Vegan 🌱" : myDietary === "eggitarian" ? "Eggitarian 🥚" : "No Preference"}
                    </span>
                  </div>
                  <div className={s.lifestyleItemCard}>
                    <span className={s.lifestyleItemLabel}>Drinking</span>
                    <span className={s.lifestyleItemVal}>
                      {myDrinking === "sober" ? "Sober 🚫" : myDrinking === "socially" ? "Socially 🍻" : myDrinking === "frequently" ? "Frequently 🍷" : myDrinking === "regularly" ? "Regularly 🥃" : "No Preference"}
                    </span>
                  </div>
                  <div className={s.lifestyleItemCard}>
                    <span className={s.lifestyleItemLabel}>Smoking</span>
                    <span className={s.lifestyleItemVal}>
                      {mySmoking === "non_smoker" ? "Non-Smoker 🚭" : mySmoking === "occasionally" ? "Occasionally 🚬" : mySmoking === "regularly" ? "Regularly 💨" : "No Preference"}
                    </span>
                  </div>
                  <div className={s.lifestyleItemCard}>
                    <span className={s.lifestyleItemLabel}>Activity</span>
                    <span className={s.lifestyleItemVal}>
                      {myFitness === "not_active" ? "Not Active 🛋️" : myFitness === "active" ? "Active 🏃‍♂️" : myFitness === "gym_freak" ? "Gym Freak 🏋️‍♂️" : "No Preference"}
                    </span>
                  </div>
                </div>
              </div>

              <button className={s.editProfileBtn} onClick={handleStartEditing}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "2px" }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                </svg>
                Edit Profile
              </button>
            </div>

            {/* Right Column: Dynamic Match Status Card */}
            <div className={`${s.matchPortalCard}`}>
              {/* Glow backgrounds depending on state */}
              {matchStatus === "searching" && <div className={`${s.portalGlowBg} ${s.portalSearchingGlow}`} />}
              {matchStatus === "matched" && <div className={`${s.portalGlowBg} ${s.portalMatchedGlow}`} />}
              {matchStatus !== "searching" && matchStatus !== "matched" && <div className={s.portalGlowBg} />}

              {matchStatus === "none" && (
                <>
                  <div className={s.portalRadarCenter} style={{ background: "rgba(232, 58, 114, 0.1)", color: "var(--accent-primary)", width: "64px", height: "64px" }}>
                    <HeartIcon />
                  </div>
                  <h1 className={s.portalTitle}>BlindSide Match Center</h1>
                  <p className={s.portalDesc}>
                    Match anonymously with university students. Our compatibility engine pairs you based on values, heights, and interests.
                  </p>
                  <button
                    className="btn btn-primary btn-pill btn-glow"
                    onClick={() => {
                      setDashboardState(1);
                      setPrefSlide(1);
                    }}
                  >
                    ⚡ Find a Match
                  </button>
                </>
              )}

              {matchStatus === "unpaid" && (
                <>
                  <div className={s.portalRadarCenter} style={{ background: "rgba(232, 58, 114, 0.1)", color: "var(--accent-primary)", width: "64px", height: "64px" }}>
                    <HeartIcon />
                  </div>
                  <h1 className={s.portalTitle}>Draft Search Ready</h1>
                  <p className={s.portalDesc}>
                    You have saved filters ready to go. Activate your search to begin looking for mutual matches.
                  </p>
                  <button
                    className="btn btn-primary btn-pill btn-glow"
                    onClick={() => {
                      setDashboardState(1);
                      setPrefSlide(7);
                    }}
                  >
                    🔑 Activate Match Search
                  </button>
                </>
              )}

              {matchStatus === "searching" && (
                <>
                  <div className={s.portalPulsingRadar}>
                    <div className={s.portalRadarWave} />
                    <div className={`${s.portalRadarWave} ${s.portalRadarWave2}`} />
                    <div className={s.portalRadarCenter}>
                      <HeartIcon />
                    </div>
                  </div>
                  <h1 className={s.portalTitle}>Campus Search Active</h1>
                  <p className={s.portalDesc} style={{ marginBottom: "0.25rem" }}>
                    Scanning {universityName} pool for compatible orbits...
                  </p>
                  
                  {/* Digital Live Clock Timer */}
                  <div className={s.portalTimerText}>
                    {countdownText}
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        // Let them view filters they configured
                        setDashboardState(1);
                        setPrefSlide(6);
                      }}
                    >
                      View Filters
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleResetMatch}
                      disabled={submitting}
                    >
                      Cancel Search
                    </button>
                  </div>
                </>
              )}

              {matchStatus === "matched" && (
                <>
                  <div className={s.portalRadarCenter} style={{ background: "rgba(142, 68, 173, 0.1)", color: "#9b59b6", width: "64px", height: "64px", boxShadow: "0 0 20px rgba(155, 89, 182, 0.3)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h1 className={s.portalTitle}>Campus Match Found!</h1>
                  <p className={s.portalDesc}>
                    You have successfully locked orbits with another student. Introduce yourself in the secure chatroom.
                  </p>

                  {/* Partner Overview Badge */}
                  {partnerProfile && (
                    <div className={s.partnerMatchCard}>
                      <div className={s.partnerAvatarFrame}>
                        {partnerProfile.photoUrl ? (
                          <img src={partnerProfile.photoUrl} alt="Partner" />
                        ) : (
                          <span className={s.partnerAvatarSilhouette}>👤</span>
                        )}
                      </div>
                      <div className={s.partnerSummary}>
                        <span className={s.partnerNameText}>
                          {partnerProfile.firstName}, {partnerProfile.age}
                        </span>
                        <span className={s.partnerUniText}>
                          🎓 {partnerProfile.university}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-pill btn-glow"
                    style={{ background: "var(--accent-gradient)", border: "none" }}
                    onClick={() => {
                      setDashboardState(3);
                    }}
                  >
                    💬 Enter Chat & Planner
                  </button>
                </>
              )}

              {matchStatus === "feedback" && (
                <>
                  <div className={s.portalRadarCenter} style={{ background: "rgba(241, 196, 15, 0.1)", color: "#f1c40f", width: "64px", height: "64px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <h1 className={s.portalTitle}>Date Feedback Required</h1>
                  <p className={s.portalDesc}>
                    Your match countdown timer has ended. Please rate your blind date experience to unlock future campus searches!
                  </p>
                  <button
                    className="btn btn-primary btn-pill"
                    onClick={() => {
                      setDashboardState(4);
                    }}
                  >
                    📝 Share Feedback
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            STATE 1: PREFERENCES SLIDES
            ================================================== */}
        {dashboardState === 1 && (
          <div className={s.stateCard}>
            {actionError && <div className={s.errorAlert}>{actionError}</div>}

            {/* progress dots */}
            <div className={s.dotRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((i, idx) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div className={`${s.dot} ${i === prefSlide ? s.dotActive : i < prefSlide ? s.dotComplete : ""}`}/>
                  {idx < 6 && (
                    <div className={`${s.dotConnector} ${i < prefSlide ? s.dotConnectorDone : ""}`}/>
                  )}
                </div>
              ))}
            </div>

            {/* slide wrapper */}
            <div className={s.slideWrapper}>
              {showMorph && (
                <div className={s.morphOverlay}>
                  <div className={morphDir === "v2h" ? s.morphBarVtoH : s.morphBarHtoV}/>
                </div>
              )}

              {!showMorph && (
                <div
                  key={prefSlide}
                  className={`${s.slidePanel} ${slideDir === "forward" ? s.slideRight : s.slideLeft}`}
                >
                  {prefSlide === 1 && (
                    <div className={s.slideContent}>
                      <h1 className={s.title}>Who are you looking for?</h1>
                      <p className={s.subtitle}>Preferences help scope your daily campus match selection pool.</p>

                      <div className={s.genderPrefGrid}>
                        {([
                          { key: "male", label: "Men", Svg: MaleSVG },
                          { key: "female", label: "Women", Svg: FemaleSVG },
                          { key: "everyone", label: "Everyone", Svg: EveryoneSVG }
                        ] as const).map((g) => {
                          const active = prefGender === g.key;
                          const accentFill = active ? "url(#accentGrad)" : "var(--text-muted)";
                          return (
                            <button
                              key={g.key}
                              className={`${s.genderPrefBtn} ${active ? s.genderPrefBtnActive : ""}`}
                              onClick={() => setPrefGender(g.key as any)}
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
                              <span className={s.genderPrefName}>{g.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className={s.slideFooter}>
                        <button type="button" className="btn btn-ghost" onClick={() => setDashboardState(0)}>
                          ← Dashboard
                        </button>
                        <button className="btn btn-secondary btn-pill" onClick={() => changePrefSlide(2)}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  {prefSlide === 2 && (
                    <div className={s.slideContent}>
                      <h1 className={s.title}>Preferred Age Range</h1>
                      <p className={s.subtitle}>Drag the sliders to select the age boundary limit for your matches.</p>

                      <div className={s.rulerBadge} style={{ margin: "1rem 0" }}>
                        <span className={s.badgeValue}>{Math.round(prefAgeMin)} - {Math.round(prefAgeMax)}</span>
                        <span className={s.badgeDivider}/>
                        <span className={s.badgeAlt}>years old</span>
                      </div>

                      <div
                        className={s.ageSliderWrapper}
                        ref={ageRef}
                        onMouseDown={handleAgeStartDrag}
                        onTouchStart={handleAgeStartDrag}
                      >
                        {/* Age Scale Labels (sitting at the top of the line) */}
                        <div className={s.ageScaleLabels}>
                          {Array.from({ length: 13 }, (_, i) => {
                            const age = 18 + i;
                            const pct = (i / 12) * 100;

                            const distMin = Math.abs(age - Math.round(prefAgeMin));
                            const distMax = Math.abs(age - Math.round(prefAgeMax));
                            const minDist = Math.min(distMin, distMax);

                            let scaleClass = "";
                            if (minDist === 0) scaleClass = s.dockScale0;
                            else if (minDist === 1) scaleClass = s.dockScale1;
                            else if (minDist === 2) scaleClass = s.dockScale2;

                            return (
                              <span
                                key={age}
                                className={`${s.ageScaleNum} ${scaleClass}`}
                                style={{ left: `${pct}%` }}
                              >
                                {age}
                              </span>
                            );
                          })}
                        </div>

                        <div className={s.ageSliderTrack}>
                          <div
                            className={s.ageSliderFill}
                            style={{
                              left: `${((prefAgeMin - 18) / 12) * 100}%`,
                              width: `${((prefAgeMax - prefAgeMin) / 12) * 100}%`
                            }}
                          />
                        </div>


                        <div
                          className={`${s.ageSliderThumb} ${dragAgeActive === "min" ? s.thumbLocked : ""}`}
                          style={{ left: `${((prefAgeMin - 18) / 12) * 100}%` }}
                        />
                        <div
                          className={`${s.ageSliderThumb} ${dragAgeActive === "max" ? s.thumbLocked : ""}`}
                          style={{ left: `${((prefAgeMax - 18) / 12) * 100}%` }}
                        />
                      </div>

                      <div className={s.slideFooter}>
                        <button className="btn btn-ghost" onClick={() => changePrefSlide(1)}>
                          ← Back
                        </button>
                        <button className="btn btn-secondary btn-pill" onClick={() => changePrefSlide(3)}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  {prefSlide === 3 && (
                    <div className={s.slideContent}>
                      <h1 className={s.title}>Preferred Height</h1>

                      <div className={s.rulerBadge} style={{ margin: "0.5rem 0" }}>
                        <span className={s.badgeValue}>
                          {cmToFtIn(prefHeightMinCm).ft}′{cmToFtIn(prefHeightMinCm).inches}″ - {cmToFtIn(prefHeightMaxCm).ft}′{cmToFtIn(prefHeightMaxCm).inches}″
                        </span>
                        <span className={s.badgeDivider}/>
                        <span className={s.badgeAlt}>
                          {prefHeightMinCm} - {prefHeightMaxCm} cm
                        </span>
                      </div>

                      <div
                        className={`${s.heightRuler} ${dragHeightActive ? s.rulerLocked : ""}`}
                        ref={heightRef}
                        onMouseDown={handleHeightStartDrag}
                        onTouchStart={handleHeightStartDrag}
                        style={{ height: "260px" }}
                      >
                        <div className={`${s.heightLabelsCol} ${s.right}`}>
                          {[
                            { cm: 122, label: "4′0″" },
                            { cm: 137, label: "4′6″" },
                            { cm: 152, label: "5′0″" },
                            { cm: 167, label: "5′6″" },
                            { cm: 183, label: "6′0″" },
                            { cm: 198, label: "6′6″" },
                            { cm: 213, label: "7′0″" },
                          ].map(m => {
                            const isActiveCm = m.cm === prefHeightMinCm || m.cm === prefHeightMaxCm;
                            return (
                              <span
                                key={m.cm}
                                className={`${s.rulerMarkLabel} ${isActiveCm ? s.rulerMarkActive : ""}`}
                              >
                                {m.label}
                              </span>
                            );
                          }).reverse()}
                        </div>

                        <div className={s.heightTrackArea}>
                          <div className={s.heightTrack}>
                            <div
                              className={s.heightFill}
                              style={{
                                bottom: `${((prefHeightMinCm - MIN_CM) / (MAX_CM - MIN_CM)) * 100}%`,
                                height: `${((prefHeightMaxCm - prefHeightMinCm) / (MAX_CM - MIN_CM)) * 100}%`
                              }}
                            />
                          </div>
                          <div className={s.heightTicks}>
                            {Array.from({ length: MAX_CM - MIN_CM + 1 }, (_, i) => {
                              const cm = MIN_CM + i;
                              const pct = ((cm - MIN_CM) / (MAX_CM - MIN_CM)) * 100;
                              const isActiveCm = cm === prefHeightMinCm || cm === prefHeightMaxCm;
                              const isMajor = cm % 10 === 0;
                              const isMedium = cm % 5 === 0 && !isMajor;
                              const isMinor = !isMajor && !isMedium;
                              const sizeClass = isMajor ? s.major : isMedium ? s.medium : s.minor;
                              return (
                                <div key={cm} style={{ position: "absolute", bottom: `${pct}%`, left: 0, right: 0 }}>
                                  <div className={`${s.heightTick} ${s.left} ${sizeClass} ${isActiveCm ? s.active : ""}`}/>
                                  <div className={`${s.heightTick} ${s.right} ${sizeClass} ${isActiveCm ? s.active : ""}`}/>
                                </div>
                              );
                            })}
                          </div>
                          <div
                            className={`${s.heightThumb} ${dragHeightActive === "min" ? s.thumbLocked : ""}`}
                            style={{ bottom: `${((prefHeightMinCm - MIN_CM) / (MAX_CM - MIN_CM)) * 100}%` }}
                          />
                          <div
                            className={`${s.heightThumb} ${dragHeightActive === "max" ? s.thumbLocked : ""}`}
                            style={{ bottom: `${((prefHeightMaxCm - MIN_CM) / (MAX_CM - MIN_CM)) * 100}%` }}
                          />
                        </div>

                        <div className={`${s.heightLabelsCol} ${s.left}`}>
                          {[
                            { cm: 122, label: "122" },
                            { cm: 137, label: "137" },
                            { cm: 152, label: "152" },
                            { cm: 167, label: "167" },
                            { cm: 183, label: "183" },
                            { cm: 198, label: "198" },
                            { cm: 213, label: "213" },
                          ].map(m => {
                            const isActiveCm = m.cm === prefHeightMinCm || m.cm === prefHeightMaxCm;
                            return (
                              <span
                                key={m.cm}
                                className={`${s.rulerMarkLabel} ${isActiveCm ? s.rulerMarkActive : ""}`}
                              >
                                {m.cm}
                              </span>
                            );
                          }).reverse()}
                        </div>
                      </div>

                      <div className={s.slideFooter}>
                        <button className="btn btn-ghost" onClick={() => changePrefSlide(2)}>
                          ← Back
                        </button>
                        <button className="btn btn-secondary btn-pill" onClick={() => changePrefSlide(4)}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  {prefSlide === 4 && (
                    <div className={s.slideContent}>
                      <h1 className={s.title}>Dietary Preference</h1>
                      <p className={s.subtitle}>Filter matches by their eating habits.</p>

                      <div className={s.prefCardGrid}>
                        {[
                          { key: "veg", label: "Vegetarian", desc: "Eats plant-based and dairy", Svg: VegSVG },
                          { key: "nonveg", label: "Non-Vegetarian", desc: "Eats meat, fish, poultry", Svg: NonVegSVG },
                          { key: "vegan", label: "Vegan", desc: "No animal products", Svg: VeganSVG },
                          { key: "no_preference", label: "No Preference", desc: "Open to matching anyone", Svg: DietNoPrefSVG }
                        ].map((d) => {
                          const active = prefDietary === d.key;
                          const iconColor = active ? "var(--accent-primary)" : "var(--text-muted)";
                          return (
                            <button
                              key={d.key}
                              type="button"
                              className={`${s.prefCard} ${active ? s.prefCardActive : ""}`}
                              onClick={() => {
                                setPrefDietary(d.key);
                                setTimeout(() => changePrefSlide(5), 300);
                              }}
                            >
                              <d.Svg fill={iconColor} />
                              <div className={s.prefCardText}>
                                <span className={s.prefCardTitle}>{d.label}</span>
                                <span className={s.prefCardDesc}>{d.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className={s.slideFooter}>
                        <button className="btn btn-ghost" onClick={() => changePrefSlide(3)}>
                          ← Back
                        </button>
                        <button className="btn btn-secondary btn-pill" onClick={() => changePrefSlide(5)}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  {prefSlide === 5 && (
                    <div className={s.slideContent}>
                      <h1 className={s.title}>Drinking Preference</h1>
                      <p className={s.subtitle}>Choose whether you prefer matches who drink.</p>

                      <div className={s.prefCardGrid}>
                        {[
                          { key: "yes", label: "Drinks Regularly", desc: "Enjoys regular drinking", Svg: DrinkingSVG },
                          { key: "socially", label: "Drinks Socially", desc: "Drinks only on social occasions", Svg: DrinkSociallySVG },
                          { key: "no", label: "Sober / Teetotaler", desc: "Does not drink alcohol", Svg: SoberSVG },
                          { key: "no_preference", label: "No Preference", desc: "Open to matching anyone", Svg: DrinkNoPrefSVG }
                        ].map((d) => {
                          const active = prefDrinking === d.key;
                          const iconColor = active ? "var(--accent-primary)" : "var(--text-muted)";
                          return (
                            <button
                              key={d.key}
                              type="button"
                              className={`${s.prefCard} ${active ? s.prefCardActive : ""}`}
                              onClick={() => {
                                setPrefDrinking(d.key);
                                setTimeout(() => changePrefSlide(6), 300);
                              }}
                            >
                              <d.Svg fill={iconColor} />
                              <div className={s.prefCardText}>
                                <span className={s.prefCardTitle}>{d.label}</span>
                                <span className={s.prefCardDesc}>{d.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className={s.slideFooter}>
                        <button className="btn btn-ghost" onClick={() => changePrefSlide(4)}>
                          ← Back
                        </button>
                        <button className="btn btn-secondary btn-pill" onClick={() => changePrefSlide(6)}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  {prefSlide === 6 && (
                    <div className={s.slideContent}>
                      <h1 className={s.title}>Smoking Preference</h1>
                      <p className={s.subtitle}>Filter matches by their smoking habits.</p>

                      <div className={s.prefCardGrid}>
                        {[
                          { key: "regular", label: "Regular Smoker", desc: "Smokes regularly", Svg: SmokeRegularlySVG },
                          { key: "casual", label: "Casual Smoker", desc: "Smokes casually or socially", Svg: SmokeOccasionallySVG },
                          { key: "no", label: "Non-Smoker", desc: "Does not smoke", Svg: NonSmokingSVG },
                          { key: "no_preference", label: "No Preference", desc: "Open to matching anyone", Svg: SmokeNoPrefSVG }
                        ].map((d) => {
                          const active = prefSmoking === d.key;
                          const iconColor = active ? "var(--accent-primary)" : "var(--text-muted)";
                          return (
                            <button
                              key={d.key}
                              type="button"
                              className={`${s.prefCard} ${active ? s.prefCardActive : ""}`}
                              onClick={() => setPrefSmoking(d.key)}
                            >
                              <d.Svg fill={iconColor} />
                              <div className={s.prefCardText}>
                                <span className={s.prefCardTitle}>{d.label}</span>
                                <span className={s.prefCardDesc}>{d.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className={s.slideFooter}>
                        <button className="btn btn-ghost" onClick={() => changePrefSlide(5)}>
                          ← Back
                        </button>
                        <button className="btn btn-primary btn-pill" onClick={handleSavePreferences} disabled={submitting}>
                          {submitting ? "Saving..." : "Save Preferences →"}
                        </button>
                      </div>
                    </div>
                  )}

                  {prefSlide === 7 && (
                    <div className={s.slideContent}>
                      <h1 className={s.title}>Activate Campus Search</h1>
                      <p className={s.subtitle}>Start searching within your university. If no match is found within 7 days, credits return to your wallet.</p>

                      <div className={s.checkoutCard}>
                        <div className={s.checkoutTitle}>University Match Search</div>
                        <div className={s.checkoutPrice}>₹{isFirstMatch ? "49.00" : "69.00"}</div>
                        <div className={s.checkoutText}>
                          • Only matches students inside <strong>{universityName}</strong><br />
                          • Bidirectional compatibility check<br />
                          • 7-day refund guarantee to wallet
                        </div>
                      </div>

                      {walletBalance >= (isFirstMatch ? 49 : 69) ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-pill"
                          style={{ width: "100%", marginTop: "1.5rem" }}
                          onClick={handlePay}
                          disabled={submitting}
                        >
                          {submitting ? "Processing..." : `Pay ₹${isFirstMatch ? 49 : 69} from Wallet (Bal: ₹${walletBalance}) ✓`}
                        </button>
                      ) : (
                        <div>
                          <button
                            type="button"
                            className="btn btn-primary btn-pill"
                            style={{ width: "100%", marginTop: "1.5rem" }}
                            onClick={handleRazorpayPay}
                            disabled={submitting}
                          >
                            {submitting ? "Processing..." : `Pay ₹${isFirstMatch ? 49 : 69} via UPI / Card (Razorpay) ✓`}
                          </button>
                          <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            Wallet Balance: ₹{walletBalance} (Insufficient)
                          </div>
                        </div>
                      )}

                      <div className={s.slideFooter} style={{ marginTop: "1rem" }}>
                        <button className="btn btn-ghost" onClick={() => changePrefSlide(6)}>
                          ← Edit Filters
                        </button>
                        <button className="btn btn-ghost" onClick={() => setDashboardState(0)}>
                          Dashboard
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            STATE 2: SEARCHING (ACTIVE POOL)
            ================================================== */}
        {dashboardState === 2 && (
          <div className={s.searchingCard}>
            <div className={s.radarAnimation}>
              <div className={s.radarWave1}></div>
              <div className={s.radarWave2}></div>
              <div className={s.radarWave3}></div>
              <div className={s.radarCenter}>
                <HeartIcon />
              </div>
            </div>

            <h1 className={s.searchingTitle}>Searching your campus...</h1>
            <p className={s.searchingText}>
              We are actively matching you based on compatibility vectors. Check back shortly.
            </p>

            <div className={s.timerBox}>
              <div className={s.timerLabel}>Time remaining in search queue</div>
              <div className={s.timerVal}>{countdownText}</div>
            </div>

            <button
              className="btn btn-secondary btn-pill"
              style={{ marginTop: "2rem" }}
              onClick={handleResetMatch}
              disabled={submitting}
            >
              Cancel Search
            </button>
          </div>
        )}

        {/* ==================================================
            STATE 3: MATCHED (CHAT AND PLANNING)
            ================================================== */}
        {dashboardState === 3 && partnerProfile && (
          <div className={s.matchedWrapper}>
            {/* Global SVG defs for gradients */}
            <svg style={{ position: "absolute", width: 0, height: 0 }} width="0" height="0">
              <defs>
                <linearGradient id="compatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e83a72" />
                  <stop offset="100%" stopColor="#7c5ce8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Left Column: Profile & Date Planning */}
            <div className={s.leftColumn}>
              {/* Match profile card with radial progress compatibility */}
              <div className={s.matchProfileCard}>
                <div className={s.radialScoreContainer}>
                  <svg className={s.radialScoreSvg} viewBox="0 0 36 36">
                    <path
                      className={s.radialScoreBg}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={s.radialScoreProgress}
                      strokeDasharray={`${partnerProfile.compatibility}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  {partnerProfile.photoUrl ? (
                    <div 
                      className={s.radialScoreVal} 
                      style={{ 
                        width: "105px", 
                        height: "105px", 
                        borderRadius: "50%", 
                        overflow: "hidden",
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                        top: "10px",
                        left: "10px"
                      }}
                    >
                      <img 
                        src={partnerProfile.photoUrl} 
                        alt="Profile avatar" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div className={s.radialScoreVal}>
                      <span>{partnerProfile.compatibility}%</span>
                      <span className={s.radialScoreLabel}>Compat</span>
                    </div>
                  )}
                </div>

                <h1 className={s.matchName}>{partnerProfile.firstName}, {partnerProfile.age}</h1>
                <p className={s.matchUni}>🎓 Student at {partnerProfile.university}</p>

                <div className={s.hobbiesRow}>
                  {partnerProfile.hobbies.map((h: string) => (
                    <span key={h} className={s.hobbyBadge}>{h}</span>
                  ))}
                </div>

                <div className={s.chatTimerBox}>
                  <div className={s.timerLabel}>Chat window expires in</div>
                  <div className={s.chatTimerVal}>{chatCountdownText}</div>
                </div>
              </div>

              {/* Meet toggle and Proposal Panel */}
              <div className={s.meetAndPlanCard}>
                <h2 className={s.sectionTitle}>Meet In-Person</h2>
                <p className={s.sectionText}>
                  Activate the toggle when you are ready to meet {partnerProfile.firstName}. Once both toggle ON, the date proposal form will unlock.
                </p>

                <button
                  className={`${s.meetToggleBtn} ${userWantsMeet ? s.meetActive : ""}`}
                  onClick={handleToggleMeet}
                >
                  {userWantsMeet ? (
                    <span className={s.btnContent}>
                      <span className={s.checkIcon}>✓</span> Ready to Meet!
                    </span>
                  ) : (
                    "Let's Meet!"
                  )}
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1rem", marginBottom: "0.25rem" }}>
                  <button
                    className={`${s.meetToggleBtn} ${userSharesName ? s.meetActive : ""}`}
                    onClick={handleShareName}
                  >
                    {userSharesName ? "✓ Name Shared" : "Share Name"}
                  </button>
                  <button
                    className={`${s.meetToggleBtn} ${userSharesPhoto ? s.meetActive : ""}`}
                    onClick={handleSharePhoto}
                  >
                    {userSharesPhoto ? "✓ Photo Shared" : "Share Photo"}
                  </button>
                </div>

                {/* Date Proposal Status */}
                {userWantsMeet && partnerWantsMeet && (
                  <div className={s.proposalBox}>
                    {proposalStatus === "none" && (
                      <form onSubmit={handleProposeDate} className={s.proposalForm}>
                        <h3 className={s.boxTitle}>Propose a Date</h3>
                        <div className={s.formGroup}>
                          <label className={s.label}>Meeting Date</label>
                          <input
                            type="date"
                            className={s.input}
                            required
                            value={dateProposed}
                            onChange={(e) => setDateProposed(e.target.value)}
                          />
                        </div>
                        <div className={s.formGroup}>
                          <label className={s.label}>Meeting Time</label>
                          <input
                            type="time"
                            className={s.input}
                            required
                            value={timeProposed}
                            onChange={(e) => setTimeProposed(e.target.value)}
                          />
                        </div>
                        <div className={s.formGroup}>
                          <label className={s.label}>Meeting Location</label>
                          <input
                            type="text"
                            className={s.input}
                            required
                            placeholder="e.g. Café Dori, Hauz Khas"
                            value={locationProposed}
                            onChange={(e) => setLocationProposed(e.target.value)}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary btn-pill" disabled={submitting}>
                          {submitting ? "Sending..." : "Send Proposal →"}
                        </button>
                      </form>
                    )}

                    {proposalStatus === "pending_them" && (
                      <div className={s.proposalMessage}>
                        <h3 className={s.boxTitle}>Proposal Sent!</h3>
                        <p className={s.sectionText}>
                          Waiting for {partnerProfile.firstName} to approve or suggest edits:
                          <br />
                          <strong>{currentProposal.proposed_date}</strong> at <strong>{currentProposal.proposed_time.slice(0, 5)}</strong>
                          <br />
                          Location: <strong>{currentProposal.location_text}</strong>
                        </p>
                      </div>
                    )}

                    {proposalStatus === "pending_me" && (
                      <div className={s.proposalMessage}>
                        <h3 className={s.boxTitle}>Review Date Proposal</h3>
                        <p className={s.sectionText}>
                          {partnerProfile.firstName} proposed to meet on:
                          <br />
                          <strong>{currentProposal.proposed_date}</strong> at <strong>{currentProposal.proposed_time.slice(0, 5)}</strong>
                          <br />
                          Location: <strong>{currentProposal.location_text}</strong>
                        </p>
                        <div className={s.actionRow} style={{ marginTop: "1rem" }}>
                          <button className="btn btn-ghost" onClick={() => handleRespondProposal(false)} disabled={submitting}>
                            Suggest Edit
                          </button>
                          <button className="btn btn-primary btn-pill" onClick={() => handleRespondProposal(true)} disabled={submitting}>
                            Approve Date
                          </button>
                        </div>
                      </div>
                    )}

                    {proposalStatus === "confirmed" && (
                      <div className={s.proposalMessage} style={{ borderColor: "var(--success)" }}>
                        <h3 className={s.boxTitle} style={{ color: "var(--success)" }}>🎉 Date Locked!</h3>
                        <p className={s.sectionText}>
                          Meeting confirmed: <strong>{currentProposal.proposed_date}</strong> at <strong>{currentProposal.proposed_time.slice(0, 5)}</strong>.
                          <br />
                          Location: <strong>{currentProposal.location_text}</strong>
                        </p>
                        <a
                          href={currentProposal.google_maps_url}
                          target="_blank"
                          rel="noreferrer"
                          className={s.mapsLink}
                        >
                          📍 View on Google Maps
                        </a>
                        <p className={s.revealNotice}>
                          🕵️ Check your email T-4 hours before the date to reveal their photo and details!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Chat Box */}
            <div className={s.chatWindowCard}>
              <div className={s.chatHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className={s.chatStatusIndicator}>
                  <span className={s.chatStatusDot} />
                  <span className={s.chatStatusText}>
                    {partnerSharesName && partnerProfile?.rawFirstName
                      ? `Chat with ${partnerProfile.rawFirstName}`
                      : "Blind Chat Active"}
                  </span>
                </div>
                <button 
                  type="button"
                  className="btn btn-ghost btn-sm" 
                  onClick={() => setDashboardState(0)}
                  style={{ fontSize: "11px", fontWeight: "700" }}
                >
                  ← Dashboard
                </button>
              </div>
              <div className={s.messagesArea}>
                {chatMessages.length === 0 ? (
                  <div className={s.chatEmpty}>
                    💬 Start the conversation! No names, no pictures. Just dialogue.
                  </div>
                ) : (
                  chatMessages.map((m) => {
                    const mine = m.sender_id === userId;
                    const system = m.sender_id === null;
                    if (system) {
                      return (
                        <div key={m.id} className={s.systemMsg}>
                          {m.content}
                        </div>
                      );
                    }
                    return (
                      <div key={m.id} className={`${s.messageBubble} ${mine ? s.myMsg : s.theirMsg}`}>
                        <div className={s.msgText}>{m.content}</div>
                        <div className={s.msgTime}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className={s.chatInputRow}>
                <input
                  type="text"
                  placeholder="Type a blind message..."
                  className={s.input}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                />
                <button type="submit" className={s.sendBtn} disabled={!newMessageText.trim()}>
                  <SendIcon />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================
            STATE 4: POST-DATE FEEDBACK
            ================================================== */}
        {dashboardState === 4 && (
          <div className={s.feedbackCard}>
            <h1 className={s.title}>Rate your Date</h1>
            <p className={s.subtitle}>Your feedback is private. It helps improve our matching vectors.</p>

            {actionError && <div className={s.errorAlert}>{actionError}</div>}

            <div className={s.formGroup}>
              <label className={s.label}>Did you attend the date?</label>
              <div className={s.segmentContainer}>
                <button
                  type="button"
                  className={`${s.segmentBtn} ${feedbackAttended ? s.segmentActive : ""}`}
                  onClick={() => setFeedbackAttended(true)}
                >
                  Yes, we met
                </button>
                <button
                  type="button"
                  className={`${s.segmentBtn} ${!feedbackAttended ? s.segmentActive : ""}`}
                  onClick={() => setFeedbackAttended(false)}
                >
                  No-show / cancelled
                </button>
              </div>
            </div>

            {feedbackAttended && (
              <>
                <div className={s.formGroup}>
                  <label className={s.label}>Vibe rating: {feedbackVibeRating} / 5</label>
                  <div className={s.starsRow}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={s.starBtn}
                        onClick={() => setFeedbackVibeRating(val)}
                      >
                        <StarIcon filled={val <= feedbackVibeRating} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>Conversation rating: {feedbackConversationRating} / 5</label>
                  <div className={s.starsRow}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={s.starBtn}
                        onClick={() => setFeedbackConversationRating(val)}
                      >
                        <StarIcon filled={val <= feedbackConversationRating} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>Would you meet them again?</label>
                  <div className={s.segmentContainer}>
                    {[
                      { key: "yes", val: "Yes" },
                      { key: "maybe", val: "Maybe" },
                      { key: "no", val: "No" }
                    ].map((w) => (
                      <button
                        key={w.key}
                        type="button"
                        className={`${s.segmentBtn} ${feedbackWouldMeet === w.key ? s.segmentActive : ""}`}
                        onClick={() => setFeedbackWouldMeet(w.key as any)}
                      >
                        {w.val}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className={s.formGroup}>
              <label className={s.label}>Comments (Optional)</label>
              <textarea
                className={s.input}
                style={{ minHeight: "80px", resize: "vertical" }}
                placeholder="Share any thoughts..."
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setDashboardState(0)}
                disabled={submitting}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-pill"
                style={{ flex: 2 }}
                onClick={handleSubmitFeedback}
                disabled={submitting}
              >
                {submitting ? "Saving Review..." : "Submit Review ✓"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================
          EDIT PROFILE MODAL OVERLAY (STATE 0 VIEW ONLY)
          ================================================== */}
      {isEditingProfile && (
        <div className={s.editOverlayModal}>
          <div className={s.editModalContent}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>Edit Profile Details</h2>
              <button className={s.closeModalBtn} onClick={() => setIsEditingProfile(false)}>×</button>
            </div>

            {actionError && <div className={s.errorAlert}>{actionError}</div>}

            {/* Form Scrollable Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto", paddingRight: "4px" }}>
              
              {/* Profile Image Cropper */}
              <div className={s.editFieldGroup}>
                <span className={s.editFieldLabel}>Profile Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleEditPhotoChange} 
                  style={{ fontSize: "12px" }}
                />
                
                {editPhotoDataUrl && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <div 
                      ref={editContainerRef}
                      className={s.cropViewport}
                      onMouseDown={handleEditMouseDown}
                      onMouseMove={handleEditMouseMove}
                      onMouseUp={handleEditMouseUp}
                      onMouseLeave={handleEditMouseUp}
                      onTouchStart={handleEditTouchStart}
                      onTouchMove={handleEditTouchMove}
                      onTouchEnd={handleEditMouseUp}
                    >
                      <img
                        ref={editImgRef}
                        src={editPhotoDataUrl}
                        alt="Crop source"
                        style={{
                          position: "absolute",
                          transform: `translate(${editOffset.x}px, ${editOffset.y}px) scale(${editScale})`,
                          transformOrigin: "top left",
                          userSelect: "none",
                          pointerEvents: "none",
                        }}
                      />
                      <div className={s.cropCircleMask} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                      <span className={s.editFieldLabel} style={{ flexShrink: 0 }}>Zoom</span>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={editScale}
                        onChange={(e) => {
                          const nextScale = parseFloat(e.target.value);
                          setEditScale(nextScale);
                          setEditOffset(clampEditOffset(editOffset.x, editOffset.y, nextScale));
                        }}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* First & Last Name */}
              <div className={s.inlineFormGrid}>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>First Name</label>
                  <input
                    type="text"
                    className={s.editInputText}
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>Last Name (Optional)</label>
                  <input
                    type="text"
                    className={s.editInputText}
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* DOB & Gender */}
              <div className={s.inlineFormGrid}>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>Date of Birth</label>
                  <input
                    type="date"
                    className={s.editInputText}
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                  />
                </div>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>Gender</label>
                  <select
                    className={s.editSelect}
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Height & Weight */}
              <div className={s.inlineFormGrid}>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>Height (cm): {editHeightCm} cm ({cmToFtIn(editHeightCm).ft}′{cmToFtIn(editHeightCm).inches}″)</label>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    step="1"
                    value={editHeightCm}
                    onChange={(e) => setEditHeightCm(parseInt(e.target.value))}
                  />
                </div>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>Weight (kg): {editWeightKg} kg</label>
                  <input
                    type="range"
                    min="40"
                    max="150"
                    step="1"
                    value={editWeightKg}
                    onChange={(e) => setEditWeightKg(parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Dietary & Drinking */}
              <div className={s.inlineFormGrid}>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>Dietary Option</label>
                  <select
                    className={s.editSelect}
                    value={editDietary}
                    onChange={(e) => setEditDietary(e.target.value)}
                  >
                    <option value="veg">Vegetarian 🥦</option>
                    <option value="non_veg">Non-Vegetarian 🍗</option>
                    <option value="vegan">Vegan 🌱</option>
                    <option value="eggitarian">Eggitarian 🥚</option>
                    <option value="no_preference">No Preference</option>
                  </select>
                </div>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>Drinking Habits</label>
                  <select
                    className={s.editSelect}
                    value={editDrinking}
                    onChange={(e) => setEditDrinking(e.target.value)}
                  >
                    <option value="sober">Sober 🚫</option>
                    <option value="socially">Socially 🍻</option>
                    <option value="frequently">Frequently 🍷</option>
                    <option value="regularly">Regularly 🥃</option>
                    <option value="no_preference">No Preference</option>
                  </select>
                </div>
              </div>

              {/* Smoking & Fitness */}
              <div className={s.inlineFormGrid}>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>Smoking Habits</label>
                  <select
                    className={s.editSelect}
                    value={editSmoking}
                    onChange={(e) => setEditSmoking(e.target.value)}
                  >
                    <option value="non_smoker">Non-Smoker 🚭</option>
                    <option value="occasionally">Occasionally 🚬</option>
                    <option value="regularly">Regularly 💨</option>
                    <option value="no_preference">No Preference</option>
                  </select>
                </div>
                <div className={s.editFieldGroup}>
                  <label className={s.editFieldLabel}>Activity / Fitness</label>
                  <select
                    className={s.editSelect}
                    value={editFitness}
                    onChange={(e) => setEditFitness(e.target.value)}
                  >
                    <option value="not_active">Not Active 🛋️</option>
                    <option value="active">Active 🏃‍♂️</option>
                    <option value="gym_freak">Gym Freak 🏋️‍♂️</option>
                    <option value="no_preference">No Preference</option>
                  </select>
                </div>
              </div>

              {/* Hobbies Edit Selector */}
              <div className={s.editFieldGroup}>
                <label className={s.editFieldLabel}>
                  Hobbies (Select exactly 3): <span style={{ color: editHobbies.length === 3 ? "var(--success)" : "var(--accent-primary)" }}>{editHobbies.length}/3 Selected</span>
                </label>
                <div className={s.hobbiesEditGrid}>
                  {HOBBIES_LIST.map((hob) => {
                    const active = editHobbies.includes(hob.name);
                    return (
                      <button
                        key={hob.name}
                        type="button"
                        className={`${s.hobbyEditBtn} ${active ? s.hobbyEditBtnActive : ""}`}
                        onClick={() => handleToggleEditHobby(hob.name)}
                      >
                        <span>{hob.emoji}</span>
                        <span>{hob.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className={s.modalActions}>
              <button 
                type="button"
                className="btn btn-ghost" 
                onClick={() => setIsEditingProfile(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-primary btn-pill" 
                onClick={handleSaveProfileChanges}
                disabled={submitting || editPhotoLoading}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
