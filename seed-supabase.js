require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://rvqcajvsnvafzdmdotcw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tenantId = '395b50b9-9504-47ce-a8be-3b5c3ff22315';

// Map ids to valid UUIDs to maintain complete database relations
const uuidMap = {
  // Menu Items
  'm1': '11111111-1111-1111-1111-111111111101',
  'm2': '11111111-1111-1111-1111-111111111102',
  'm3': '11111111-1111-1111-1111-111111111103',
  'm4': '11111111-1111-1111-1111-111111111104',
  'm5': '11111111-1111-1111-1111-111111111105',
  'm6': '11111111-1111-1111-1111-111111111106',
  'm7': '11111111-1111-1111-1111-111111111107',
  'm8': '11111111-1111-1111-1111-111111111108',
  'm9': '11111111-1111-1111-1111-111111111109',
  'm10': '11111111-1111-1111-1111-111111111110',
  'm11': '11111111-1111-1111-1111-111111111111',
  'm12': '11111111-1111-1111-1111-111111111112',
  'm13': '11111111-1111-1111-1111-111111111113',
  'm14': '11111111-1111-1111-1111-111111111114',
  'm15': '11111111-1111-1111-1111-111111111115',
  'm16': '11111111-1111-1111-1111-111111111116',
  'm17': '11111111-1111-1111-1111-111111111117',
  'm18': '11111111-1111-1111-1111-111111111118',
  // Customers
  'c1': '22222222-2222-2222-2222-222222222201',
  'c2': '22222222-2222-2222-2222-222222222202',
  'c3': '22222222-2222-2222-2222-222222222203',
  'c4': '22222222-2222-2222-2222-222222222204',
  'c5': '22222222-2222-2222-2222-222222222205',
  // Orders
  'o1': '33333333-3333-3333-3333-333333333301',
  'o2': '33333333-3333-3333-3333-333333333302',
  'o3': '33333333-3333-3333-3333-333333333303',
  'o4': '33333333-3333-3333-3333-333333333304',
  'o5': '33333333-3333-3333-3333-333333333305',
  // Campaigns
  'camp1': '44444444-4444-4444-4444-444444444401',
  'camp2': '44444444-4444-4444-4444-444444444402',
};

