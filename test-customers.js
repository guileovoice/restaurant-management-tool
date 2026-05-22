require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rvqcajvsnvafzdmdotcw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCustomers() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date();

  console.log("Start date:", startDate.toISOString());
  console.log("End date:", endDate.toISOString());

  const startStr = `"${startDate.toISOString()}"`;
  const endStr = `"${endDate.toISOString()}"`;
  const orStr = `and(created_at.gte.${startStr},created_at.lt.${endStr}),and(last_order_at.gte.${startStr},last_order_at.lt.${endStr})`;

  console.log("OR String:", orStr);

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', 't_1')
    .or(orStr);
  
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Customers sample count:", data.length);
  }
}
checkCustomers();
