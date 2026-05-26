import { SMSPanel } from "@/components/SMSPanel"

export const metadata = {
  title: 'SMS | GuileoAI',
  description: 'Manage customer conversations and SMS configurations via Twilio',
}

export default function SMSPage() {
  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#13131A] z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SMS Integration</h1>
          <p className="text-sm text-text-muted mt-1">
            Chat with customers via Twilio SMS and manage notification channels.
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <SMSPanel />
      </div>
    </div>
  )
}
