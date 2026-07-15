import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data: activeReqs, error } = await supabase
    .from('match_requests')
    .select('*, user:user_id(*, profiles(*))')
    .eq('status', 'searching');
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("Active Requests:", activeReqs.length);
  activeReqs.forEach(req => {
    const profile = req.user.profiles[0];
    console.log(`\nUser: ${req.user.name} (${req.user.gender})`);
    console.log(`- Request ID: ${req.id}`);
    console.log(`- User ID: ${req.user_id}`);
    console.log(`- Profile details:`, {
        age: profile.age,
        height: profile.height,
        dietary: profile.dietary,
        drinking: profile.drinking,
        smoking: profile.smoking,
        religion: profile.religion,
        hobbies: profile.hobbies
    });
    console.log(`- Prefs:`, {
        gender: req.pref_gender,
        age_min: req.pref_age_min,
        age_max: req.pref_age_max,
        height_min: req.pref_height_min,
        height_max: req.pref_height_max,
        dietary: req.pref_dietary,
        drinking: req.pref_drinking,
        smoking: req.pref_smoking,
        religion: req.pref_religion,
    });
  });
}

run();
