const url = 'https://qnvlqjiiuyfcspsqelin.supabase.co' + '/rest/v1/matches?select=*';
fetch(url, { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudmxxamlpdXlmY3Nwc3FlbGluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDcwODAyMywiZXhwIjoyMDk2Mjg0MDIzfQ.sWpz8pD4oiskThbl5d-Yx0spMQbJhUylRwZ4EhoPZZU', Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudmxxamlpdXlmY3Nwc3FlbGluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDcwODAyMywiZXhwIjoyMDk2Mjg0MDIzfQ.sWpz8pD4oiskThbl5d-Yx0spMQbJhUylRwZ4EhoPZZU' } })
  .then(r => r.json())
  .then(data => console.log("Matches:", data))
  .catch(console.error);