async function seed() {
  console.log("Starting Supabase database seeding...");

  // 1. Seed Menu Items
  const menuItems = [
    { id: uuidMap['m1'], tenant_id: tenantId, name: 'Pão de Queijo (3 pack)', description: 'Traditional Brazilian cheese bread balls, crispy on the outside and chewy on the inside.', price: 8.50, category: 'Pães & Salgados', available: true, popular: true, allergens: ['Dairy', 'Eggs'], preparation_time: 8 },
    { id: uuidMap['m2'], tenant_id: tenantId, name: 'Coxinha', description: 'Crispy dough filled with shredded seasoned chicken.', price: 4.50, category: 'Pães & Salgados', available: true, popular: true, allergens: ['Gluten', 'Dairy'], preparation_time: 5 },
    { id: uuidMap['m3'], tenant_id: tenantId, name: 'Kibe', description: 'Deep-fried seasoned ground beef and bulgur wheat.', price: 4.50, category: 'Pães & Salgados', available: true, popular: false, allergens: ['Gluten'], preparation_time: 5 },
    { id: uuidMap['m4'], tenant_id: tenantId, name: 'Empada de Palmito', description: 'Brazilian savory pastry filled with hearts of palm cream.', price: 5.00, category: 'Pães & Salgados', available: true, popular: false, allergens: ['Gluten', 'Dairy', 'Eggs'], preparation_time: 6 },
    { id: uuidMap['m5'], tenant_id: tenantId, name: 'Pastéis (2 pack)', description: 'Crispy fried thin crust pastry with your choice of cheese or beef.', price: 7.50, category: 'Pães & Salgados', available: true, popular: true, allergens: ['Gluten', 'Dairy'], preparation_time: 7 },
    { id: uuidMap['m6'], tenant_id: tenantId, name: 'Brigadeiro', description: 'Traditional Brazilian chocolate truffle.', price: 3.00, category: 'Doces', available: true, popular: true, allergens: ['Dairy'], preparation_time: 2 },
    { id: uuidMap['m7'], tenant_id: tenantId, name: 'Beijinho', description: 'Coconut truffle, the sibling of Brigadeiro.', price: 3.00, category: 'Doces', available: true, popular: false, allergens: ['Dairy', 'Nuts'], preparation_time: 2 },
    { id: uuidMap['m8'], tenant_id: tenantId, name: 'Quindim', description: 'Bright yellow baked custard made with sugar, egg yolks, and coconut.', price: 4.50, category: 'Doces', available: true, popular: false, allergens: ['Eggs', 'Nuts'], preparation_time: 3 },
    { id: uuidMap['m9'], tenant_id: tenantId, name: 'Bolo de Rolo', description: 'Thin sponge cake rolled with guava paste.', price: 6.00, category: 'Doces', available: true, popular: true, allergens: ['Gluten', 'Eggs'], preparation_time: 3 },
    { id: uuidMap['m10'], tenant_id: tenantId, name: 'Brazilian Coffee', description: 'Strong and smooth dark roast coffee.', price: 4.00, category: 'Bebidas', available: true, popular: true, allergens: [], preparation_time: 4 },
    { id: uuidMap['m11'], tenant_id: tenantId, name: 'Guaraná Antarctica', description: 'Popular Brazilian soda with a unique berry flavor.', price: 3.50, category: 'Bebidas', available: true, popular: true, allergens: [], preparation_time: 1 },
    { id: uuidMap['m12'], tenant_id: tenantId, name: 'Suco de Maracujá', description: 'Fresh passion fruit juice.', price: 5.50, category: 'Bebidas', available: true, popular: false, allergens: [], preparation_time: 5 },
    { id: uuidMap['m13'], tenant_id: tenantId, name: 'Cafezinho', description: 'Small, strong Brazilian style espresso.', price: 2.50, category: 'Bebidas', available: true, popular: false, allergens: [], preparation_time: 3 },
    { id: uuidMap['m14'], tenant_id: tenantId, name: 'Cheese Bread Combo', description: '6 pieces of Pão de Queijo + any drink.', price: 14.00, category: 'Combos', available: true, popular: true, allergens: ['Dairy', 'Eggs'], preparation_time: 10 },
    { id: uuidMap['m15'], tenant_id: tenantId, name: 'Salgado Combo', description: '2 Salgados + 1 Brigadeiro + 1 drink.', price: 16.50, category: 'Combos', available: true, popular: false, allergens: ['Gluten', 'Dairy', 'Eggs'], preparation_time: 12 },
    { id: uuidMap['m16'], tenant_id: tenantId, name: 'Acai Bowl', description: 'Pure acai topped with granola, banana, and honey.', price: 12.00, category: 'Acai & Bowls', available: true, popular: true, allergens: ['Nuts'], preparation_time: 10 },
    { id: uuidMap['m17'], tenant_id: tenantId, name: 'Acai Smoothies', description: 'Acai blended with banana and guarana syrup.', price: 9.00, category: 'Acai & Bowls', available: true, popular: false, allergens: [], preparation_time: 8 },
    { id: uuidMap['m18'], tenant_id: tenantId, name: 'Feijoada Bowl (Saturday)', description: 'Black bean stew with pork and beef, served over rice.', price: 18.00, category: 'Especiais do Dia', available: true, popular: true, allergens: [], preparation_time: 15 }
  ];

  const { error: menuErr } = await supabase.from('menu_items').upsert(menuItems);
  if (menuErr) console.error("❌ Error seeding menu_items:", menuErr.message);
  else console.log("✅ Seeded menu_items successfully!");

  // 2. Seed Customers
  const customers = [
    { id: uuidMap['c1'], tenant_id: tenantId, name: 'João Mendes', phone: '+1 718-555-0123', email: 'joao.mendes@email.com', preferred_channel: 'VOICE', consents: { essential: true, marketing: true, intelligence: true }, churn_risk: 'LOW', ltv: 680, rfm_segment: 'Champion', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 240).toISOString(), last_order_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: uuidMap['c2'], tenant_id: tenantId, name: 'Maria Silva', phone: '+1 718-555-0124', email: 'maria.s@email.com', preferred_channel: 'WHATSAPP', consents: { essential: true, marketing: true, intelligence: false }, churn_risk: 'MEDIUM', ltv: 420, rfm_segment: 'Loyal', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(), last_order_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: uuidMap['c3'], tenant_id: tenantId, name: 'Ricardo Oliveira', phone: '+1 718-555-0125', email: 'ricardo.oli@email.com', preferred_channel: 'WEB', consents: { essential: true, marketing: false, intelligence: false }, churn_risk: 'LOW', ltv: 1200, rfm_segment: 'Champion', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(), last_order_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { id: uuidMap['c4'], tenant_id: tenantId, name: 'Ana Costa', phone: '+1 718-555-0126', email: 'ana.costa@email.com', preferred_channel: 'SMS', consents: { essential: true, marketing: true, intelligence: true }, churn_risk: 'HIGH', ltv: 150, rfm_segment: 'At Risk', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), last_order_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString() },
    { id: uuidMap['c5'], tenant_id: tenantId, name: 'Carlos Santos', phone: '+1 718-555-0127', email: 'carlos.s@email.com', preferred_channel: 'VOICE', consents: { essential: true, marketing: true, intelligence: true }, churn_risk: 'LOW', ltv: 200, rfm_segment: 'New', created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), last_order_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() }
  ];

  const { error: custErr } = await supabase.from('customers').upsert(customers);
  if (custErr) console.error("❌ Error seeding customers:", custErr.message);
  else console.log("✅ Seeded customers successfully!");

  // 3. Seed Campaigns
  const campaigns = [
    { id: uuidMap['camp1'], tenant_id: tenantId, name: 'Birthday Special — May', channel: 'WHATSAPP', status: 'SENT', segment: 'Birthday this month', recipient_count: 47, sent_count: 47, revenue: 430, message: 'Feliz aniversário! 🎉 Get a free brigadeiro on your next visit at NYPDQ Astoria. Show this message at checkout!', sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString() },
    { id: uuidMap['camp2'], tenant_id: tenantId, name: 'New Item Launch: Feijoada', channel: 'SMS', status: 'SCHEDULED', segment: 'All customers', recipient_count: 312, sent_count: 0, revenue: 0, message: 'Our famous Feijoada is back this Saturday! Pre-order now to guarantee your bowl. Reply ORDER to start.', scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
  ];

  const { error: campErr } = await supabase.from('campaigns').upsert(campaigns);
  if (campErr) console.error("❌ Error seeding campaigns:", campErr.message);
  else console.log("✅ Seeded campaigns successfully!");

  // 4. Seed Orders and Order Items
  const orders = [
    { id: uuidMap['o1'], order_number: '1047', tenant_id: tenantId, customer_id: uuidMap['c1'], customer_name: 'João Mendes', customer_phone: '+1 718-555-0123', subtotal: 21.00, delivery_fee: 2.50, tax: 1.00, total: 24.50, status: 'PAID', type: 'DELIVERY', channel: 'VOICE', address: '31st Ave, Astoria, NY', payment_status: 'PAID', created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(), updated_at: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
    { id: uuidMap['o2'], order_number: '1046', tenant_id: tenantId, customer_id: uuidMap['c2'], customer_name: 'Maria Silva', customer_phone: '+1 718-555-0124', subtotal: 15.50, delivery_fee: 0, tax: 1.00, total: 16.50, status: 'PREPARING', type: 'PICKUP', channel: 'WHATSAPP', payment_status: 'PAID', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), estimated_ready_at: new Date(Date.now() + 1000 * 60 * 10).toISOString() },
    { id: uuidMap['o3'], order_number: '1045', tenant_id: tenantId, customer_id: uuidMap['c3'], customer_name: 'Ricardo Oliveira', customer_phone: '+1 718-555-0125', subtotal: 23.00, delivery_fee: 3.00, tax: 2.00, total: 28.00, status: 'READY', type: 'DELIVERY', channel: 'WEB', address: 'Broadway, Astoria, NY', payment_status: 'PAID', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
    { id: uuidMap['o4'], order_number: '1044', tenant_id: tenantId, customer_id: uuidMap['c4'], customer_name: 'Ana Costa', customer_phone: '+1 718-555-0126', subtotal: 13.00, delivery_fee: 0, tax: 1.00, total: 14.00, status: 'DELIVERED', type: 'PICKUP', channel: 'SMS', payment_status: 'PAID', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
    { id: uuidMap['o5'], order_number: '1043', tenant_id: tenantId, customer_id: uuidMap['c5'], customer_name: 'Carlos Santos', customer_phone: '+1 718-555-0127', subtotal: 14.50, delivery_fee: 2.50, tax: 1.50, total: 18.50, status: 'PAID', type: 'DELIVERY', channel: 'VOICE', address: 'Steinway St, Astoria, NY', payment_status: 'PAID', created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(), updated_at: new Date(Date.now() - 1000 * 60 * 1).toISOString() }
  ];

  const { error: orderErr } = await supabase.from('orders').upsert(orders);
  if (orderErr) {
    console.error("❌ Error seeding orders:", orderErr.message);
  } else {
    console.log("✅ Seeded orders successfully!");

    const orderItems = [
      { id: '55555555-5555-5555-5555-555555555501', order_id: uuidMap['o1'], menu_item_id: uuidMap['m1'], name: 'Pão de Queijo (3 pack)', quantity: 2, price: 8.50 },
      { id: '55555555-5555-5555-5555-555555555502', order_id: uuidMap['o1'], menu_item_id: uuidMap['m10'], name: 'Brazilian Coffee', quantity: 1, price: 4.00 },
      { id: '55555555-5555-5555-5555-555555555503', order_id: uuidMap['o2'], menu_item_id: uuidMap['m16'], name: 'Acai Bowl', quantity: 1, price: 12.00 },
      { id: '55555555-5555-5555-5555-555555555504', order_id: uuidMap['o2'], menu_item_id: uuidMap['m11'], name: 'Guaraná Antarctica', quantity: 1, price: 3.50 },
      { id: '55555555-5555-5555-5555-555555555505', order_id: uuidMap['o3'], menu_item_id: uuidMap['m14'], name: 'Cheese Bread Combo', quantity: 1, price: 14.00 },
      { id: '55555555-5555-5555-5555-555555555506', order_id: uuidMap['o3'], menu_item_id: uuidMap['m2'], name: 'Coxinha', quantity: 2, price: 4.50 },
      { id: '55555555-5555-5555-5555-555555555507', order_id: uuidMap['o4'], menu_item_id: uuidMap['m5'], name: 'Pastéis (2 pack)', quantity: 1, price: 7.50 },
      { id: '55555555-5555-5555-5555-555555555508', order_id: uuidMap['o4'], menu_item_id: uuidMap['m12'], name: 'Suco de Maracujá', quantity: 1, price: 5.50 },
      { id: '55555555-5555-5555-5555-555555555509', order_id: uuidMap['o5'], menu_item_id: uuidMap['m1'], name: 'Pão de Queijo (3 pack)', quantity: 1, price: 8.50 },
      { id: '55555555-5555-5555-5555-555555555510', order_id: uuidMap['o5'], menu_item_id: uuidMap['m6'], name: 'Brigadeiro', quantity: 2, price: 3.00 }
    ];

    const { error: itemsErr } = await supabase.from('order_items').upsert(orderItems);
    if (itemsErr) console.error("❌ Error seeding order_items:", itemsErr.message);
    else console.log("✅ Seeded order_items successfully!");
  }

  // 5. Seed Call Logs
  const callLogs = [
    { id: 'call_1', started_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), customer_phone: '+1 718-555-0123', customer_name: 'João Mendes', duration_seconds: 142, status: 'completed', cost_usd: 0.45, source: 'vapi', transcript: [{ role: 'assistant', text: 'Hello, welcome to NYPDQ. How can I help you today?' }, { role: 'user', text: 'Hi, I would like to order two cheese breads and a coffee.' }, { role: 'assistant', text: 'Great! Two Pão de Queijo and one Brazilian Coffee. Anything else?' }, { role: 'user', text: 'No, that is all. For pickup.' }], summary: 'Customer ordered 2x Pão de Queijo and 1x Coffee for pickup.', recording_url: 'https://example.com/recording1.mp3', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vapi_account: 'normal', assistantId: 'ast_123', type: 'inbound' },
    { id: 'call_2', started_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), customer_phone: '+1 718-555-0124', customer_name: 'Maria Silva', duration_seconds: 85, status: 'completed', cost_usd: 0.28, source: 'vapi', transcript: [{ role: 'assistant', text: 'Hello, NYPDQ. Sofia speaking.' }, { role: 'user', text: 'Do you have gluten free options?' }, { role: 'assistant', text: 'Yes, our Pão de Queijo is naturally gluten free as it is made with tapioca flour.' }], summary: 'Inquiry about gluten-free options.', recording_url: 'https://example.com/recording2.mp3', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vapi_account: 'normal', assistantId: 'ast_123', type: 'inbound' },
    { id: 'call_3', started_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), customer_phone: '+1 718-555-0125', customer_name: 'Ricardo Oliveira', duration_seconds: 12, status: 'missed', cost_usd: 0, source: 'vapi', transcript: [], summary: 'Missed call from customer.', recording_url: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vapi_account: 'normal', assistantId: 'ast_123', type: 'inbound' }
  ];

  const { error: callErr } = await supabase.from('vapi_call_logs').upsert(callLogs);
  if (callErr) console.error("❌ Error seeding vapi_call_logs:", callErr.message);
  else console.log("✅ Seeded vapi_call_logs successfully!");

  console.log("Seeding complete!");
}

seed();
