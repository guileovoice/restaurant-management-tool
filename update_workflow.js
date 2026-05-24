const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\abeer\\.gemini\\antigravity\\brain\\44b81677-7372-429c-8a9c-ad703b10e610\\.system_generated\\steps\\8\\output.txt';
const outputPath = 'C:\\ScalePods\\GUILEO\\Restaurant Management Tool\\main_workflow_updated.json';

try {
  let content = fs.readFileSync(inputPath, 'utf8');
  // strip anything before the first {
  content = content.substring(content.indexOf('{'));
  
  const workflowData = JSON.parse(content);
  const workflow = workflowData.workflow || workflowData;
  
  // Create new node
  const newNode = {
    "parameters": {
      "method": "POST",
      "url": "http://localhost:5678/webhook/whatsapp-restaurant-trigger",
      "sendBody": true,
      "specifyBody": "json",
      "jsonBody": "={\\n  \"tenant_id\": \"{{$json.tenant_id}}\",\\n  \"phone\": \"{{$json.customer_phone || $json.whatsapp_number}}\",\\n  \"customer_name\": \"{{$json.customer_name}}\",\\n  \"order_id\": \"{{$json.order_ref || $json.id}}\"\\n}",
      "options": {
        "response": {
          "response": {
            "neverError": true
          }
        }
      }
    },
    "id": "whatsapp-trigger-node-12345",
    "name": "Trigger WhatsApp Workflow",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.1,
    "position": [
      1200,
      1840
    ]
  };
  
  workflow.nodes.push(newNode);
  
  // Find "Update Order Status — Supabase" node to connect to
  const parentNodeName = "Update Order Status — Supabase";
  if (!workflow.connections[parentNodeName]) {
    workflow.connections[parentNodeName] = {
      "main": [[]]
    };
  }
  
  workflow.connections[parentNodeName].main[0].push({
    "node": "Trigger WhatsApp Workflow",
    "type": "main",
    "index": 0
  });
  
  fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2));
  console.log('Successfully wrote main_workflow_updated.json');
} catch (e) {
  console.error('Error updating workflow:', e);
}
