"use client";

import { useState, useEffect, useRef, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import s from "./onboarding.module.css";
import AboutYouWizard from "./AboutYouWizard";
import SplashLoader from "@/components/SplashLoader";

// Minimal icons
function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}



interface University {
  id: string;
  name: string;
  email_domain: string;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Verification State (Step 1 & 2)
  const [primaryId, setPrimaryId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("blindside_pending_identifier") || "";
    }
    return "";
  });
  const [isPrimaryEmail, setIsPrimaryEmail] = useState(true);
  const [primaryOtp, setPrimaryOtp] = useState("");
  const [primaryOtpSent, setPrimaryOtpSent] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("blindside_pending_identifier");
    }
    return false;
  });
  const [primaryVerified, setPrimaryVerified] = useState(false);

  const [secondaryId, setSecondaryId] = useState("");
  const [secondaryOtp, setSecondaryOtp] = useState("");
  const [secondaryOtpSent, setSecondaryOtpSent] = useState(false);
  const [secondaryVerified, setSecondaryVerified] = useState(false);

  // Auth State (Step 3)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile State (Step 4)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "nonbinary" | "">("");
  const [heightUnit, setHeightUnit] = useState<"ft" | "cm">("ft");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [heightCm, setHeightCm] = useState("170");
  const [weight, setWeight] = useState(""); // weight in kg

  // Lifestyle & Fitness State
  const [dietary, setDietary] = useState("no_preference");
  const [drinking, setDrinking] = useState("sober");
  const [smoking, setSmoking] = useState("non_smoker");
  const [fitness, setFitness] = useState("not_active");

  // Hobbies State (Step 5)
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  // University Selection (Step 6)
  const [universities, setUniversities] = useState<University[]>([]);
  const [uniSearch, setUniSearch] = useState("");
  const [selectedUniId, setSelectedUniId] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uniEmail, setUniEmail] = useState("");
  const [uniOtp, setUniOtp] = useState("");
  const [uniOtpSent, setUniOtpSent] = useState(false);
  const [uniVerified, setUniVerified] = useState(false);
  
  // Location State (Step 7)
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [locationError, setLocationError] = useState("");

  // General Status
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const onboardingInitRef = useRef(false);

  const getDisplayStep = (sNum: number) => {
    if (sNum === 1 || sNum === 3) return 1;
    if (sNum === 4) return 2;
    if (sNum === 6 || sNum === 7) return 3;
    return 1;
  };

  // 1. Initial State Restoration & Load Universities
  useEffect(() => {
    if (onboardingInitRef.current) return;
    onboardingInitRef.current = true;

    async function initOnboarding() {
      // Load universities
      const { data: unis } = await supabase
        .from("universities")
        .select("id, name, email_domain")
        .eq("is_active", true);
      if (unis) setUniversities(unis);

      // Check current session and pending registration status
      const { data: { session } } = await supabase.auth.getSession();
      const pendingId = localStorage.getItem("blindside_pending_identifier");

      if (session && !pendingId) {
        setUserId(session.user.id);
        // Load user status
        const { data: userData } = await supabase
          .from("users")
          .select("first_name, last_name, date_of_birth, gender, height_cm, height_unit_pref, weight_kg, university_id, university_email, is_university_verified, is_onboarding_complete, email, phone")
          .eq("id", session.user.id)
          .single();

        if (userData?.is_onboarding_complete) {
          window.location.href = "/dashboard";
          return;
        }

        // Fetch profile details
        const { data: profileData } = await supabase
          .from("profiles")
          .select("hobbies, dietary, drinking, smoking, fitness")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (userData) {
          setPrimaryId(userData.email || "");
          setIsPrimaryEmail(true);
          setPrimaryVerified(true);

          // Pre-populate fields from DB if they exist
          if (userData.first_name) setFirstName(userData.first_name);
          if (userData.last_name) setLastName(userData.last_name);
          if (userData.date_of_birth) setDob(userData.date_of_birth);
          if (userData.gender) setGender(userData.gender as any);
          if (userData.height_cm) {
            setHeightCm(userData.height_cm.toString());
            setHeightUnit(userData.height_unit_pref as any);
            // Convert back to ft/in if preference is ft
            if (userData.height_unit_pref === "ft") {
              const inchesTotal = Math.round(Number(userData.height_cm) / 2.54);
              setHeightFt(Math.floor(inchesTotal / 12).toString());
              setHeightIn((inchesTotal % 12).toString());
            }
          }
          if (userData.weight_kg) setWeight(userData.weight_kg.toString());
          if (profileData?.hobbies) setSelectedHobbies(profileData.hobbies);
          if (profileData?.dietary) setDietary(profileData.dietary);
          if (profileData?.drinking) setDrinking(profileData.drinking);
          if (profileData?.smoking) setSmoking(profileData.smoking);
          if (profileData?.fitness) setFitness(profileData.fitness);
          if (userData.university_id) {
            setSelectedUniId(userData.university_id);
            const selectedUni = unis?.find(u => u.id === userData.university_id);
            if (selectedUni) setUniSearch(selectedUni.name);
          }
          if (userData.university_email) {
            setUniEmail(userData.university_email);
            setUniVerified(userData.is_university_verified);
            setUniOtpSent(userData.is_university_verified);
          }

          // Determine the correct step based on DB data completeness
          let targetStep = 4;
          const hasHobbiesData = profileData?.hobbies && profileData.hobbies.length === 3;
          const hasStep6Data = userData.is_university_verified && userData.university_id;

          if (hasStep6Data) {
            targetStep = 7;
          } else if (hasHobbiesData) {
            targetStep = 6;
          } else {
            targetStep = 4;
          }

          setStep(targetStep);
        }
      } else {
        if (session && pendingId) {
          // Clear previous user session since we have a new pending registration
          await supabase.auth.signOut();
        }

        // Try to load initial identifier from localStorage (transferred securely from /auth)
        if (pendingId) {
          localStorage.removeItem("blindside_pending_identifier");
          
          setPrimaryId(pendingId);
          setIsPrimaryEmail(true);
          
          // Trigger OTP sending automatically
          setSubmitting(true);
          try {
            const payload = { email: pendingId.trim().toLowerCase() };

            const res = await fetch("/api/otp/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              setPrimaryOtpSent(true);
              setActionSuccess("Verification code sent! Check your terminal console.");
            } else {
              const errData = await res.json();
              setActionError(errData.message || "Failed to send code.");
            }
          } catch {
            setActionError("Network error. Please check your connection.");
          } finally {
            setSubmitting(false);
          }
        } else {
          // Try to restore from localStorage (pre-registration abort cases)
          const localPrimaryId = localStorage.getItem("blindside_onboarding_primaryId");
          const localPrimaryVerified = localStorage.getItem("blindside_onboarding_primaryVerified") === "true";

          if (localPrimaryId) {
            setPrimaryId(localPrimaryId);
            setIsPrimaryEmail(true);
            setPrimaryVerified(localPrimaryVerified);
            setPrimaryOtpSent(localPrimaryVerified);
          }

          if (localPrimaryVerified) {
            setStep(3);
          } else {
            window.location.href = "/auth";
          }
        }
      }
      setLoading(false);
    }
    initOnboarding();
  }, [supabase, router, searchParams]);

  // Click outside listener for autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Primary OTP Sending & Verification
  const handleSendPrimaryOtp = async () => {
    setActionError("");
    setActionSuccess("");

    if (!primaryId.trim()) {
      setActionError("Please enter your email address.");
      return;
    }

    setIsPrimaryEmail(true);

    setSubmitting(true);
    try {
      const payload = { email: primaryId.trim().toLowerCase() };

      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPrimaryOtpSent(true);
        setActionSuccess("Verification code sent! Check your terminal console.");
      } else {
        const errData = await res.json();
        setActionError(errData.message || "Failed to send code.");
      }
    } catch {
      setActionError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPrimaryOtp = async () => {
    setActionError("");
    setActionSuccess("");

    if (!primaryOtp.trim()) {
      setActionError("Please enter the code.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        otp: primaryOtp,
        email: primaryId.trim().toLowerCase(),
      };

      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPrimaryVerified(true);
        // Persist progress to localStorage
        localStorage.setItem("blindside_onboarding_primaryId", primaryId);
        localStorage.setItem("blindside_onboarding_primaryVerified", "true");

        setActionSuccess("Verified!");
        setStep(3);
      } else {
        const errData = await res.json();
        setActionError(errData.message || "Invalid code.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Supabase Sign Up (Step 3)
  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setActionError("");

    if (password !== confirmPassword) {
      setActionError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setActionError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const emailVal = primaryId.trim().toLowerCase();
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailVal,
        password,
      });

      if (signUpError) throw signUpError;
      if (data?.user) {
        setUserId(data.user.id);
        
        // Clear local storage since registration is complete
        localStorage.removeItem("blindside_onboarding_primaryId");
        localStorage.removeItem("blindside_onboarding_primaryVerified");

        setActionSuccess("Account created successfully!");
        setStep(4);
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // 5. University OTP Verification (Step 6)
  const handleSendUniOtp = async () => {
    setActionError("");
    setActionSuccess("");

    if (!selectedUniId) {
      setActionError("Please select your university.");
      return;
    }
    if (!uniEmail) {
      setActionError("Please enter your university email.");
      return;
    }

    const selectedUni = universities.find(u => u.id === selectedUniId);
    if (!selectedUni) return;

    // Domain match check
    const emailDomain = uniEmail.split("@")[1]?.toLowerCase();
    if (emailDomain !== selectedUni.email_domain.toLowerCase()) {
      setActionError(`Email domain must end with @${selectedUni.email_domain}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email: uniEmail }),
      });

      if (res.ok) {
        setUniOtpSent(true);
        setActionSuccess("Verification code sent to university email! Check your terminal console.");
      } else {
        const errData = await res.json();
        setActionError(errData.message || "Failed to send code.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyUniOtp = async () => {
    setActionError("");
    setActionSuccess("");

    if (!uniOtp) {
      setActionError("Please enter the verification code.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email: uniEmail, otp: uniOtp }),
      });

      if (res.ok) {
        setUniVerified(true);
        setActionSuccess("University email verified successfully!");
      } else {
        const errData = await res.json();
        setActionError(errData.message || "Invalid or expired code.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Geolocation Acquisition (Step 7)
  const requestLocation = () => {
    setLocationError("");
    
    // Check for insecure context
    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setLocationStatus("denied");
      setLocationError("Location access requires a secure connection (HTTPS). Please access the app via localhost or HTTPS.");
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus("denied");
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
        setLocationStatus("granted");
        setLocationError("");
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationStatus("denied");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please reset location permissions in your browser's address bar/settings, or check macOS System Settings -> Privacy & Security -> Location Services.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable. Ensure your device has GPS active, is connected to the network, or check macOS Location Services.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError(error.message || "An unknown error occurred while retrieving location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleMockLocation = () => {
    setLat(28.6139); // New Delhi
    setLon(77.2090);
    setLocationStatus("granted");
    setLocationError("");
  };

  // Detect OS / Device discretely
  const detectDeviceOS = () => {
    if (typeof window === "undefined") return "Unknown";
    const ua = navigator.userAgent || "";
    
    if (/android/i.test(ua)) {
      return "Android Device";
    }
    
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      const w = window.screen.width;
      const h = window.screen.height;
      if ((w === 393 && h === 852) || (w === 852 && h === 393)) {
        return "iPhone 15 / 15 Pro";
      }
      if ((w === 430 && h === 932) || (w === 932 && h === 430)) {
        return "iPhone 15 Plus / 15 Pro Max";
      }
      return "iPhone";
    }
    
    if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(ua)) {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl) {
          const debugInfo = (gl as any).getExtension("WEBGL_debug_renderer_info");
          if (debugInfo) {
            const rendererName = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_ID) || "";
            if (/Apple/i.test(rendererName)) {
              if (/M3/i.test(rendererName)) return "Macbook Air/Pro (M3)";
              if (/M2/i.test(rendererName)) return "Macbook Air/Pro (M2)";
              if (/M1/i.test(rendererName)) return "Macbook Air/Pro (M1)";
              return "Macbook (Apple Silicon)";
            }
          }
        }
      } catch (e) {}
      return "Macbook / macOS";
    }
    
    if (/Windows|Win32|Win64|Windows NT|WOW64/.test(ua)) {
      return "Windows PC";
    }
    
    if (/Linux/.test(ua)) {
      return "Linux PC";
    }
    
    return "Unknown OS";
  };

  // 7. Master Onboarding Submission
  const handleCompleteOnboarding = async () => {
    setActionError("");

    if (locationStatus !== "granted" || !lat || !lon) {
      setActionError("Please authorize location access to verify campus match proximity.");
      return;
    }

    // Convert height to cm
    let canonicalHeight = 170;
    if (heightUnit === "ft") {
      const ft = parseFloat(heightFt);
      const inch = parseFloat(heightIn);
      canonicalHeight = Math.round((ft * 30.48) + (inch * 2.54));
    } else {
      canonicalHeight = parseInt(heightCm);
    }

    setSubmitting(true);
    try {
      const payload = {
        userId,
        firstName,
        lastName,
        dateOfBirth: dob,
        heightCm: canonicalHeight,
        heightUnitPref: heightUnit,
        weightKg: weight ? parseFloat(weight) : null,
        gender,
        hobbies: selectedHobbies,
        universityId: selectedUniId,
        universityEmail: uniEmail,
        latitude: lat,
        longitude: lon,
        phone: isPrimaryEmail ? secondaryId : primaryId,
        deviceOs: detectDeviceOS(),
        dietary,
        drinking,
        smoking,
        fitness,
      };

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const errData = await res.json();
        setActionError(errData.message || "Failed to complete onboarding.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };



  // Autocomplete search handlers
  const handleSelectUniversity = async (uni: University) => {
    setSelectedUniId(uni.id);
    setUniSearch(uni.name);
    setShowSuggestions(false);
    setUniOtpSent(false);
    setUniVerified(false);

    // Save selected university ID to public.users immediately
    if (userId) {
      const { error: uniUpdateError } = await supabase
        .from("users")
        .update({ university_id: uni.id })
        .eq("id", userId);
      
      if (uniUpdateError) {
        console.error("Failed to update selected university ID:", uniUpdateError);
      }
    }
  };

  const filteredUnis = universities.filter(u =>
    u.name.toLowerCase().includes(uniSearch.toLowerCase())
  );

  // Wizard completion handler (Step 4)
  const handleWizardComplete = async (result: {
    firstName: string; lastName: string; dob: string;
    gender: "male" | "female" | "nonbinary";
    heightCm: number; heightUnit: "ft" | "cm"; weightKg?: number | null;
    dietary: string; drinking: string; smoking: string; fitness: string;
    hobbies: string[];
    photoUrl?: string | null;
  }) => {
    setFirstName(result.firstName);
    setLastName(result.lastName);
    setDob(result.dob);
    setGender(result.gender as any);
    setHeightCm(result.heightCm.toString());
    setHeightUnit(result.heightUnit);
    setWeight(result.weightKg ? result.weightKg.toString() : "");
    setDietary(result.dietary);
    setDrinking(result.drinking);
    setSmoking(result.smoking);
    setFitness(result.fitness);
    setSelectedHobbies(result.hobbies);

    setSubmitting(true);
    try {
      const { error: saveError } = await supabase
        .from("users")
        .update({
          first_name: result.firstName,
          last_name: result.lastName,
          date_of_birth: result.dob,
          gender: result.gender,
          height_cm: result.heightCm,
          height_unit_pref: result.heightUnit,
          weight_kg: result.weightKg !== undefined && result.weightKg !== null ? result.weightKg : null,
        })
        .eq("id", userId);

      if (saveError) throw saveError;

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: userId,
          dietary: result.dietary,
          drinking: result.drinking,
          smoking: result.smoking,
          fitness: result.fitness,
          hobbies: result.hobbies,
          photo_url: result.photoUrl || null,
        }, { onConflict: "user_id" });

      if (profileError) throw profileError;

      setStep(6);
    } catch (err: any) {
      setActionError("Failed to save profile details. Please try again.");
      console.error("Error saving Step 4:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Step transition helpers
  const handleNextStep = async () => {
    setActionError("");
    setActionSuccess("");

    if (step === 6) {
      if (!uniVerified) return;

      setSubmitting(true);
      try {
        const { error: uniError } = await supabase
          .from("users")
          .update({
            university_id: selectedUniId,
          })
          .eq("id", userId);

        if (uniError) throw uniError;
        setStep(7);
      } catch (err: any) {
        setActionError("Failed to save university details. Please try again.");
        console.error("Error saving Step 6:", err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handlePrevStep = () => {
    setActionError("");
    setActionSuccess("");
    if (step > 4) {
      if (step === 6) {
        setStep(4);
      } else {
        setStep(step - 1);
      }
    }
  };

  if (loading) {
    return <SplashLoader text="Preparing Onboarding..." />;
  }

  return (
    <div className={s.onboardingLayout}>
      <div className={s.ambientBg} aria-hidden="true" />

      {/* Header & Progress */}
      <header className={s.onboardingHeader}>
        <span className={s.brand}>BlindSide</span>
        <div className={s.progressBarContainer}>
          <div className={s.progressBar} style={{ width: `${(getDisplayStep(step) / 3) * 100}%` }} />
        </div>
        <span className={s.stepCounter}>Step {getDisplayStep(step)} of 3</span>
      </header>

      {/* Main card */}
      <main className={s.container}>
        <div className={s.stepCard}>
          {actionError && <div className={s.onbError}>{actionError}</div>}

          {/* STEP 1: INITIAL ID VERIFICATION */}
          {step === 1 && (
            <div className={s.stepContent}>
              <h1 className={s.stepTitle}>Verify contact</h1>

              <div className={s.verifiedTargetRow}>
                <button
                  type="button"
                  className={s.backToEditBtn}
                  onClick={() => {
                    window.location.href = `/auth?identifier=${encodeURIComponent(primaryId)}`;
                  }}
                >
                  ← {primaryId}
                </button>
              </div>

              <div className={s.formGroup}>
                <label className={s.label} htmlFor="primary-otp">Enter 6-Digit OTP</label>
                <div className={s.verifyEmailRow}>
                  <input
                    type="text"
                    id="primary-otp"
                    className={s.input}
                    maxLength={6}
                    placeholder="Enter code"
                    value={primaryOtp}
                    onChange={(e) => setPrimaryOtp(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className={s.inlineSendBtn}
                    onClick={handleVerifyPrimaryOtp}
                    disabled={submitting || !primaryOtp}
                  >
                    {submitting && primaryOtp ? "Verifying..." : submitting ? "Sending..." : "Verify"}
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* STEP 3: PASSWORD & REGISTER */}
          {step === 3 && (
            <div className={s.stepContent}>
              <h1 className={s.stepTitle}>Secure your account</h1>
              <p className={s.stepSubtitle}>Create a password to access your account in the future.</p>

              <form onSubmit={handleSignUp} className={s.authForm}>
                <div className={s.formGroup}>
                  <label className={s.label} htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    className={s.input}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className={s.formGroup}>
                  <label className={s.label} htmlFor="confirm-password">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    className={s.input}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-pill"
                  style={{ width: "100%", marginTop: "1rem" }}
                  disabled={submitting || !password || !confirmPassword}
                >
                  {submitting ? "Registering..." : "Create Account →"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: ABOUT YOU — Interactive Sub-step Wizard */}
          {step === 4 && (
            <AboutYouWizard
              userId={userId}
              initialFirstName={firstName}
              initialLastName={lastName}
              initialDob={dob}
              initialGender={gender}
              initialHeightCm={heightCm ? parseInt(heightCm) : undefined}
              initialWeightKg={weight ? parseFloat(weight) : undefined}
              initialDietary={dietary}
              initialDrinking={drinking}
              initialSmoking={smoking}
              initialFitness={fitness}
              initialHobbies={selectedHobbies}
              onComplete={handleWizardComplete}
              onError={setActionError}
            />
          )}

          {/* STEP 6: CAMPUS SELECTION & VERIFICATION */}
          {step === 6 && (
            <div className={s.stepContent}>
              <h1 className={s.stepTitle}>Verify your college</h1>

              {uniOtpSent && !uniVerified ? (
                <>
                  <div className={s.verifiedTargetRow}>
                    <button
                      type="button"
                      className={s.backToEditBtn}
                      onClick={() => {
                        setUniOtpSent(false);
                        setUniVerified(false);
                        setUniOtp("");
                        setActionSuccess("");
                        setActionError("");
                      }}
                    >
                      ← {uniEmail}
                    </button>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.label} htmlFor="uni-otp">Enter 6-Digit OTP</label>
                    <div className={s.verifyEmailRow}>
                      <input
                        type="text"
                        id="uni-otp"
                        className={s.input}
                        maxLength={6}
                        placeholder="Enter code"
                        value={uniOtp}
                        onChange={(e) => setUniOtp(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className={s.inlineSendBtn}
                        onClick={handleVerifyUniOtp}
                        disabled={submitting || !uniOtp}
                      >
                        {submitting ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {!uniVerified && (
                    <p className={s.stepSubtitle}>Choose your campus from our verified list and authenticate your university email.</p>
                  )}

                  <div className={s.formGroup} ref={suggestionsRef}>
                    <label className={s.label} htmlFor="uni-search">University</label>
                    <input
                      type="text"
                      id="uni-search"
                      className={s.input}
                      placeholder="Type to search your university..."
                      value={uniSearch}
                      onChange={(e) => {
                        setUniSearch(e.target.value);
                        setSelectedUniId("");
                        setUniVerified(false);
                        setUniOtpSent(false);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      disabled={uniVerified}
                    />

                    {showSuggestions && uniSearch.trim().length > 0 && (
                      <ul className={s.suggestionsList}>
                        {filteredUnis.length > 0 ? (
                          filteredUnis.map((uni) => (
                            <li
                              key={uni.id}
                              className={s.suggestionItem}
                              onClick={() => handleSelectUniversity(uni)}
                            >
                              {uni.name}
                            </li>
                          ))
                        ) : (
                          <li className={s.suggestionItem} style={{ color: "var(--text-muted)", cursor: "default" }}>
                            No colleges found
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {selectedUniId && (
                    <div className={s.formGroup}>
                      <label className={s.label} htmlFor="uni-email">University Email</label>
                      <div className={s.verifyEmailRow}>
                        <input
                          type="email"
                          id="uni-email"
                          className={s.input}
                          placeholder="you@college.ac.in"
                          value={uniEmail}
                          onChange={(e) => setUniEmail(e.target.value)}
                          disabled={uniVerified}
                        />
                        {!uniVerified && (
                          <button
                            type="button"
                            className={s.inlineSendBtn}
                            onClick={handleSendUniOtp}
                            disabled={submitting || !uniEmail}
                          >
                            {submitting ? "Sending..." : "Send OTP"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {uniVerified && (
                    <div className={s.formGroup} style={{ marginTop: "1rem" }}>
                      <div className={s.onbSuccess} style={{ marginBottom: 0 }}>
                        Campus Verified ✓
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 7: PROXIMITY LOCATION */}
          {step === 7 && (
            <div className={s.stepContent}>
              <h1 className={s.stepTitle}>Proximity validation</h1>
              <p className={s.stepSubtitle}>Enable location parameters to search for matches near your campus.</p>

              <div className={s.locationCard}>
                <div className={s.locationHeader}>
                  <ShieldIcon />
                  <span>Location Authorization</span>
                </div>
                <p className={s.locationText}>
                  We require coordinates to match students close to one another and verify your proximity limits.
                </p>
                <button
                  type="button"
                  className={`${s.locationBtn} ${locationStatus === "granted" ? s.locationGranted : ""}`}
                  onClick={requestLocation}
                  disabled={locationStatus === "granted"}
                >
                  {locationStatus === "idle" && "Authorize Location Access"}
                  {locationStatus === "requesting" && "Acquiring Coordinates..."}
                  {locationStatus === "granted" && "Coordinates Verified ✓"}
                  {locationStatus === "denied" && "Access Denied (Re-authorize)"}
                </button>

                {locationError && (
                  <p className={s.locationErrorText}>
                    ⚠️ {locationError}
                  </p>
                )}

                {typeof window !== "undefined" && 
                 (window.location.hostname === "localhost" || 
                  window.location.hostname === "127.0.0.1" || 
                  window.location.hostname.startsWith("192.168.")) && 
                 locationStatus !== "granted" && (
                  <button
                    type="button"
                    onClick={handleMockLocation}
                    style={{
                      marginTop: "0.5rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px dashed rgba(255,255,255,0.15)",
                      color: "var(--text-secondary)",
                      padding: "0.5rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--text-xs)",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center",
                      transition: "all 0.2s"
                    }}
                  >
                    🔧 Use Mock Location (Development Only)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons (steps 6-7; step 4 uses the internal wizard navigation) */}
          {step >= 6 && (
            <footer className={s.stepActions}>
              <button type="button" className="btn btn-ghost" onClick={handlePrevStep}>
                ← Back
              </button>

              {step < 7 ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-pill"
                  onClick={handleNextStep}
                  disabled={step === 6 && !uniVerified}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-pill"
                  onClick={handleCompleteOnboarding}
                  disabled={submitting || locationStatus !== "granted"}
                >
                  {submitting ? "Finalizing Account..." : "Complete Setup ✓"}
                </button>
              )}
            </footer>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<SplashLoader text="Loading..." />}>
      <OnboardingContent />
    </Suspense>
  );
}

