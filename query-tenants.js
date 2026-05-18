const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rvqcajvsnvafzdmdotcw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cWNhanZzbnZhZnpkbWRvdGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyNTIzMiwiZXhwIjoyMDk0NDAxMjMyfQ.xFDCgKg80lxdGtF6Hb_9J5fAv_jqel_l380Dln1b71A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('tenants').select('*');
  if (error) {
    console.error("Error fetching tenants:", error);
  } else {
    console.log("Tenants in Database:", data);
  }
}
run();
