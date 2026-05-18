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
    const definitions = data.definitions;
    if (definitions) {
      for (const [table, val] of Object.entries(definitions)) {
        console.log(`Table: ${table}`);
        if (val.properties) {
          for (const [prop, propVal] of Object.entries(val.properties)) {
            console.log(`  - ${prop} (${propVal.type || 'unknown'}${propVal.format ? ' : ' + propVal.format : ''})`);
          }
        }
      }
    } else {
      console.log("No definitions found in OpenAPI JSON. Root keys:", Object.keys(data));
    }
  } catch (e) {
    console.error("Error dumping schema:", e);
  }
}
run();
