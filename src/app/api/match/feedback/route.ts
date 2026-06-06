import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      matchId,
      attended,
      vibeRating,
      conversationRating,
      wouldMeetAgain,
      comments,
    } = body;

    if (!matchId) {
      return NextResponse.json(
        { message: "Match ID is required." },
        { status: 400 }
      );
    }

    // Verify user belongs to the match
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { message: "Match not found." },
        { status: 404 }
      );
    }

    if (match.user_a_id !== userId && match.user_b_id !== userId) {
      return NextResponse.json(
        { message: "You are not authorized to review this match." },
        { status: 403 }
      );
    }

    // Insert feedback
    const { error: feedbackError } = await supabase
      .from("feedback")
      .insert({
        match_id: matchId,
        user_id: userId,
        attended: attended === true || attended === "true",
        vibe_rating: vibeRating ? parseInt(vibeRating) : null,
        conversation_rating: conversationRating ? parseInt(conversationRating) : null,
        would_meet_again: wouldMeetAgain || null,
        free_text: comments || null,
      });

    if (feedbackError) {
      console.error("Failed to insert feedback in route:", feedbackError);
      return NextResponse.json(
        { message: "Failed to submit feedback." },
        { status: 500 }
      );
    }

    // Update match status to completed
    const { error: updateMatchError } = await supabase
      .from("matches")
      .update({ status: "completed" })
      .eq("id", matchId);

    if (updateMatchError) {
      console.error("Failed to update match status to completed:", updateMatchError);
      // Fail silently for match status since feedback was logged
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully.",
    });
  } catch (err: any) {
    console.error("Error in match feedback route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
