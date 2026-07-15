require('dotenv').config({ path: '.env.local' });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/match_requests?user_id=in.(b3de7df9-d8b7-4038-b55f-9f79071da175,06eae1fb-cc4b-4a91-ad1a-645427ff984c)&select=id,status,user_id,created_at';
fetch(url, { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY } })
  .then(r => r.json())
  .then(data => console.log("Match Requests:", data))
  .catch(console.error);
