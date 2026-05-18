const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rvqcajvsnvafzdmdotcw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cWNhanZzbnZhZnpkbWRvdGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyNTIzMiwiZXhwIjoyMDk0NDAxMjMyfQ.xFDCgKg80lxdGtF6Hb_9J5fAv_jqel_l380Dln1b71A';
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
