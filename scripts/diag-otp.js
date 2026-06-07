const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
(async () => {
  const body = {
    otp_hash: "deadbeef",
    expires_at: new Date(Date.now() + 600000).toISOString(),
    attempts: 0,
    is_used: false,
    email: "diag-" + Date.now() + "@example.com",
  };
  const res = await fetch(url + "/rest/v1/otp_verifications", {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  console.log("HTTP", res.status);
  console.log("Response:", await res.text());
})();
