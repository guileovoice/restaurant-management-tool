require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rvqcajvsnvafzdmdotcw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSingleCall() {
  const { data, error } = await supabase
    .from('vapi_call_logs')
    .select('*')
    .eq('id', '019e44ae-7881-7000-af79-a52818fa9e48')
    .single();
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Full call log record:", JSON.stringify(data, null, 2));
  }
}
checkSingleCall();
