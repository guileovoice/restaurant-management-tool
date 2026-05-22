require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rvqcajvsnvafzdmdotcw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCalls() {
  const { data, error } = await supabase
    .from('vapi_call_logs')
    .select('id, started_at, customer_name, customer_phone')
    .limit(10);
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Call logs sample:", data);
  }
}
checkCalls();
