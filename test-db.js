require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://rvqcajvsnvafzdmdotcw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const tables = ['orders', 'customers', 'menu_items', 'order_sessions', 'campaigns', 'vapi_call_logs', 'order_items', 'tenants'];
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*').limit(1);
      if (error) {
        console.log(`Table ${t}: Error - ${error.message}`);
      } else {
        console.log(`Table ${t}: Success! Columns:`, data.length > 0 ? Object.keys(data[0]) : 'empty table');
        // If it's empty, we can try to inspect the OpenAPI JSON for this table's schema, but let's see if we get sample columns
      }
    } catch (e) {
      console.log(`Table ${t}: Catastrophic error - ${e.message}`);
    }
  }
}
test();
