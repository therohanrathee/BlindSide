import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
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

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Update public.users
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
      userUpdate.university_email = universityEmail.trim().toLowerCase();
      userUpdate.is_university_verified = true;
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

    // 3. Log user onboarding details to public.onboarding_leads for lead gen
    try {
      // Fetch personal email and phone from users table
      const { data: userRow } = await supabase
        .from("users")
        .select("email, phone")
        .eq("id", userId)
        .single();

      // Fetch university name
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
        personal_email: userRow?.email || "",
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
