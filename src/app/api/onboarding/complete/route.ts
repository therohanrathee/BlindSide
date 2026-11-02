import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const {
      userId,
      firstName,
      lastName,
      dateOfBirth,
      heightCm,
      heightUnitPref,
      weightKg,
      gender,
      hobbies,
      universityId,
      universityEmail,
      latitude,
      longitude,
      deviceOs,
      dietary,
      drinking,
      smoking,
      fitness,
    } = payload;

    if (!userId || user.id !== userId) {
      return NextResponse.json(
        { message: "Forbidden: User ID mismatch." },
        { status: 403 }
      );
    }

    // Age validation (Minimum 18 years old)
    if (dateOfBirth) {
      const dobDate = new Date(dateOfBirth);
      const ageInYears = (Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (isNaN(ageInYears) || ageInYears < 18) {
        return NextResponse.json(
          { message: "You must be at least 18 years old to join BlindSide." },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    // Verify university verification status
    const { data: userCurrent } = await supabase
      .from("users")
      .select("is_university_verified, university_email")
      .eq("id", userId)
      .single();

    // 1. Prepare user update
    const userUpdate: any = {
      is_onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };

    if (firstName) userUpdate.first_name = firstName;
    if (lastName) userUpdate.last_name = lastName;
    if (dateOfBirth) userUpdate.date_of_birth = dateOfBirth;
    if (heightCm) userUpdate.height_cm = parseFloat(heightCm);
    if (heightUnitPref) userUpdate.height_unit_pref = heightUnitPref;
    if (weightKg) userUpdate.weight_kg = parseFloat(weightKg);
    if (gender) userUpdate.gender = gender;
    if (universityId) userUpdate.university_id = universityId;

    if (universityEmail) {
      const normalizedUniEmail = universityEmail.trim().toLowerCase();
      userUpdate.university_email = normalizedUniEmail;

      if (!userCurrent?.is_university_verified) {
        // Verify that this email was actually verified through otp_verifications
        const { data: verifiedOtp } = await supabase
          .from("otp_verifications")
          .select("id")
          .eq("user_id", userId)
          .eq("email", normalizedUniEmail)
          .eq("is_used", true)
          .limit(1)
          .maybeSingle();

        if (!verifiedOtp) {
          return NextResponse.json(
            { message: "University email must be verified with OTP before completing onboarding." },
            { status: 400 }
          );
        }
        userUpdate.is_university_verified = true;
      }
    }

    if (latitude) userUpdate.latitude = parseFloat(latitude);
    if (longitude) userUpdate.longitude = parseFloat(longitude);

    const { error: userError } = await supabase
      .from("users")
      .update(userUpdate)
      .eq("id", userId);

    if (userError) {
      console.error("Failed to update user profile in complete route:", userError);
      return NextResponse.json(
        { message: "Failed to update user account details." },
        { status: 500 }
      );
    }

    // 2. Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        hobbies: hobbies || [],
        dietary: dietary || "no_preference",
        drinking: drinking || "sober",
        smoking: smoking || "non_smoker",
        fitness: fitness || "not_active",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (profileError) {
      console.error("Failed to upsert profile record in complete route:", profileError);
      return NextResponse.json(
        { message: "Account details updated, but profile settings failed to save." },
        { status: 500 }
      );
    }

    // 3. Log lead data for analytics (safe non-blocking)
    try {
      let universityName = "";
      if (universityId) {
        const { data: uniRow } = await supabase
          .from("universities")
          .select("name")
          .eq("id", universityId)
          .single();
        if (uniRow) {
          universityName = uniRow.name;
        }
      }

      const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
      const userAgent = request.headers.get("user-agent") || "";

      await supabase.from("onboarding_leads").insert({
        user_id: userId,
        full_name: `${firstName || ""} ${lastName || ""}`.trim(),
        personal_email: user.email || "",
        hobbies: hobbies || [],
        date_of_birth: dateOfBirth || null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        gender: gender || null,
        university_email: universityEmail ? universityEmail.trim().toLowerCase() : null,
        university_name: universityName || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_os: deviceOs || null,
        dietary: dietary || null,
        drinking: drinking || null,
        smoking: smoking || null,
        fitness: fitness || null,
      });
    } catch (leadErr) {
      console.error("Error logging lead data in onboarding complete route:", leadErr);
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully.",
    });
  } catch (err: any) {
    console.error("Error in onboarding complete route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
