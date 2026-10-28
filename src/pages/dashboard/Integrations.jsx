import React, { useCallback, useEffect, useState } from "react";
import { Check, Plug } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GlassButton, GlassCard } from "@/components/site/Glass";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/app/PageHeader";
import { SkeletonCards } from "@/components/app/Skeleton";

const PROVIDERS = [
  { id: "google_calendar", label: "Google Calendar", description: "Read availability and book appointments.", scopes: ["calendar.events", "calendar.readonly"] },
  { id: "outlook", label: "Outlook Calendar", description: "Book straight into Microsoft 365 calendars.", scopes: ["Calendars.ReadWrite"] },
  { id: "notion", label: "Notion", description: "File call notes into a Notion database.", scopes: ["read_content", "insert_content"] },
  { id: "slack", label: "Slack", description: "Ping a channel when a call needs you.", scopes: ["chat:write", "channels:read"] },
  { id: "hubspot", label: "HubSpot", description: "Create contacts and notes from calls.", scopes: ["crm.objects.contacts.write"] },
  { id: "zapier", label: "Zapier", description: "Trigger any of 6,000+ app automations.", scopes: ["webhook"] },
  { id: "mongodb", label: "MongoDB", description: "Sync transcripts into your own cluster.", scopes: ["readWrite"] },
  { id: "webhook", label: "Webhook", description: "POST every call event to your endpoint.", scopes: ["calls.read"] },
  { id: "twilio", label: "Twilio", description: "Phone numbers, media streams and SMS.", scopes: ["calls", "messages"] },
  { id: "whatsapp", label: "WhatsApp", description: "Send confirmations over WhatsApp.", scopes: ["messages"] },
];

export default function Integrations() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [ownerId, setOwnerId] = useState(null);

  const load = useCallback(async () => {
    const user = await base44.auth.me();
    setOwnerId(user.id);
    const page = await base44.entities.Integration.filter({ owner_id: user.id }, { limit: 50 });
    setRecords(page.items ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const toggle = async (provider) => {
    const existing = records.find((record) => record.provider === provider.id);
    const connected = existing?.status === "connected";
    setBusy(provider.id);
    try {
      if (existing) {
        await base44.entities.Integration.update(existing.id, {
          status: connected ? "disconnected" : "connected",
          scopes: provider.scopes,
        });
      } else {
        await base44.entities.Integration.create({
          owner_id: ownerId,
          provider: provider.id,
          status: "connected",
          scopes: provider.scopes,
        });
      }
      toast({
        title: connected ? `${provider.label} disconnected` : `${provider.label} connected`,
        description: connected
          ? "Agents can no longer use this connection."
          : `Scopes granted: ${provider.scopes.join(", ")}.`,
      });
      await load();
    } catch (error) {
      toast({ title: "Couldn't update integration", description: error.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Workspace"
        title="Integrations"
        description="Connect the tools your agents act on. Each connection only gets the scopes listed here."
      />

      {loading ? (
        <SkeletonCards count={6} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PROVIDERS.map((provider) => {
            const record = records.find((item) => item.provider === provider.id);
            const connected = record?.status === "connected";
            return (
              <GlassCard key={provider.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-white">{provider.label}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">{provider.description}</p>
                  </div>
                  {connected && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-200">
                      <Check className="h-2.5 w-2.5" /> connected
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(record?.scopes?.length ? record.scopes : provider.scopes).map((scope) => (
                    <span
                      key={scope}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[9.5px] text-white/45"
                    >
                      {scope}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4">
                  <GlassButton
                    size="sm"
                    tone={connected ? "quiet" : "primary"}
                    disabled={busy === provider.id}
                    onClick={() => toggle(provider)}
                    className="w-full"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Plug className="h-3 w-3" />
                      {connected ? "Disconnect" : "Connect"}
                    </span>
                  </GlassButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}