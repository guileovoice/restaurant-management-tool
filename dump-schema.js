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
