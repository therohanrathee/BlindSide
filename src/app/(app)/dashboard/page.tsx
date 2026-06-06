"use client";

import { useState, useEffect, useRef, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import s from "./dashboard.module.css";

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
  const [dashboardState, setDashboardState] = useState<1 | 2 | 3 | 4>(1);
  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any | null>(null);

  // State 1: Search Preferences
  const [prefSlide, setPrefSlide] = useState(1);
  const [prefGender, setPrefGender] = useState<"male" | "female" | "everyone">("everyone");
  const [prefAgeMin, setPrefAgeMin] = useState(20);
  const [prefAgeMax, setPrefAgeMax] = useState(26);
  const [prefHeightNoPref, setPrefHeightNoPref] = useState(true);
  const [prefHeightMinCm, setPrefHeightMinCm] = useState(150);
  const [prefHeightMaxCm, setPrefHeightMaxCm] = useState(190);
  const [prefDietary, setPrefDietary] = useState("no_preference");
  const [prefDrinking, setPrefDrinking] = useState("no_preference");
  const [prefSmoking, setPrefSmoking] = useState("no_preference");
  const [requestId, setRequestId] = useState<string | null>(null);

  // State 2: Searching Timer
  const [countdownText, setCountdownText] = useState("7d 00h 00m 00s");

  // State 3: Active Match & Chat
  const [chatCountdownText, setChatCountdownText] = useState("48:00:00");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [userWantsMeet, setUserWantsMeet] = useState(false);
  const [partnerWantsMeet, setPartnerWantsMeet] = useState(false);
  
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
        router.push("/auth");
        return;
      }

      setUserId(session.user.id);
      
      // Load User info
      const { data: userRecord } = await supabase
        .from("users")
        .select("first_name, last_name, is_onboarding_complete, university_id, universities(name)")
        .eq("id", session.user.id)
        .single();

      if (!userRecord?.is_onboarding_complete) {
        router.push("/onboarding");
        return;
      }

      const fullName = `${userRecord.first_name || ""} ${userRecord.last_name || ""}`.trim();
      setUserName(fullName || "User");
      setUniversityName((userRecord.universities as any)?.name || "Campus");

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
        setDashboardState(4);
      } else {
        setDashboardState(1);
        setPrefSlide(1);
      }
      return;
    }

    setActiveRequest(request);
    setRequestId(request.id);

    if (request.status === "unpaid") {
      setDashboardState(1);
      setPrefSlide(5); // Go directly to checkout slide
      // Pre-fill fields from request
      setPrefGender(request.pref_gender);
      setPrefAgeMin(request.pref_age_min);
      setPrefAgeMax(request.pref_age_max);
      setPrefHeightNoPref(!request.pref_height_min_cm);
      setPrefHeightMinCm(request.pref_height_min_cm || 150);
      setPrefHeightMaxCm(request.pref_height_max_cm || 190);
      setPrefDietary(request.pref_dietary);
      setPrefDrinking(request.pref_drinking);
      setPrefSmoking(request.pref_smoking);
    } else if (request.status === "active") {
      setDashboardState(2);
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
        setActiveMatch(match);
        setDashboardState(3);

        const isUserA = match.user_a_id === uid;
        setUserWantsMeet(isUserA ? match.user_a_wants_meet : match.user_b_wants_meet);
        setPartnerWantsMeet(isUserA ? match.user_b_wants_meet : match.user_a_wants_meet);

        // Fetch partner details
        const partnerId = isUserA ? match.user_b_id : match.user_a_id;
        const { data: partner } = await supabase
          .from("users")
          .select("first_name, date_of_birth, universities(name)")
          .eq("id", partnerId)
          .single();

        const { data: partnerProfileData } = await supabase
          .from("profiles")
          .select("hobbies")
          .eq("user_id", partnerId)
          .single();

        let partnerName = "Your Blind Date";
        let partnerAge = 21;
        let partnerUni = "Same Campus";
        let partnerHobbies = ["Hobbies Hidden"];

        if (partner) {
          partnerName = partner.first_name || "Your Blind Date";
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
        } else {
          console.warn("⚠️ RLS Check: Failed to fetch partner's public user details. Did you apply Migration 006 RLS policy in your Supabase SQL Editor?");
        }

        if (partnerProfileData) {
          partnerHobbies = partnerProfileData.hobbies || ["Hobbies Hidden"];
        }

        setPartnerProfile({
          firstName: partnerName,
          age: partnerAge,
          university: partnerUni,
          hobbies: partnerHobbies,
          compatibility: match.compatibility_score || 55,
        });

        // Start Chat countdown
        startChatCountdown(match.chat_expires_at);
        // Load messages
        await loadMessages(match.id);
        // Load proposal
        await loadDateProposal(match.id, uid);
      } else {
        setDashboardState(2);
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
          prefAgeMin,
          prefAgeMax,
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
        setPrefSlide(5); // Go to checkout slide
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
        setDashboardState(2);
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
    if (!requestId) return;
    setActionError("");
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
              setDashboardState(2);
              await refreshMatchStatus(userId!);
            } else {
              setActionError(verifyData.message || "Payment verification failed.");
            }
          } catch {
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
    } catch {
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
    router.push("/auth");
  };

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
          <button className={s.signOutBtn} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <main className={s.mainContainer}>
        {/* ==================================================
            STATE 1: PREFERENCES SLIDES
            ================================================== */}
        {dashboardState === 1 && (
          <div className={s.stateCard}>
            {actionError && <div className={s.errorAlert}>{actionError}</div>}

            {prefSlide === 1 && (
              <div className={s.slideContent}>
                <h1 className={s.title}>Who are you looking for?</h1>
                <p className={s.subtitle}>Preferences help scope your daily campus match selection pool.</p>

                <div className={s.genderButtons}>
                  {[
                    { key: "male", val: "Men" },
                    { key: "female", val: "Women" },
                    { key: "everyone", val: "Everyone" }
                  ].map((g) => (
                    <button
                      key={g.key}
                      className={`${s.genderBtn} ${prefGender === g.key ? s.activeBtn : ""}`}
                      onClick={() => setPrefGender(g.key as any)}
                    >
                      {g.val}
                    </button>
                  ))}
                </div>

                <div className={s.slideFooter}>
                  <div />
                  <button className="btn btn-secondary btn-pill" onClick={() => setPrefSlide(2)}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {prefSlide === 2 && (
              <div className={s.slideContent}>
                <h1 className={s.title}>Preferred Age Range</h1>
                <p className={s.subtitle}>Select the age boundary limit for your matches.</p>

                <div className={s.ageSelects}>
                  <div className={s.formGroup}>
                    <label className={s.label}>Min Age</label>
                    <select className={s.select} value={prefAgeMin} onChange={(e) => setPrefAgeMin(parseInt(e.target.value))}>
                      {Array.from({ length: 23 }, (_, i) => i + 18).map(a => (
                        <option key={a} value={a}>{a} years</option>
                      ))}
                    </select>
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.label}>Max Age</label>
                    <select className={s.select} value={prefAgeMax} onChange={(e) => setPrefAgeMax(parseInt(e.target.value))}>
                      {Array.from({ length: 23 }, (_, i) => i + 18).map(a => (
                        <option key={a} value={a} disabled={a < prefAgeMin}>{a} years</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={s.slideFooter}>
                  <button className="btn btn-ghost" onClick={() => setPrefSlide(1)}>
                    ← Back
                  </button>
                  <button className="btn btn-secondary btn-pill" onClick={() => setPrefSlide(3)}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {prefSlide === 3 && (
              <div className={s.slideContent}>
                <h1 className={s.title}>Preferred Height</h1>
                <p className={s.subtitle}>Height constraints can be restricted or skipped entirely.</p>

                <div className={s.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="height-no-pref"
                    checked={prefHeightNoPref}
                    onChange={(e) => setPrefHeightNoPref(e.target.checked)}
                  />
                  <label htmlFor="height-no-pref">No preference (Recommended)</label>
                </div>

                {!prefHeightNoPref && (
                  <div className={s.heightSelects}>
                    <div className={s.formGroup}>
                      <label className={s.label}>Min Height</label>
                      <select className={s.select} value={prefHeightMinCm} onChange={(e) => setPrefHeightMinCm(parseInt(e.target.value))}>
                        {Array.from({ length: 71 }, (_, i) => i + 130).map(cm => (
                          <option key={cm} value={cm}>{Math.round(cm / 2.54 / 12)}&apos;{Math.round((cm / 2.54) % 12)}&quot; ({cm} cm)</option>
                        ))}
                      </select>
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.label}>Max Height</label>
                      <select className={s.select} value={prefHeightMaxCm} onChange={(e) => setPrefHeightMaxCm(parseInt(e.target.value))}>
                        {Array.from({ length: 71 }, (_, i) => i + 130).map(cm => (
                          <option key={cm} value={cm} disabled={cm < prefHeightMinCm}>{Math.round(cm / 2.54 / 12)}&apos;{Math.round((cm / 2.54) % 12)}&quot; ({cm} cm)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className={s.slideFooter}>
                  <button className="btn btn-ghost" onClick={() => setPrefSlide(2)}>
                    ← Back
                  </button>
                  <button className="btn btn-secondary btn-pill" onClick={() => setPrefSlide(4)}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {prefSlide === 4 && (
              <div className={s.slideContent}>
                <h1 className={s.title}>Lifestyle Preferences</h1>
                <p className={s.subtitle}>Filter matches by core lifestyle habits. Leaving as No Preference yields a larger pool.</p>

                <div className={s.formGroup}>
                  <label className={s.label}>Dietary Preference</label>
                  <div className={s.prefGrid}>
                    {[
                      { key: "veg", val: "Veg" },
                      { key: "nonveg", val: "Non-Veg" },
                      { key: "vegan", val: "Vegan" },
                      { key: "no_preference", val: "No Pref" }
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        className={`${s.filterTag} ${prefDietary === d.key ? s.activeFilterTag : ""}`}
                        onClick={() => setPrefDietary(d.key)}
                      >
                        {d.val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>Drinking Preference</label>
                  <div className={s.prefGrid}>
                    {[
                      { key: "yes", val: "Drinking" },
                      { key: "no", val: "Sober" },
                      { key: "no_preference", val: "No Pref" }
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        className={`${s.filterTag} ${prefDrinking === d.key ? s.activeFilterTag : ""}`}
                        onClick={() => setPrefDrinking(d.key)}
                      >
                        {d.val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>Smoking Preference</label>
                  <div className={s.prefGrid}>
                    {[
                      { key: "yes", val: "Smoking" },
                      { key: "no", val: "Non-Smoking" },
                      { key: "no_preference", val: "No Pref" }
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        className={`${s.filterTag} ${prefSmoking === d.key ? s.activeFilterTag : ""}`}
                        onClick={() => setPrefSmoking(d.key)}
                      >
                        {d.val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={s.slideFooter}>
                  <button className="btn btn-ghost" onClick={() => setPrefSlide(3)}>
                    ← Back
                  </button>
                  <button className="btn btn-primary btn-pill" onClick={handleSavePreferences} disabled={submitting}>
                    {submitting ? "Saving..." : "Save Preferences →"}
                  </button>
                </div>
              </div>
            )}

            {prefSlide === 5 && (
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
                  <button className="btn btn-ghost" onClick={() => setPrefSlide(4)}>
                    ← Edit Filters
                  </button>
                  <div />
                </div>
              </div>
            )}
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
                  <div className={s.radialScoreVal}>
                    <span>{partnerProfile.compatibility}%</span>
                    <span className={s.radialScoreLabel}>Compat</span>
                  </div>
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
              <div className={s.chatHeader}>
                <div className={s.chatStatusIndicator}>
                  <span className={s.chatStatusDot} />
                  <span className={s.chatStatusText}>Blind Chat Active</span>
                </div>
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

            <button
              className="btn btn-primary btn-pill"
              style={{ width: "100%", marginTop: "1rem" }}
              onClick={handleSubmitFeedback}
              disabled={submitting}
            >
              {submitting ? "Saving Review..." : "Submit Review ✓"}
            </button>

            <div className={s.divider} style={{ margin: "2rem 0" }}></div>

            <button
              className="btn btn-secondary btn-pill"
              style={{ width: "100%" }}
              onClick={handleResetMatch}
              disabled={submitting}
            >
              Vibe Not Matched? Look for another Match →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
