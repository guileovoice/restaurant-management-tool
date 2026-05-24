-- add_whatsapp_tables.sql

-- 1. whatsapp_config
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid not null,
  phone_number_id text not null,
  access_token text not null,
  verify_token text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.whatsapp_config
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. whatsapp_messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid not null,
  phone_number text not null,
  contact_name text,
  direction text not null check (direction in ('inbound', 'outbound')),
  message_body text not null,
  status text not null,
  order_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.whatsapp_messages
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. whatsapp_inbound (for tracking unread counts etc.)
CREATE TABLE IF NOT EXISTS public.whatsapp_inbound (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid not null,
  phone_number text not null,
  unread_count integer default 0,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.whatsapp_inbound ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.whatsapp_inbound
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert Dummy Data for the default tenant: 395b50b9-9504-47ce-a8be-3b5c3ff22315
INSERT INTO public.whatsapp_messages (tenant_id, phone_number, contact_name, direction, message_body, status, created_at)
VALUES 
  ('395b50b9-9504-47ce-a8be-3b5c3ff22315', '+17185550123', 'João Mendes', 'outbound', 'Hi João, your order 1047 is confirmed!', 'delivered', now() - interval '1 hour'),
  ('395b50b9-9504-47ce-a8be-3b5c3ff22315', '+17185550123', 'João Mendes', 'inbound', 'Great, thanks!', 'received', now() - interval '55 minutes'),
  ('395b50b9-9504-47ce-a8be-3b5c3ff22315', '+17185550124', 'Maria Silva', 'outbound', 'Hi Maria, your order is preparing.', 'read', now() - interval '30 minutes')
ON CONFLICT DO NOTHING;

INSERT INTO public.whatsapp_inbound (tenant_id, phone_number, unread_count, last_message_at)
VALUES 
  ('395b50b9-9504-47ce-a8be-3b5c3ff22315', '+17185550123', 0, now() - interval '55 minutes'),
  ('395b50b9-9504-47ce-a8be-3b5c3ff22315', '+17185550124', 0, now() - interval '30 minutes')
ON CONFLICT DO NOTHING;
