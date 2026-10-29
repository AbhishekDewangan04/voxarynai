import React, { useCallback, useEffect, useState } from "react";
import { LogOut, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GlassButton, GlassCard, GlassPanel } from "@/components/site/Glass";
import { useToast } from "@/components/ui/use-toast";
import LoadDemoDataButton from "@/components/app/LoadDemoDataButton";
import PageHeader from "@/components/app/PageHeader";
import { SelectField, TextField } from "@/components/app/Field";
import { SkeletonRows } from "@/components/app/Skeleton";

const RETENTION_OPTIONS = [
  { value: "off", label: "Off — nothing is stored" },
  { value: "30_days", label: "30 days" },
  { value: "90_days", label: "90 days" },
];

export default function Settings() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [retention, setRetention] = useState("off");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const me = await base44.auth.me();
    setUser(me);
    setFullName(me.full_name || "");
    setRetention(me.recording_retention || "off");
  }, []);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: fullName.trim(), recording_retention: retention });
      toast({ title: "Settings saved", description: "Your profile and retention choice are updated." });
      await load();
    } catch (error) {
      toast({ title: "Couldn't save settings", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteMyData = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const scope = { owner_id: user.id };
      await Promise.all([
        base44.entities.Task.deleteMany(scope),
        base44.entities.TranscriptLine.deleteMany(scope),
        base44.entities.Memory.deleteMany(scope),
        base44.entities.Call.deleteMany(scope),
        base44.entities.Agent.deleteMany(scope),
        base44.entities.Integration.deleteMany(scope),
      ]);
      toast({ title: "Your data is deleted", description: "Agents, calls, transcripts, memories and tasks are gone." });
      setConfirmDelete(false);
    } catch (error) {
      toast({ title: "Couldn't delete everything", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Workspace" title="Settings" />
        <GlassPanel className="p-5">
          <SkeletonRows rows={2} />
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Your profile, recording policy and data controls."
      />

      <GlassPanel className="p-5 sm:p-6">
        <form onSubmit={saveProfile} className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Profile</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              maxLength={80}
              placeholder="Marcus Hale"
            />
            <TextField label="Email" value={user.email || ""} readOnly disabled />
          </div>

          <SelectField
            label="Recording retention"
            value={retention}
            onChange={(event) => setRetention(event.target.value)}
          >
            {RETENTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <p className="-mt-2 text-[11px] leading-relaxed text-white/35">
            Call audio is never stored by Voxaryn. Recording stays off unless your Twilio account records calls, in which
            case this sets how long those files are retained.
          </p>

          <div className="flex justify-end">
            <GlassButton type="submit" size="sm" tone="primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </GlassButton>
          </div>
        </form>
      </GlassPanel>

      <GlassCard className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Demo data</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">
          Add two sample agents with calls, transcripts, memories and tasks so you can explore the workspace.
        </p>
        <div className="mt-3">
          <LoadDemoDataButton label="Load demo data" />
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-200/80" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Danger zone</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">
              Delete every agent, call, transcript, memory and task you own. This can't be undone.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {confirmDelete ? (
                <>
                  <button
                    type="button"
                    onClick={deleteMyData}
                    disabled={deleting}
                    className="rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-[12.5px] font-medium text-rose-100 transition-colors hover:bg-rose-500/30 disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Yes, delete everything"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full px-3 py-2 text-[12px] text-white/50 transition-colors hover:text-white"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full border border-rose-300/25 bg-rose-400/10 px-4 py-2 text-[12.5px] font-medium text-rose-100 transition-colors hover:bg-rose-400/20"
                >
                  Delete my data
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <GlassButton size="sm" tone="quiet" onClick={() => base44.auth.logout()}>
          <span className="inline-flex items-center gap-1.5">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </span>
        </GlassButton>
      </div>
    </div>
  );
}