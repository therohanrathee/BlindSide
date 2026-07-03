"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";
import EyeLogo from "@/components/EyeLogo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const [token, setToken] = useState("");

  useEffect(() => {
    // We expect ?token=XYZ&email=ABC in the URL
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const urlToken = url.searchParams.get("token");
      const urlEmail = url.searchParams.get("email");

      if (urlToken && urlEmail) {
        setToken(urlToken);
        setEmail(decodeURIComponent(urlEmail));
        setReady(true);
      } else {
        setError("Invalid or missing password reset link.");
        setReady(true);
      }
    }
  }, []);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // 1. Update password using our secure backend API
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update password.");
      }

      // 2. Automatically sign the user in with their brand new password
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 3. Fetch is_onboarding_complete status
      const { data: userData } = await supabase
        .from("users")
        .select("is_onboarding_complete")
        .eq("id", authData.user.id)
        .single();

      // 4. Redirect to appropriate destination
      if (userData?.is_onboarding_complete) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
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
        <Link href="/" className={styles.authLogo}>
          <EyeLogo className={styles.authLogoEye} width={24} height={24} animated={true} />
          BlindSide
        </Link>

        {!ready ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "var(--text-secondary)" }}>Verifying secure link...</p>
          </div>
        ) : !email ? (
          <>
            <h1 className={styles.authTitle}>Link Expired</h1>
            <p className={styles.authSubtitle}>
              Your password reset link is invalid or has expired.
            </p>
            {error && <div className={styles.authError}>{error}</div>}
            <Link href="/auth" className={styles.authSubmit} style={{ textAlign: "center", display: "inline-block", textDecoration: "none" }}>
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1 className={styles.authTitle}>New Password</h1>
            <p className={styles.authSubtitle}>
              Please enter your new password below.
            </p>

            {error && <div className={styles.authError}>{error}</div>}

            <form className={styles.authForm} onSubmit={handlePasswordSubmit}>
              <div className={styles.authField}>
                <label>Account Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className={styles.disabledInput}
                />
              </div>

              <div className={styles.authField}>
                <label htmlFor="new-password">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className={styles.authSubmit}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
