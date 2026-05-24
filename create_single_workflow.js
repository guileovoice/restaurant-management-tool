const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\abeer\\.gemini\\antigravity\\brain\\44b81677-7372-429c-8a9c-ad703b10e610\\.system_generated\\steps\\8\\output.txt';
const outputPath = 'C:\\ScalePods\\GUILEO\\Restaurant Management Tool\\single_full_workflow.json';

try {
  let content = fs.readFileSync(inputPath, 'utf8');
  content = content.substring(content.indexOf('{'));
  
  const workflowData = JSON.parse(content);
  const workflow = workflowData.workflow || workflowData;
  
  // Create new nodes
  const getConfigNode = {
    "parameters": {
      "url": "=https://rvqcajvsnvafzdmdotcw.supabase.co/rest/v1/whatsapp_config?tenant_id=eq.{{$json[\"tenant_id\"] || '395b50b9-9504-47ce-a8be-3b5c3ff22315'}}",
      "sendHeaders": true,
      "headerParameters": {
        "parameters": [
          {
            "name": "apikey",
            "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cWNhanZzbnZhZnpkbWRvdGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyNTIzMiwiZXhwIjoyMDk0NDAxMjMyfQ.xFDCgKg80lxdGtF6Hb_9J5fAv_jqel_l380Dln1b71A"
          },
          {
            "name": "Authorization",
            "value": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cWNhanZzbnZhZnpkbWRvdGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyNTIzMiwiZXhwIjoyMDk0NDAxMjMyfQ.xFDCgKg80lxdGtF6Hb_9J5fAv_jqel_l380Dln1b71A"
          }
        ]
      },
      "options": {
        "response": {
          "response": {
            "neverError": true
          }
        }
      }
    },
    "id": "get-wa-config-node",
    "name": "Get WhatsApp Config",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.1,
    "position": [
      1200,
      1840
    ]
  };

  const sendWhatsAppNode = {
    "parameters": {
      "method": "POST",
      "url": "=https://graph.facebook.com/v17.0/{{$json[0][\"phone_number_id\"]}}/messages",
      "sendHeaders": true,
      "headerParameters": {
        "parameters": [
          {
            "name": "Authorization",
            "value": "=Bearer {{$json[0][\"access_token\"]}}"
          },
          {
            "name": "Content-Type",
            "value": "application/json"
          }
        ]
      },
      "sendBody": true,
      "specifyBody": "json",
      "jsonBody": "={\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{$('Update Order Status — Supabase').item.json.customer_phone || $('Update Order Status — Supabase').item.json.whatsapp_number}}\",\n  \"type\": \"template\",\n  \"template\": {\n    \"name\": \"order_confirmation\",\n    \"language\": {\n      \"code\": \"en_US\"\n    },\n    \"components\": [\n      {\n        \"type\": \"body\",\n        \"parameters\": [\n          { \"type\": \"text\", \"text\": \"{{$('Update Order Status — Supabase').item.json.customer_name}}\" },\n          { \"type\": \"text\", \"text\": \"{{$('Update Order Status — Supabase').item.json.order_ref || $('Update Order Status — Supabase').item.json.id}}\" }\n        ]\n      }\n    ]\n  }\n}",
      "options": {
        "response": {
          "response": {
            "neverError": true
          }
        }
      }
    },
    "id": "send-wa-message-node",
    "name": "Send WhatsApp Message",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.1,
    "position": [
      1400,
      1840
    ]
  };

  const logToSupabaseNode = {
    "parameters": {
      "method": "POST",
      "url": "https://rvqcajvsnvafzdmdotcw.supabase.co/rest/v1/whatsapp_messages",
      "sendHeaders": true,
      "headerParameters": {
        "parameters": [
          {
            "name": "apikey",
            "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cWNhanZzbnZhZnpkbWRvdGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyNTIzMiwiZXhwIjoyMDk0NDAxMjMyfQ.xFDCgKg80lxdGtF6Hb_9J5fAv_jqel_l380Dln1b71A"
          },
          {
            "name": "Authorization",
            "value": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cWNhanZzbnZhZnpkbWRvdGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyNTIzMiwiZXhwIjoyMDk0NDAxMjMyfQ.xFDCgKg80lxdGtF6Hb_9J5fAv_jqel_l380Dln1b71A"
          },
          {
            "name": "Content-Type",
            "value": "application/json"
          },
          {
            "name": "Prefer",
            "value": "return=representation"
          }
        ]
      },
      "sendBody": true,
      "specifyBody": "json",
      "jsonBody": "={\n  \"tenant_id\": \"{{$('Update Order Status — Supabase').item.json.tenant_id || '395b50b9-9504-47ce-a8be-3b5c3ff22315'}}\",\n  \"phone_number\": \"{{$('Update Order Status — Supabase').item.json.customer_phone || $('Update Order Status — Supabase').item.json.whatsapp_number}}\",\n  \"contact_name\": \"{{$('Update Order Status — Supabase').item.json.customer_name}}\",\n  \"direction\": \"outbound\",\n  \"message_body\": \"Sent order confirmation template.\",\n  \"status\": \"sent\",\n  \"order_id\": \"{{$('Update Order Status — Supabase').item.json.order_ref || $('Update Order Status — Supabase').item.json.id}}\"\n}",
      "options": {
        "response": {
          "response": {
            "neverError": true
          }
        }
      }
    },
    "id": "log-wa-to-supabase-node",
    "name": "Log WhatsApp to Supabase",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.1,
    "position": [
      1600,
      1840
    ]
  };
  
  workflow.nodes.push(getConfigNode, sendWhatsAppNode, logToSupabaseNode);
  
  // Find "Update Order Status — Supabase" node to connect to
  const parentNodeName = "Update Order Status — Supabase";
  if (!workflow.connections[parentNodeName]) {
    workflow.connections[parentNodeName] = {
      "main": [[]]
    };
  }
  
  workflow.connections[parentNodeName].main[0].push({
    "node": "Get WhatsApp Config",
    "type": "main",
    "index": 0
  });

  workflow.connections["Get WhatsApp Config"] = {
    "main": [[{
      "node": "Send WhatsApp Message",
      "type": "main",
      "index": 0
    }]]
  };

  workflow.connections["Send WhatsApp Message"] = {
    "main": [[{
      "node": "Log WhatsApp to Supabase",
      "type": "main",
      "index": 0
    }]]
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2));
  console.log('Successfully wrote single_full_workflow.json');
} catch (e) {
  console.error('Error updating workflow:', e);
}
