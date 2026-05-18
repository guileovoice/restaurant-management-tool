require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://rvqcajvsnvafzdmdotcw.supabase.co';
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!secretKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined in .env.local");
  process.exit(1);
}
async function run() {
  try {
    const url = `${supabaseUrl}/rest/v1/`;
    const response = await fetch(url, {
      headers: {
        "apikey": secretKey,
        "Authorization": `Bearer ${secretKey}`
      }
    });
    const data = await response.json();
    console.log("All Paths in OpenAPI:");
    const paths = Object.keys(data.paths);
    paths.forEach(p => {
      if (p.includes('/rpc/')) {
        console.log("  RPC: ", p);
      } else {
        console.log("  Table/View: ", p);
      }
    });
  } catch (e) {
    console.error("Error fetching OpenAPI schema:", e);
  }
}
run();
