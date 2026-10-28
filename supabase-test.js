const { createClient } = require("@supabase/supabase-js");
const url = "https://ibrhsolsszuwtfthdxwe.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicmhzb2xzc3V3RmdGhkeHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyOTA2NDYsImV4cCI6MjEwMTg2NjY0Nn0.hArTrvYAlUiRx8qdOPao4EuKclW7ifrH6gbnPjzibFM";
const supabase = createClient(url,key);
(async()=>{
  const { data, error, status } = await supabase.from('jobs').select('*').limit(2);
  console.log('DATA', JSON.stringify(data));
  console.log('ERROR', JSON.stringify(error));
  console.log('STATUS', status);
})().catch(err=>{ console.error('EXCEPTION', err); process.exit(1); });
