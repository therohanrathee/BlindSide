require('dotenv').config({ path: '.env.local' });
function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/match_requests?status=eq.active&select=*,user:users(id,gender,date_of_birth,height_cm,university_id,latitude,longitude,first_name,last_name,is_suspended,universities(city),profiles(hobbies,relationship_intent,dietary,drinking,smoking,fitness,photo_url))';
  const r = await fetch(url, { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY } });
  const activeReqs = await r.json();
    
  const r1 = activeReqs.find(r => r.user.id === 'b3de7df9-d8b7-4038-b55f-9f79071da175');
  const r2 = activeReqs.find(r => r.user.id === '06eae1fb-cc4b-4a91-ad1a-645427ff984c');
  
  if(!r1 || !r2) return console.log("Missing one of the requests", !!r1, !!r2);
  
  const reqA = r1;
  const reqB = r2;
  const userA = reqA.user;
  const userB = reqB.user;
  const profileA = userA.profiles[0] || userA.profiles;
  const profileB = userB.profiles[0] || userB.profiles;
  
  const ageA = userA.date_of_birth ? calculateAge(userA.date_of_birth) : 0;
  const heightA = userA.height_cm ? parseFloat(userA.height_cm) : 0;
  
  console.log("Start checking:");
  const genderPrefMatchA = reqA.pref_gender === "everyone" || reqA.pref_gender === userB.gender;
  const genderPrefMatchB = reqB.pref_gender === "everyone" || reqB.pref_gender === userA.gender;
  console.log("Gender Match:", genderPrefMatchA, genderPrefMatchB);
  
  const ageB = userB.date_of_birth ? calculateAge(userB.date_of_birth) : 0;
  const ageInRangeA = ageB >= reqA.pref_age_min && ageB <= reqA.pref_age_max;
  const ageInRangeB = ageA >= reqB.pref_age_min && ageA <= reqB.pref_age_max;
  console.log("Age Match:", ageInRangeA, ageInRangeB, "| ageA:", ageA, "ageB:", ageB, "prefA:", reqA.pref_age_min, reqA.pref_age_max, "prefB:", reqB.pref_age_min, reqB.pref_age_max);
  
  const heightB = userB.height_cm ? parseFloat(userB.height_cm) : 0;
  let heightFail = false;
  if (reqA.pref_height_min_cm !== null && heightB < parseFloat(reqA.pref_height_min_cm)) heightFail = 'A min';
  if (reqA.pref_height_max_cm !== null && heightB > parseFloat(reqA.pref_height_max_cm)) heightFail = 'A max';
  if (reqB.pref_height_min_cm !== null && heightA < parseFloat(reqB.pref_height_min_cm)) heightFail = 'B min';
  if (reqB.pref_height_max_cm !== null && heightA > parseFloat(reqB.pref_height_max_cm)) heightFail = 'B max';
  console.log("Height Fail:", heightFail);
  
  const intentA = profileA?.relationship_intent;
  const intentB = profileB?.relationship_intent;
  const intentFail = (intentA === "serious" && intentB === "casual") || (intentA === "casual" && intentB === "serious");
  console.log("Intent Fail:", intentFail, intentA, intentB);
  
  let scopeFail = false;
  if (reqA.scope === "university" || reqB.scope === "university") {
    if (userA.university_id !== userB.university_id) scopeFail = true;
  }
  console.log("Scope Fail:", scopeFail);
  
  const setA = new Set(profileA?.hobbies || []);
  const setB = new Set(profileB?.hobbies || []);
  const intersection = new Set([...setA].filter(h => setB.has(h)));
  const union = new Set([...setA, ...setB]);
  const jaccard = union.size > 0 ? intersection.size / union.size : 0;
  const hobbyScore = jaccard * 45;
  console.log("Hobby Score:", hobbyScore);
  
  let lifestyleScore = 0;
  const matchDietary = (pref, actual) => {
    if (pref === "no_preference") return true;
    if (pref === "vegan") return actual === "vegan";
    if (pref === "veg") return actual === "veg" || actual === "vegan" || actual === "eggetarian";
    if (pref === "nonveg") return true;
    return false;
  };
  const dietaryMatchA = matchDietary(reqA.pref_dietary, profileB.dietary);
  const dietaryMatchB = matchDietary(reqB.pref_dietary, profileA.dietary);
  if (dietaryMatchA && dietaryMatchB) lifestyleScore += 8.75;
  console.log("Dietary Match:", dietaryMatchA, dietaryMatchB);

  const matchDrinking = (pref, actual) => {
    if (pref === "no_preference") return true;
    const doesDrink = actual === "occasionally" || actual === "socially" || actual === "regularly" || actual === "yes" || actual === "sometimes";
    if (pref === "yes" || pref === "socially") return doesDrink;
    if (pref === "no") return !doesDrink;
    return false;
  };
  const drinkA = matchDrinking(reqA.pref_drinking, profileB.drinking);
  const drinkB = matchDrinking(reqB.pref_drinking, profileA.drinking);
  if (drinkA && drinkB) lifestyleScore += 8.75;
  console.log("Drink Match:", drinkA, drinkB, reqA.pref_drinking, profileB.drinking, reqB.pref_drinking, profileA.drinking);

  const matchSmoking = (pref, actual) => {
    if (pref === "no_preference") return true;
    const doesSmoke = actual === "occasionally" || actual === "socially" || actual === "regularly" || actual === "yes" || actual === "sometimes";
    if (pref === "yes" || pref === "regular" || pref === "casual") return doesSmoke;
    if (pref === "no") return !doesSmoke;
    return false;
  };
  const smokeA = matchSmoking(reqA.pref_smoking, profileB.smoking);
  const smokeB = matchSmoking(reqB.pref_smoking, profileA.smoking);
  if (smokeA && smokeB) lifestyleScore += 8.75;
  console.log("Smoke Match:", smokeA, smokeB, reqA.pref_smoking, profileB.smoking, reqB.pref_smoking, profileA.smoking);
  
  const fitnessLevels = { not_active: 0, occasionally: 1, active: 2, gym_rat: 3 };
  const distance = Math.abs((fitnessLevels[profileA?.fitness] ?? 0) - (fitnessLevels[profileB?.fitness] ?? 0));
  if (distance === 0) lifestyleScore += 8.75;
  else if (distance === 1) lifestyleScore += 6.125;
  else if (distance === 2) lifestyleScore += 2.625;
  console.log("Fitness distance:", distance);
  
  console.log("Lifestyle Score:", lifestyleScore);
  let proximityScore = userA.university_id === userB.university_id ? 20 : 0;
  console.log("Proximity Score:", proximityScore);
  const total = hobbyScore + lifestyleScore + proximityScore;
  console.log("Total Score:", total);
}
run();
