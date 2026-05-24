import { WhatsAppPanel } from "@/components/WhatsAppPanel"

export const metadata = {
  title: 'WhatsApp | GuileoAI',
  description: 'Manage customer conversations via WhatsApp',
}

export default function WhatsAppPage() {
  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#13131A] z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">WhatsApp Integration</h1>
          <p className="text-sm text-text-muted mt-1">
            Chat with customers and manage notification settings.
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <WhatsAppPanel />
      </div>
    </div>
  )
}
