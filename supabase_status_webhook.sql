-- Enable the pg_net extension for HTTP requests if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the trigger function to ping n8n
CREATE OR REPLACE FUNCTION public.handle_order_status_update()
RETURNS trigger AS $$
BEGIN
  -- Only trigger if the status actually changed to prevent duplicate webhooks
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Make the HTTP request to the n8n webhook using pg_net
    PERFORM net.http_post(
      -- NOTE: Replace this URL with your actual production n8n webhook URL
      url := 'http://YOUR_N8N_URL/webhook/whatsapp-status-update',
      body := json_build_object(
        'type', 'UPDATE',
        'table', 'orders',
        'record', row_to_json(NEW)
      )::jsonb,
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists, then create it on the orders table
DROP TRIGGER IF EXISTS on_order_status_update ON public.orders;

CREATE TRIGGER on_order_status_update
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_update();
