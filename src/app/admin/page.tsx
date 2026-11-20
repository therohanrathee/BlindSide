"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import s from "./admin.module.css";

// Minimal SVG Icons
function ShieldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function RefreshIcon({ size = 16, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: spinning ? "spin 1s linear infinite" : "none" }}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function LightningIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function calculateAge(dobString?: string): number {
  if (!dobString) return 20;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function formatLastActive(dateStr?: string | null): { text: string; isRecent: boolean; title: string } {
  if (!dateStr) return { text: "Never", isRecent: false, title: "No recorded activity" };

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return { text: "Never", isRecent: false, title: "Invalid date" };

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const fullDate = date.toLocaleString();

  if (diffSec < 60 && diffSec >= 0) {
    return { text: "Just now", isRecent: true, title: fullDate };
  }
  if (diffMin < 60 && diffMin >= 0) {
    return { text: `${diffMin}m ago`, isRecent: diffMin <= 15, title: fullDate };
  }
  if (diffHour < 24 && diffHour >= 0) {
    return { text: `${diffHour}h ago`, isRecent: false, title: fullDate };
  }
  if (diffDay === 1) {
    return { text: "Yesterday", isRecent: false, title: fullDate };
  }
  if (diffDay < 7 && diffDay > 1) {
    return { text: `${diffDay}d ago`, isRecent: false, title: fullDate };
  }

  return { text: date.toLocaleDateString(), isRecent: false, title: fullDate };
}

export default function AdminDashboardPage() {
  // Authentication State
  const [authStatus, setAuthStatus] = useState<"checking" | "unauthenticated" | "authenticated">("checking");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "canvas" | "users" | "requests" | "matches" | "reports">("canvas");

  // Admin Data State
  const [dataLoading, setDataLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);

  // Interactive Node Canvas Matchmaker State
  const [selectedNodeA, setSelectedNodeA] = useState<any | null>(null);
  const [selectedNodeB, setSelectedNodeB] = useState<any | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchScoreInput, setMatchScoreInput] = useState<number>(88);
  const [manualMatchLoading, setManualMatchLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Users Tab Filters & Search
  const [userSearch, setUserSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Wallet Edit Modal State
  const [editingWalletUser, setEditingWalletUser] = useState<any | null>(null);
  const [newWalletBalance, setNewWalletBalance] = useState<number>(0);
  const [walletReason, setWalletReason] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);

  // Full Profile View Modal State
  const [viewingProfileUser, setViewingProfileUser] = useState<any | null>(null);

  // User Deletion State
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Credit Drop Modal State
  const [droppingCreditUser, setDroppingCreditUser] = useState<any | null>(null);
  const [dropAmount, setDropAmount] = useState<number>(69);
  const [dropLoading, setDropLoading] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Match Chat Transcript Modal State
  const [viewingMatch, setViewingMatch] = useState<any | null>(null);
  const [transcriptMessages, setTranscriptMessages] = useState<any[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // 1. Verify authentication on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/check");
        const json = await res.json();
        if (json.authenticated) {
          setAuthStatus("authenticated");
          fetchAdminData();
        } else {
          setAuthStatus("unauthenticated");
        }
      } catch {
        setAuthStatus("unauthenticated");
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch full admin data
  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      if (res.status === 401) {
        setAuthStatus("unauthenticated");
        return;
      }
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
        setUsers(json.users || []);
        setRequests(json.requests || []);
        setActiveRequests(json.activeRequests || []);
        setMatches(json.matches || []);
        setReports(json.reports || []);
        setUniversities(json.universities || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // 3. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setAuthStatus("authenticated");
        fetchAdminData();
      } else {
        setLoginError(json.error || "Access Denied: Incorrect password.");
      }
    } catch {
      setLoginError("Failed to connect to authentication server.");
    } finally {
      setLoginLoading(false);
    }
  };

  // 4. Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      setAuthStatus("unauthenticated");
      setPasswordInput("");
    }
  };

  // 5. Node Click / Link Logic on Match Canvas
  const handleNodeClick = (req: any) => {
    if (!selectedNodeA) {
      // First node selected
      setSelectedNodeA(req);
    } else if (selectedNodeA.id === req.id) {
      // Deselect if clicking the same node
      setSelectedNodeA(null);
    } else {
      // Second node selected -> trigger confirmation modal
      setSelectedNodeB(req);
      setShowMatchModal(true);
    }
  };

  // 6. Execute Manual Match (Bypassing all filters)
  const handleExecuteManualMatch = async () => {
    if (!selectedNodeA || !selectedNodeB) return;
    setManualMatchLoading(true);

    try {
      const res = await fetch("/api/admin/manual-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_a_id: selectedNodeA.id,
          request_b_id: selectedNodeB.id,
          compatibility_score: matchScoreInput,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const nameA = selectedNodeA.user?.first_name || "User A";
        const nameB = selectedNodeB.user?.first_name || "User B";
        setToastMessage(`⚡ Successfully matched ${nameA} & ${nameB}! Push notifications sent.`);
        setTimeout(() => setToastMessage(null), 5000);

        // Reset canvas selection
        setSelectedNodeA(null);
        setSelectedNodeB(null);
        setShowMatchModal(false);

        // Refresh data
        await fetchAdminData();
      } else {
        alert(json.error || "Failed to execute manual match.");
      }
    } catch (err: any) {
      alert("Error executing match: " + err.message);
    } finally {
      setManualMatchLoading(false);
    }
  };

  // 7. Handle Wallet Update
  const handleSaveWallet = async () => {
    if (!editingWalletUser) return;
    setWalletLoading(true);

    try {
      const res = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingWalletUser.id,
          new_balance: parseFloat(newWalletBalance as any),
          reason: walletReason || "Manual adjustment from Admin Console",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setEditingWalletUser(null);
        setWalletReason("");
        await fetchAdminData();
      } else {
        alert(json.error || "Failed to update wallet balance.");
      }
    } catch (err: any) {
      alert("Wallet update error: " + err.message);
    } finally {
      setWalletLoading(false);
    }
  };

  // 8. Toggle User Suspension
  const handleToggleSuspension = async (user: any) => {
    const action = user.is_suspended ? "restore" : "suspend";
    if (!confirm(`Are you sure you want to ${action} user ${user.first_name || user.email}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          is_suspended: !user.is_suspended,
        }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error("Suspension error:", err);
    }
  };

  // 9. Permanently Delete User (Hard Purge)
  const handleExecuteDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);

    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: deletingUser.id }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setToastMessage(`🗑️ User ${deletingUser.first_name || ""} (${deletingUser.email || deletingUser.id}) completely deleted.`);
        setTimeout(() => setToastMessage(null), 5000);
        setDeletingUser(null);
        await fetchAdminData();
      } else {
        alert(json.error || "Failed to delete user.");
      }
    } catch (err: any) {
      alert("Error deleting user: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 10. Execute Credit Drop & Send Email Notification
  const handleExecuteDropCredits = async () => {
    if (!droppingCreditUser) return;
    setDropLoading(true);

    try {
      const res = await fetch("/api/admin/drop-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: droppingCreditUser.id,
          amount: dropAmount || 69,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setToastMessage(
          `🎁 Dropped ₹${json.amount} to ${droppingCreditUser.first_name || "user"}! ${
            json.email_sent ? "Email sent from drops@blindside.in" : "Wallet updated."
          }`
        );
        setTimeout(() => setToastMessage(null), 6000);
        setDroppingCreditUser(null);
        await fetchAdminData();
      } else {
        alert(json.error || "Failed to drop credits.");
      }
    } catch (err: any) {
      alert("Error dropping credits: " + err.message);
    } finally {
      setDropLoading(false);
    }
  };

  // 11. Load Chat Transcript
  const handleViewTranscript = async (match: any) => {
    setViewingMatch(match);
    setTranscriptLoading(true);
    setTranscriptMessages([]);

    try {
      const res = await fetch(`/api/admin/messages?match_id=${match.id}`);
      const json = await res.json();
      if (json.success) {
        setTranscriptMessages(json.messages || []);
      }
    } catch (err) {
      console.error("Error loading transcript:", err);
    } finally {
      setTranscriptLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase();
      const matchSearch =
        !q ||
        (u.first_name && u.first_name.toLowerCase().includes(q)) ||
        (u.last_name && u.last_name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.universities?.name && u.universities.name.toLowerCase().includes(q)) ||
        u.id.toLowerCase().includes(q);

      const matchGender =
        genderFilter === "all" || u.gender === genderFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "onboarded" && u.is_onboarding_complete) ||
        (statusFilter === "pending" && !u.is_onboarding_complete) ||
        (statusFilter === "suspended" && u.is_suspended) ||
        (statusFilter === "funded" && u.wallet_balance > 0);

      return matchSearch && matchGender && matchStatus;
    });
  }, [users, userSearch, genderFilter, statusFilter]);

  // Render Loading Check
  if (authStatus === "checking") {
    return (
      <div className={s.adminRoot}>
        <div className={s.loginContainer}>
          <div style={{ textAlign: "center", color: "#9ca3af" }}>
            <RefreshIcon size={32} spinning />
            <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>Authenticating Admin Console...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Login Terminal if Unauthenticated
  if (authStatus === "unauthenticated") {
    return (
      <div className={s.adminRoot}>
        <div className={s.loginContainer}>
          <div className={s.loginCard}>
            <div className={s.loginBadge}>
              <ShieldIcon size={14} /> Master Security Gate
            </div>
            <h1 className={s.loginTitle}>BlindSide Control Room</h1>
            <p className={s.loginSubtitle}>
              Protected infrastructure console. Authorized administrators only.
            </p>

            <form onSubmit={handleLogin}>
              <div className={s.loginInputGroup}>
                <label className={s.inputLabel}>Master Access Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password..."
                  className={s.loginInput}
                  autoFocus
                  required
                />
              </div>

              <button type="submit" className={s.loginBtn} disabled={loginLoading || !passwordInput}>
                {loginLoading ? "Verifying..." : "Authenticate & Enter"}
              </button>

              {loginError && <div className={s.loginError}>{loginError}</div>}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render Authenticated Master Dashboard
  return (
    <div className={s.adminRoot}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "2rem",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
            zIndex: 9999,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <LightningIcon size={18} /> {toastMessage}
        </div>
      )}

      <div className={s.dashboardShell}>
        {/* Top Bar */}
        <header className={s.topBar}>
          <div className={s.brandGroup}>
            <h1 className={s.brandTitle}>
              <ShieldIcon size={22} /> BlindSide Master Console
            </h1>
            <div className={s.statusIndicator}>
              <div className={s.pulseDot} /> Live
            </div>
          </div>

          <div className={s.topBarRight}>
            <button className={s.iconBtn} onClick={fetchAdminData} disabled={dataLoading} title="Refresh Live Data">
              <RefreshIcon size={14} spinning={dataLoading} /> Refresh Data
            </button>
            <button className={s.logoutBtn} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className={s.tabNav}>
          <button
            className={`${s.tabBtn} ${activeTab === "canvas" ? s.tabBtnActive : ""}`}
            onClick={() => setActiveTab("canvas")}
          >
            🕸️ Match Canvas (Nodes)
            {activeRequests.length > 0 && <span className={s.tabBadge}>{activeRequests.length}</span>}
          </button>
          <button
            className={`${s.tabBtn} ${activeTab === "overview" ? s.tabBtnActive : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Analytics & Stats
          </button>
          <button
            className={`${s.tabBtn} ${activeTab === "users" ? s.tabBtnActive : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 Users & Wallets
            <span className={s.tabBadge}>{users.length}</span>
          </button>
          <button
            className={`${s.tabBtn} ${activeTab === "requests" ? s.tabBtnActive : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            🎯 Match Requests
            <span className={s.tabBadge}>{requests.length}</span>
          </button>
          <button
            className={`${s.tabBtn} ${activeTab === "matches" ? s.tabBtnActive : ""}`}
            onClick={() => setActiveTab("matches")}
          >
            💬 Matches & Chats
            <span className={s.tabBadge}>{matches.length}</span>
          </button>
          <button
            className={`${s.tabBtn} ${activeTab === "reports" ? s.tabBtnActive : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            🛡️ Reports
            {stats?.pendingReports > 0 && (
              <span className={s.tabBadge} style={{ background: "#ef4444", color: "white" }}>
                {stats.pendingReports}
              </span>
            )}
          </button>
        </nav>

        {/* Main Content View */}
        <main className={s.mainContent}>
          {/* =========================================================================
              TAB 2: INTERACTIVE MATCH CANVAS (NODES)
              ========================================================================= */}
          {activeTab === "canvas" && (
            <div>
              <div className={s.canvasWrapper}>
                <div className={s.canvasGridBackground} />

                {/* Toolbar */}
                <div className={s.canvasToolbar}>
                  <div className={s.canvasInstruction}>
                    {selectedNodeA ? (
                      <span>
                        Linking: <strong>{selectedNodeA.user?.first_name || "User A"}</strong> ⚡ Click any other user node to connect and manually match!
                      </span>
                    ) : (
                      <span>
                        💡 <strong>Interactive Matchmaker</strong>: Click or select two user nodes to connect them. Manual matching <strong>bypasses all filters</strong>.
                      </span>
                    )}
                  </div>
                  {selectedNodeA && (
                    <button
                      className={s.smallActionBtn}
                      style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5" }}
                      onClick={() => setSelectedNodeA(null)}
                    >
                      Cancel Selection
                    </button>
                  )}
                </div>

                {/* Nodes Display Area */}
                <div className={s.nodeBoard}>
                  {activeRequests.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#6b7280", marginTop: "6rem" }}>
                      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                      <h3 style={{ color: "#e5e7eb", margin: 0 }}>No Active Match Requests In Queue</h3>
                      <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        When users submit active match requests, they will appear here as glowing visual nodes.
                      </p>
                    </div>
                  ) : (
                    activeRequests.map((req) => {
                      const user = req.user || {};
                      const isMale = user.gender === "male";
                      const isFemale = user.gender === "female";
                      const genderClass = isMale ? s.nodeMale : isFemale ? s.nodeFemale : s.nodeOther;
                      const isSelected = selectedNodeA?.id === req.id;
                      const photoUrl = req.user_photo_url || user.profiles?.photo_url;
                      const age = calculateAge(user.date_of_birth);

                      return (
                        <div
                          key={req.id}
                          className={`${s.nodeCard} ${genderClass} ${isSelected ? s.nodeSelected : ""}`}
                          onClick={() => handleNodeClick(req)}
                        >
                          <div className={s.nodeHeader}>
                            {photoUrl ? (
                              <img src={photoUrl} alt="Avatar" className={s.nodeAvatar} />
                            ) : (
                              <div className={s.nodeAvatar}>
                                {isMale ? "👨" : isFemale ? "👩" : "👤"}
                              </div>
                            )}

                            <div className={s.nodeInfo}>
                              <h4 className={s.nodeName}>
                                {user.first_name || "Anonymous"} {user.last_name || ""}
                              </h4>
                              <div className={s.nodeMeta}>
                                {user.gender?.toUpperCase() || "N/A"} • {age} yrs • {user.height_cm ? `${user.height_cm} cm` : ""}
                              </div>
                              <div className={s.nodeMeta} style={{ color: "#7c5ce8", fontWeight: 600 }}>
                                🎓 {user.universities?.name || "Campus"}
                              </div>
                            </div>
                          </div>

                          <div className={s.nodePrefs}>
                            <div className={s.nodePrefItem}>
                              <span style={{ color: "#9ca3af" }}>Seeking:</span>
                              <span style={{ fontWeight: 600, color: "#ffffff" }}>
                                {req.pref_gender?.toUpperCase()} ({req.pref_age_min}–{req.pref_age_max} yrs)
                              </span>
                            </div>
                            <div className={s.nodePrefItem}>
                              <span style={{ color: "#9ca3af" }}>Scope:</span>
                              <span style={{ textTransform: "capitalize", color: "#60a5fa" }}>{req.scope}</span>
                            </div>
                            <div className={s.nodePrefItem}>
                              <span style={{ color: "#9ca3af" }}>Fee Paid:</span>
                              <span style={{ color: "#34d399", fontWeight: 700 }}>₹{req.fee_paid} ({req.payment_method})</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`${s.nodeActionBtn} ${isSelected ? s.nodeCardSelectedBtn : ""}`}
                          >
                            {isSelected ? "⚡ Linking Target..." : selectedNodeA ? "Connect & Match →" : "Select Node"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 1: ANALYTICS & OVERVIEW
              ========================================================================= */}
          {activeTab === "overview" && stats && (
            <div>
              {/* Stat Cards */}
              <div className={s.statsGrid}>
                <div className={s.statCard}>
                  <div className={s.statIcon}>👥</div>
                  <div className={s.statLabel}>Total Users</div>
                  <div className={s.statValue}>{stats.totalUsers}</div>
                  <div className={s.statSubtext}>{stats.onboardedUsers} completed onboarding ({stats.suspendedUsers} suspended)</div>
                </div>

                <div className={s.statCard}>
                  <div className={s.statIcon}>🎯</div>
                  <div className={s.statLabel}>Active Match Queue</div>
                  <div className={s.statValue} style={{ color: "#e83a72" }}>{stats.activeRequestsCount}</div>
                  <div className={s.statSubtext}>{stats.totalRequests} total requests submitted all-time</div>
                </div>

                <div className={s.statCard}>
                  <div className={s.statIcon}>💘</div>
                  <div className={s.statLabel}>Total Matches</div>
                  <div className={s.statValue} style={{ color: "#a855f7" }}>{stats.totalMatches}</div>
                  <div className={s.statSubtext}>{stats.activeChats} active chat windows | {stats.plannedDates} dates planned</div>
                </div>

                <div className={s.statCard}>
                  <div className={s.statIcon}>💳</div>
                  <div className={s.statLabel}>Total Razorpay Collected</div>
                  <div className={s.statValue} style={{ color: "#10b981" }}>
                    ₹{stats.totalRazorpayRevenue ?? 0}
                  </div>
                  <div className={s.statSubtext}>
                    {stats.razorpaySuccessCount ?? 0} successful payments | ₹{stats.totalWalletBalance} wallet float
                  </div>
                </div>
              </div>

              {/* Ratios & Distributions */}
              <div className={s.overviewSections}>
                {/* Gender Balance */}
                <div className={s.overviewCard}>
                  <div className={s.cardTitle}>
                    <span>Gender Distribution</span>
                    <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>{stats.totalUsers} Total</span>
                  </div>

                  <div className={s.ratioBar}>
                    <div
                      className={s.ratioSegmentMale}
                      style={{ width: `${(stats.maleUsers / Math.max(1, stats.totalUsers)) * 100}%` }}
                      title={`Male: ${stats.maleUsers}`}
                    />
                    <div
                      className={s.ratioSegmentFemale}
                      style={{ width: `${(stats.femaleUsers / Math.max(1, stats.totalUsers)) * 100}%` }}
                      title={`Female: ${stats.femaleUsers}`}
                    />
                    <div
                      className={s.ratioSegmentOther}
                      style={{ width: `${(stats.otherUsers / Math.max(1, stats.totalUsers)) * 100}%` }}
                      title={`Other: ${stats.otherUsers}`}
                    />
                  </div>

                  <div className={s.ratioLegend}>
                    <span style={{ color: "#3b82f6" }}>● Male: {stats.maleUsers} ({Math.round((stats.maleUsers / Math.max(1, stats.totalUsers)) * 100)}%)</span>
                    <span style={{ color: "#ec4899" }}>● Female: {stats.femaleUsers} ({Math.round((stats.femaleUsers / Math.max(1, stats.totalUsers)) * 100)}%)</span>
                    {stats.otherUsers > 0 && (
                      <span style={{ color: "#a855f7" }}>● Other: {stats.otherUsers}</span>
                    )}
                  </div>
                </div>

                {/* Universities Distribution */}
                <div className={s.overviewCard}>
                  <div className={s.cardTitle}>
                    <span>University Breakdown</span>
                    <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>{universities.length} Campuses</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {universities.map((uni) => {
                      const count = users.filter((u) => u.university_id === uni.id).length;
                      const pct = Math.round((count / Math.max(1, users.length)) * 100);
                      return (
                        <div key={uni.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
                            <span style={{ fontWeight: 600 }}>{uni.name} ({uni.city})</span>
                            <span style={{ color: "#9ca3af" }}>{count} users ({pct}%)</span>
                          </div>
                          <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "9999px", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #e83a72, #7c5ce8)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: USERS & WALLETS (FULL DATABASE)
              ========================================================================= */}
          {activeTab === "users" && (
            <div>
              {/* Controls */}
              <div className={s.tableControls}>
                <input
                  type="text"
                  placeholder="Search by name, email, university..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className={s.searchInput}
                />
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className={s.filterSelect}
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={s.filterSelect}
                >
                  <option value="all">All Statuses</option>
                  <option value="onboarded">Onboarded Complete</option>
                  <option value="pending">Onboarding Pending</option>
                  <option value="funded">Has Wallet Balance</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Table */}
              <div className={s.tableCard}>
                <table className={s.dataTable}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Gender & Age</th>
                      <th>University</th>
                      <th>Wallet Balance</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                          No users matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const age = calculateAge(user.date_of_birth);
                        const isMale = user.gender === "male";
                        const isFemale = user.gender === "female";

                        return (
                          <tr key={user.id}>
                            <td>
                              <div className={s.userCell}>
                                {user.signed_photo_url ? (
                                  <img src={user.signed_photo_url} alt="User" className={s.tableAvatar} />
                                ) : (
                                  <div className={s.tableAvatar}>
                                    {isMale ? "👨" : isFemale ? "👩" : "👤"}
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 700, color: "#ffffff" }}>
                                    {user.first_name || "Unregistered"} {user.last_name || ""}
                                  </div>
                                  <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ textTransform: "capitalize", fontWeight: 600 }}>
                                {user.gender || "N/A"}
                              </span>{" "}
                              • {age} yrs
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{user.universities?.name || "Campus"}</div>
                              <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{user.universities?.city || ""}</div>
                            </td>
                            <td>
                              <span className={s.walletBadge}>
                                ₹{user.wallet_balance?.toFixed(2) || "0.00"}
                              </span>
                            </td>
                            <td>
                              {user.is_suspended ? (
                                <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.75rem" }}>🚫 Suspended</span>
                              ) : user.is_onboarding_complete ? (
                                <span style={{ color: "#10b981", fontWeight: 600, fontSize: "0.75rem" }}>✅ Active</span>
                              ) : (
                                <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: "0.75rem" }}>⏳ Incomplete</span>
                              )}
                            </td>
                            {(() => {
                              const activeInfo = formatLastActive(user.last_active_at || user.updated_at || user.created_at);
                              return (
                                <td style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }} title={activeInfo.title}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                    {activeInfo.isRecent && (
                                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" }} />
                                    )}
                                    <span style={{ color: activeInfo.isRecent ? "#34d399" : "#9ca3af", fontWeight: activeInfo.isRecent ? 600 : 400 }}>
                                      {activeInfo.text}
                                    </span>
                                  </div>
                                </td>
                              );
                            })()}
                            <td style={{ textAlign: "right" }}>
                              <div className={s.actionBtnGroup} style={{ justifyContent: "flex-end", gap: "0.3rem" }}>
                                <button
                                  className={s.smallActionBtn}
                                  onClick={() => {
                                    setEditingWalletUser(user);
                                    setNewWalletBalance(user.wallet_balance || 0);
                                  }}
                                  title="Edit Wallet Balance (₹)"
                                  style={{ padding: "0.35rem 0.55rem", fontSize: "0.95rem", lineHeight: 1 }}
                                >
                                  💳
                                </button>
                                <button
                                  className={s.smallActionBtn}
                                  onClick={() => {
                                    setDroppingCreditUser(user);
                                    setDropAmount(69);
                                  }}
                                  title="Drop Free Credits (₹69)"
                                  style={{ padding: "0.35rem 0.55rem", fontSize: "0.95rem", lineHeight: 1, background: "rgba(251, 191, 36, 0.08)" }}
                                >
                                  🎁
                                </button>
                                <button
                                  className={s.smallActionBtn}
                                  onClick={() => setViewingProfileUser(user)}
                                  title="View Full Profile Details"
                                  style={{ padding: "0.35rem 0.55rem", fontSize: "0.95rem", lineHeight: 1 }}
                                >
                                  👁️
                                </button>
                                <button
                                  className={s.smallActionBtn}
                                  onClick={() => handleToggleSuspension(user)}
                                  title={user.is_suspended ? "Unsuspend User (Resume)" : "Suspend User (Pause)"}
                                  style={{
                                    padding: "0.35rem 0.55rem",
                                    fontSize: "0.95rem",
                                    lineHeight: 1,
                                    background: user.is_suspended ? "rgba(16, 185, 129, 0.12)" : "rgba(248, 113, 113, 0.12)",
                                  }}
                                >
                                  {user.is_suspended ? "▶️" : "⏸️"}
                                </button>
                                <button
                                  className={s.smallActionBtn}
                                  onClick={() => setDeletingUser(user)}
                                  title="Permanently Delete User"
                                  style={{ padding: "0.35rem 0.55rem", fontSize: "0.95rem", lineHeight: 1, background: "rgba(239, 68, 68, 0.1)" }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: MATCH REQUESTS (ALL & QUEUE)
              ========================================================================= */}
          {activeTab === "requests" && (
            <div>
              <div className={s.tableCard}>
                <table className={s.dataTable}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Target Prefs</th>
                      <th>Scope</th>
                      <th>Fee Paid</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No match requests found.</td>
                      </tr>
                    ) : (
                      requests.map((r) => {
                        const user = r.user || {};
                        const statusColors: any = {
                          active: "#e83a72",
                          matched: "#10b981",
                          expired: "#9ca3af",
                          credited: "#60a5fa",
                        };

                        return (
                          <tr key={r.id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>
                                {user.first_name || "User"} {user.last_name || ""} ({user.gender})
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                                {user.universities?.name || "Campus"}
                              </div>
                            </td>
                            <td>
                              <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{r.pref_gender}</span>{" "}
                              ({r.pref_age_min}–{r.pref_age_max} yrs)
                            </td>
                            <td style={{ textTransform: "capitalize" }}>{r.scope}</td>
                            <td>
                              <span style={{ fontWeight: 700, color: "#34d399" }}>₹{r.fee_paid}</span> ({r.payment_method})
                            </td>
                            <td>
                              <span
                                style={{
                                  color: statusColors[r.status] || "#ffffff",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                              {new Date(r.created_at).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: MATCHES & CHATS
              ========================================================================= */}
          {activeTab === "matches" && (
            <div>
              <div className={s.tableCard}>
                <table className={s.dataTable}>
                  <thead>
                    <tr>
                      <th>Match Pair</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Meet Intent</th>
                      <th>Date Proposal</th>
                      <th>Matched At</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No matches recorded yet.</td>
                      </tr>
                    ) : (
                      matches.map((m) => {
                        const nameA = `${m.user_a?.first_name || "User A"} (${m.user_a?.gender})`;
                        const nameB = `${m.user_b?.first_name || "User B"} (${m.user_b?.gender})`;
                        const proposal = m.date_proposals?.[0];

                        return (
                          <tr key={m.id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{nameA} 💘 {nameB}</div>
                              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                                {m.user_a?.universities?.name || "Campus"}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: "#e83a72", fontSize: "0.95rem" }}>
                                {m.compatibility_score}%
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem" }}>
                                {m.status}
                              </span>
                            </td>
                            <td style={{ fontSize: "0.75rem" }}>
                              User A: {m.user_a_wants_meet ? "✅" : "❌"} | User B: {m.user_b_wants_meet ? "✅" : "❌"}
                            </td>
                            <td style={{ fontSize: "0.75rem" }}>
                              {proposal ? (
                                <span>{proposal.status?.toUpperCase()}: {proposal.location_text}</span>
                              ) : (
                                <span style={{ color: "#6b7280" }}>None</span>
                              )}
                            </td>
                            <td style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                              {new Date(m.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                className={s.smallActionBtn}
                                onClick={() => handleViewTranscript(m)}
                              >
                                💬 View Chat
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: REPORTS & MODERATION
              ========================================================================= */}
          {activeTab === "reports" && (
            <div>
              <div className={s.tableCard}>
                <table className={s.dataTable}>
                  <thead>
                    <tr>
                      <th>Reporter</th>
                      <th>Reported User</th>
                      <th>Category</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No reports filed. Clean community! 🎉</td>
                      </tr>
                    ) : (
                      reports.map((rep) => (
                        <tr key={rep.id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{rep.reporter?.first_name || "Anonymous"}</div>
                            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{rep.reporter?.email}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: "#f87171" }}>{rep.reported?.first_name || "User"}</div>
                            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{rep.reported?.email}</div>
                          </td>
                          <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{rep.category}</td>
                          <td style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{rep.description || "No text provided"}</td>
                          <td>
                            <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", color: rep.status === "pending" ? "#f59e0b" : "#10b981" }}>
                              {rep.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                            {new Date(rep.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODAL: MANUAL MATCH CONFIRMATION
          ========================================================================= */}
      {showMatchModal && selectedNodeA && selectedNodeB && (
        <div className={s.modalBackdrop}>
          <div className={s.modalBox}>
            <div style={{ display: "inline-block", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#f59e0b", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "9999px", marginBottom: "0.75rem" }}>
              ⚡ Manual Filter Bypass Override
            </div>
            <h3 className={s.modalTitle}>Connect & Force Match?</h3>
            <p className={s.modalSubtitle}>
              You are manually pairing <strong>{selectedNodeA.user?.first_name || "User A"}</strong> and <strong>{selectedNodeB.user?.first_name || "User B"}</strong>. This action bypasses all age, height, gender, university, and score requirements. Both users will immediately enter an active chat and receive push notifications.
            </p>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "12px", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1" }}>Assigned Compatibility Score:</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#e83a72" }}>{matchScoreInput}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={matchScoreInput}
                onChange={(e) => setMatchScoreInput(parseInt(e.target.value, 10))}
                style={{ width: "100%", accentColor: "#e83a72" }}
              />
            </div>

            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.iconBtn}
                onClick={() => {
                  setShowMatchModal(false);
                  setSelectedNodeB(null);
                }}
                disabled={manualMatchLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={s.loginBtn}
                style={{ width: "auto", padding: "0.7rem 1.5rem" }}
                onClick={handleExecuteManualMatch}
                disabled={manualMatchLoading}
              >
                {manualMatchLoading ? "Connecting & Matching..." : "Confirm & Create Match"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT WALLET BALANCE
          ========================================================================= */}
      {editingWalletUser && (
        <div className={s.modalBackdrop}>
          <div className={s.modalBox}>
            <h3 className={s.modalTitle}>Edit Wallet Balance</h3>
            <p className={s.modalSubtitle}>
              Managing wallet for <strong>{editingWalletUser.first_name} {editingWalletUser.last_name}</strong> ({editingWalletUser.email}).
            </p>

            <div style={{ marginBottom: "1.25rem" }}>
              <label className={s.inputLabel}>Current Balance</label>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#34d399", marginBottom: "1rem" }}>
                ₹{editingWalletUser.wallet_balance?.toFixed(2) || "0.00"}
              </div>

              <label className={s.inputLabel}>New Balance (₹ INR)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={newWalletBalance}
                onChange={(e) => setNewWalletBalance(parseFloat(e.target.value) || 0)}
                className={s.loginInput}
                style={{ marginBottom: "1rem" }}
              />

              <label className={s.inputLabel}>Adjustment Reason</label>
              <input
                type="text"
                placeholder="e.g. Promotional credit, manual refund, VIP grant..."
                value={walletReason}
                onChange={(e) => setWalletReason(e.target.value)}
                className={s.loginInput}
              />
            </div>

            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.iconBtn}
                onClick={() => setEditingWalletUser(null)}
                disabled={walletLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={s.loginBtn}
                style={{ width: "auto", padding: "0.7rem 1.5rem", background: "linear-gradient(135deg, #10b981, #059669)" }}
                onClick={handleSaveWallet}
                disabled={walletLoading}
              >
                {walletLoading ? "Updating..." : "Save New Balance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: FULL PROFILE DETAILS
          ========================================================================= */}
      {viewingProfileUser && (
        <div className={s.modalBackdrop}>
          <div className={s.modalBox} style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              {viewingProfileUser.signed_photo_url ? (
                <img src={viewingProfileUser.signed_photo_url} alt="User" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#27273a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>
                  👤
                </div>
              )}
              <div>
                <h3 className={s.modalTitle} style={{ margin: 0 }}>
                  {viewingProfileUser.first_name || "User"} {viewingProfileUser.last_name || ""}
                </h3>
                <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{viewingProfileUser.email}</div>
                <div style={{ color: "#7c5ce8", fontSize: "0.85rem", fontWeight: 600 }}>🎓 {viewingProfileUser.universities?.name}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "12px", marginBottom: "1rem" }}>
              <div><strong>Gender:</strong> <span style={{ textTransform: "capitalize" }}>{viewingProfileUser.gender}</span></div>
              <div><strong>Age:</strong> {calculateAge(viewingProfileUser.date_of_birth)} yrs ({viewingProfileUser.date_of_birth})</div>
              <div><strong>Height:</strong> {viewingProfileUser.height_cm ? `${viewingProfileUser.height_cm} cm` : "Not specified"}</div>
              <div><strong>Intent:</strong> <span style={{ textTransform: "capitalize" }}>{viewingProfileUser.profiles?.relationship_intent || "Not specified"}</span></div>
              <div><strong>Dietary:</strong> <span style={{ textTransform: "capitalize" }}>{viewingProfileUser.profiles?.dietary}</span></div>
              <div><strong>Fitness:</strong> <span style={{ textTransform: "capitalize" }}>{viewingProfileUser.profiles?.fitness}</span></div>
              <div><strong>Drinking:</strong> <span style={{ textTransform: "capitalize" }}>{viewingProfileUser.profiles?.drinking}</span></div>
              <div><strong>Smoking:</strong> <span style={{ textTransform: "capitalize" }}>{viewingProfileUser.profiles?.smoking}</span></div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Hobbies & Interests:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {viewingProfileUser.profiles?.hobbies?.length > 0 ? (
                  viewingProfileUser.profiles.hobbies.map((h: string) => (
                    <span key={h} style={{ background: "rgba(255,255,255,0.08)", padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.8rem", color: "#ffffff" }}>
                      {h}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>None listed</span>
                )}
              </div>
            </div>

            <div className={s.modalFooter} style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className={s.smallActionBtn}
                  onClick={() => {
                    const u = viewingProfileUser;
                    setDroppingCreditUser(u);
                    setDropAmount(69);
                  }}
                  style={{ color: "#fbbf24", background: "rgba(251, 191, 36, 0.12)", border: "1px solid rgba(251, 191, 36, 0.3)", padding: "0.55rem 1rem" }}
                >
                  🎁 Drop ₹69 Credits
                </button>
                <button
                  type="button"
                  className={s.smallActionBtn}
                  onClick={() => {
                    const u = viewingProfileUser;
                    setViewingProfileUser(null);
                    setDeletingUser(u);
                  }}
                  style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "0.55rem 1rem" }}
                >
                  🗑️ Delete User Completely
                </button>
              </div>
              <button type="button" className={s.iconBtn} onClick={() => setViewingProfileUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PERMANENTLY DELETE USER CONFIRMATION
          ========================================================================= */}
      {deletingUser && (
        <div className={s.modalBackdrop}>
          <div className={s.modalBox} style={{ maxWidth: "520px", border: "1px solid rgba(239, 68, 68, 0.4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "1.75rem" }}>⚠️</div>
              <div>
                <h3 className={s.modalTitle} style={{ margin: 0, color: "#f87171" }}>
                  Permanently Delete User?
                </h3>
                <p className={s.modalSubtitle} style={{ margin: "0.25rem 0 0 0" }}>
                  This action is irreversible and immediately wipes all records.
                </p>
              </div>
            </div>

            <div style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "10px",
              padding: "1rem",
              margin: "1.25rem 0",
              fontSize: "0.85rem",
              lineHeight: "1.5",
              color: "#fca5a5"
            }}>
              You are about to completely erase <strong>{deletingUser.first_name || "User"}</strong> ({deletingUser.email || deletingUser.id}):
              <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0 }}>
                <li>Profile, bio, photos, and media from storage</li>
                <li>Wallet balance, deposits, and transaction history</li>
                <li>Active match requests & queue positions</li>
                <li>All matches, conversations, and chat messages</li>
                <li>Date proposals, confirmed dates, and feedback</li>
                <li>Authentication record (they can re-register as brand new)</li>
              </ul>
            </div>

            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.iconBtn}
                onClick={() => setDeletingUser(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={s.loginBtn}
                style={{
                  width: "auto",
                  padding: "0.7rem 1.5rem",
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)"
                }}
                onClick={handleExecuteDeleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting permanently..." : "Yes, Wipe & Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DROP FREE CREDITS (₹69) CONFIRMATION & SENDER
          ========================================================================= */}
      {droppingCreditUser && (
        <div className={s.modalBackdrop}>
          <div className={s.modalBox} style={{ maxWidth: showEmailPreview ? "640px" : "520px", transition: "max-width 0.2s ease", border: "1px solid rgba(251, 191, 36, 0.4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "1.75rem" }}>🎁</div>
              <div>
                <h3 className={s.modalTitle} style={{ margin: 0, color: "#fbbf24" }}>
                  Drop Free Credits to User
                </h3>
                <p className={s.modalSubtitle} style={{ margin: "0.25rem 0 0 0" }}>
                  Instantly credit wallet & send a branded email from drops@blindside.in
                </p>
              </div>
            </div>

            <div style={{
              background: "rgba(251, 191, 36, 0.08)",
              border: "1px solid rgba(251, 191, 36, 0.2)",
              borderRadius: "10px",
              padding: "1rem",
              margin: "1.25rem 0",
              fontSize: "0.85rem",
              lineHeight: "1.5",
              color: "#fde68a"
            }}>
              Recipient: <strong>{droppingCreditUser.first_name || "User"}</strong> ({droppingCreditUser.email || "No email"})<br />
              Current Balance: <strong>₹{parseFloat(droppingCreditUser.wallet_balance || 0).toFixed(2)}</strong>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label className={s.inputLabel}>Credit Amount (₹ INR)</label>
              <input
                type="number"
                step="1"
                min="1"
                value={dropAmount}
                onChange={(e) => setDropAmount(parseFloat(e.target.value) || 0)}
                className={s.loginInput}
                style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fbbf24" }}
              />
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.35rem" }}>
                Default is ₹69. This immediately updates their wallet and triggers the delivery email.
              </div>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              fontSize: "0.8rem",
              color: "#9ca3af",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              marginBottom: "1rem"
            }}>
              <div>📧 <strong>Sender:</strong> BlindSide Drops &lt;drops@blindside.in&gt;</div>
              <div>🏷️ <strong>Transaction:</strong> Promotional Credit (promo_credit)</div>
              <div>🌗 <strong>Template:</strong> Dual Dark & Light Mode HTML</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <button
                type="button"
                className={s.smallActionBtn}
                onClick={() => setShowEmailPreview(!showEmailPreview)}
                style={{ color: "#60a5fa", background: "rgba(96, 165, 250, 0.1)", border: "1px solid rgba(96, 165, 250, 0.25)" }}
              >
                {showEmailPreview ? "🙈 Hide Email Preview" : "👁️ Preview Email Template"}
              </button>
              <a
                href={`/api/admin/preview-drop-email?name=${encodeURIComponent(droppingCreditUser.first_name || "there")}&amount=${dropAmount}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "0.75rem", color: "#60a5fa", textDecoration: "underline" }}
              >
                Open in new tab ↗
              </a>
            </div>

            {showEmailPreview && (
              <div style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                marginBottom: "1.25rem",
                height: "380px",
                background: "#000"
              }}>
                <iframe
                  title="Email Preview"
                  src={`/api/admin/preview-drop-email?name=${encodeURIComponent(droppingCreditUser.first_name || "there")}&amount=${dropAmount}`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>
            )}

            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.iconBtn}
                onClick={() => setDroppingCreditUser(null)}
                disabled={dropLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={s.loginBtn}
                style={{
                  width: "auto",
                  padding: "0.7rem 1.5rem",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)"
                }}
                onClick={handleExecuteDropCredits}
                disabled={dropLoading || dropAmount <= 0}
              >
                {dropLoading ? "Processing & Sending..." : `Send ₹${dropAmount} Drop`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHAT TRANSCRIPT VIEW
          ========================================================================= */}
      {viewingMatch && (
        <div className={s.modalBackdrop}>
          <div className={s.modalBox} style={{ maxWidth: "620px" }}>
            <h3 className={s.modalTitle}>Chat Transcript</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <p className={s.modalSubtitle} style={{ margin: 0 }}>
                Between{" "}
                <strong style={{ color: viewingMatch.user_a?.gender?.toLowerCase() === "female" ? "#f472b6" : "#60a5fa" }}>
                  {viewingMatch.user_a?.first_name || "User A"} {viewingMatch.user_a?.gender?.toLowerCase() === "female" ? "♀" : "♂"}
                </strong>{" "}
                and{" "}
                <strong style={{ color: viewingMatch.user_b?.gender?.toLowerCase() === "female" ? "#f472b6" : "#60a5fa" }}>
                  {viewingMatch.user_b?.first_name || "User B"} {viewingMatch.user_b?.gender?.toLowerCase() === "female" ? "♀" : "♂"}
                </strong>
              </p>
              <div style={{ display: "flex", gap: "0.4rem", fontSize: "0.75rem" }}>
                <span style={{ color: "#60a5fa", background: "rgba(59, 130, 246, 0.12)", padding: "0.2rem 0.55rem", borderRadius: "9999px", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                  ♂ Male (Blue)
                </span>
                <span style={{ color: "#f472b6", background: "rgba(236, 72, 153, 0.12)", padding: "0.2rem 0.55rem", borderRadius: "9999px", border: "1px solid rgba(236, 72, 153, 0.3)" }}>
                  ♀ Female (Pink)
                </span>
              </div>
            </div>

            <div className={s.transcriptBox}>
              {transcriptLoading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                  <RefreshIcon spinning size={20} /> Loading messages...
                </div>
              ) : transcriptMessages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                  No messages sent in this match yet.
                </div>
              ) : (
                transcriptMessages.map((m) => {
                  const isUserA = m.sender_id === viewingMatch.user_a_id;
                  const isSystem = m.sender_id === null;

                  if (isSystem) {
                    return (
                      <div key={m.id} style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", background: "rgba(255,255,255,0.04)", padding: "0.4rem", borderRadius: "6px" }}>
                        🔔 {m.content}
                      </div>
                    );
                  }

                  const senderGender = (
                    m.sender?.gender ||
                    (isUserA ? viewingMatch.user_a?.gender : viewingMatch.user_b?.gender) ||
                    ""
                  ).toLowerCase();

                  const isFemale = senderGender === "female";
                  const isMale = senderGender === "male";

                  const bubbleBg = isFemale
                    ? "rgba(236, 72, 153, 0.16)"
                    : isMale
                    ? "rgba(59, 130, 246, 0.16)"
                    : isUserA
                    ? "rgba(59, 130, 246, 0.16)"
                    : "rgba(236, 72, 153, 0.16)";

                  const bubbleBorder = isFemale
                    ? "1px solid rgba(236, 72, 153, 0.35)"
                    : isMale
                    ? "1px solid rgba(59, 130, 246, 0.35)"
                    : isUserA
                    ? "1px solid rgba(59, 130, 246, 0.35)"
                    : "1px solid rgba(236, 72, 153, 0.35)";

                  const senderColor = isFemale ? "#f472b6" : isMale ? "#60a5fa" : isUserA ? "#60a5fa" : "#f472b6";
                  const genderBadge = isFemale ? " ♀" : isMale ? " ♂" : "";
                  const displayName = m.sender?.first_name || (isUserA ? viewingMatch.user_a?.first_name || "User A" : viewingMatch.user_b?.first_name || "User B");

                  return (
                    <div
                      key={m.id}
                      className={s.transcriptMsg}
                      style={{
                        alignSelf: isUserA ? "flex-start" : "flex-end",
                        background: bubbleBg,
                        border: bubbleBorder,
                      }}
                    >
                      <div className={s.transcriptMsgSender} style={{ color: senderColor }}>
                        {displayName}{genderBadge}
                      </div>
                      <div style={{ color: "#ffffff", wordBreak: "break-word" }}>{m.content}</div>
                      <div style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "0.3rem", textAlign: "right" }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className={s.modalFooter}>
              <button type="button" className={s.iconBtn} onClick={() => setViewingMatch(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
