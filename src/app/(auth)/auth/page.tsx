"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";
import EyeLogo from "@/components/EyeLogo";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"identifier" | "password">("identifier");
  const [exists, setExists] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill identifier from URL query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const emailParam = new URLSearchParams(window.location.search).get("identifier");
      if (emailParam) {
        setIdentifier(emailParam);
      }
    }
  }, []);

  const handleIdentifierSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setExists(data.exists);
      if (data.exists) {
        setStep("password");
      } else {
        // Save identifier to localStorage for secure, query-free transfer
        localStorage.setItem("blindside_pending_identifier", identifier.trim());
        window.location.href = "/onboarding";
      }
    } catch (err: any) {
      setError(err.message || "Failed to check account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password) return;

    setLoading(true);
    try {
      // 1. Sign in with password using Supabase client
      const isEmail = identifier.includes("@");
      let emailForSignIn = identifier;

      if (!isEmail) {
        // If it's a phone, fetch the associated email first from our database API
        const res = await fetch("/api/auth/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, getEmail: true }),
        });
        const data = await res.json();
        if (res.ok && data.email) {
          emailForSignIn = data.email;
        } else {
          throw new Error("Could not find the account details for this phone number.");
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailForSignIn,
        password,
      });

      if (authError) throw authError;

      // 2. Fetch is_onboarding_complete status
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("is_onboarding_complete")
        .eq("id", authData.user.id)
        .single();

      if (dbError) throw dbError;

      // 3. Redirect based on onboarding completeness
      if (userData?.is_onboarding_complete) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err: any) {
      setError(err.message || "Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authLayout}>
      <div className={styles.authBg} aria-hidden="true">
        <div className={styles.authGradient1} />
        <div className={styles.authGradient2} />
      </div>

      <div className={styles.authCard}>
        <Link href="/" className={styles.authLogo} id="auth-logo">
          <EyeLogo className={styles.authLogoEye} width={24} height={24} animated={true} />
          BlindSide
        </Link>

        {step === "identifier" ? (
          <>
            <h1 className={styles.authTitle}>Enter BlindSide</h1>
            <p className={styles.authSubtitle}>
              Enter your email or phone number to sign in or get started
            </p>

            {error && <div className={styles.authError} id="auth-error">{error}</div>}

            <form className={styles.authForm} onSubmit={handleIdentifierSubmit}>
              <div className={styles.authField}>
                <label htmlFor="auth-identifier">Personal Email or Phone Number</label>
                <input
                  type="text"
                  id="auth-identifier"
                  placeholder="you@gmail.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className={styles.authSubmit}
                disabled={loading}
                id="auth-continue"
              >
                {loading ? "Checking..." : "Continue →"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className={styles.authTitle}>Welcome Back</h1>
            <p className={styles.authSubtitle}>
              Please enter your password to sign in to your account
            </p>

            {error && <div className={styles.authError} id="auth-error">{error}</div>}

            <form className={styles.authForm} onSubmit={handlePasswordSubmit}>
              <div className={styles.authField}>
                <label>Email or Phone</label>
                <input
                  type="text"
                  value={identifier}
                  disabled
                  className={styles.disabledInput}
                />
              </div>

              <div className={styles.authField}>
                <label htmlFor="auth-password">Password</label>
                <input
                  type="password"
                  id="auth-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className={styles.authSubmit}
                disabled={loading}
                id="auth-login"
              >
                {loading ? "Signing in..." : "Log In →"}
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStep("identifier")}
                style={{ marginTop: "0.5rem" }}
              >
                ← Back
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
