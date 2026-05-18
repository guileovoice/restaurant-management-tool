const supabaseUrl = 'https://rvqcajvsnvafzdmdotcw.supabase.co';
const secretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cWNhanZzbnZhZnpkbWRvdGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyNTIzMiwiZXhwIjoyMDk0NDAxMjMyfQ.xFDCgKg80lxdGtF6Hb_9J5fAv_jqel_l380Dln1b71A';

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
