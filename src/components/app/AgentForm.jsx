import React, { useState } from "react";
import { GlassButton } from "@/components/site/Glass";
import { TextArea, TextField } from "./Field";
import Toggle from "./Toggle";
import PersonalityControls from "./PersonalityControls";
import { DEFAULT_PERMISSIONS, PERMISSIONS, buildGreeting, buildPersonalityPrompt } from "@/lib/agentOptions";

export default function AgentForm({ agent, saving, onCancel, onSave }) {
  const [form, setForm] = useState(() => ({
    name: agent?.name ?? "",
    purpose: agent?.purpose ?? "",
    voice: agent?.voice ?? "Warm",
    language: agent?.language ?? "English (US)",
    tone: agent?.tone ?? "Reassuring",
    rules: agent?.rules ?? "",
    phone_number: agent?.phone_number ?? "",
    recording_enabled: agent?.recording_enabled ?? false,
    permissions: { ...DEFAULT_PERMISSIONS, ...(agent?.permissions || {}) },
  }));
  const [customGreeting, setCustomGreeting] = useState(agent?.greeting ?? "");

  const greeting =
    customGreeting.trim() ||
    buildGreeting({
      voice: form.voice,
      tone: form.tone,
      language: form.language,
      name: form.name.trim() || "Aria",
    });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setPermission = (key, value) =>
    setForm((prev) => ({ ...prev, permissions: { ...prev.permissions, [key]: value } }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || saving) return;
    onSave({
      name: form.name.trim(),
      purpose: form.purpose.trim(),
      voice: form.voice,
      language: form.language,
      tone: form.tone,
      greeting,
      rules: form.rules.trim(),
      phone_number: form.phone_number.trim(),
      recording_enabled: form.recording_enabled,
      permissions: form.permissions,
      personality_prompt: buildPersonalityPrompt({ ...form, greeting }),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Agent name"
          placeholder="Aria"
          value={form.name}
          onChange={(event) => set("name", event.target.value)}
          maxLength={60}
          required
        />
        <TextField
          label="Phone number"
          placeholder="+1 (415) 555-0132"
          value={form.phone_number}
          onChange={(event) => set("phone_number", event.target.value)}
          maxLength={40}
        />
      </div>

      <TextArea
        label="Purpose"
        rows={2}
        placeholder="Personal concierge — books, reschedules and screens calls"
        value={form.purpose}
        onChange={(event) => set("purpose", event.target.value)}
        maxLength={240}
      />

      <PersonalityControls value={form} onChange={set} greeting={greeting} />

      <TextArea
        label="Greeting (optional)"
        rows={2}
        placeholder="Leave blank to use the generated greeting above"
        value={customGreeting}
        onChange={(event) => setCustomGreeting(event.target.value)}
        maxLength={400}
      />

      <TextArea
        label="Rules"
        rows={2}
        placeholder="Never promise discounts. Offer afternoon slots first."
        value={form.rules}
        onChange={(event) => set("rules", event.target.value)}
        maxLength={400}
      />

      <div>
        <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/40">Permissions</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PERMISSIONS.map((permission) => (
            <Toggle
              key={permission.key}
              label={permission.label}
              hint={permission.hint}
              checked={form.permissions[permission.key] === true}
              onChange={(value) => setPermission(permission.key, value)}
            />
          ))}
        </div>
      </div>

      <Toggle
        label="Record calls"
        hint="Off by default. Recordings are never stored by Voxaryn."
        checked={form.recording_enabled}
        onChange={(value) => set("recording_enabled", value)}
      />

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
        <GlassButton type="button" size="sm" tone="quiet" onClick={onCancel} disabled={saving}>
          Cancel
        </GlassButton>
        <GlassButton type="submit" size="sm" tone="primary" disabled={saving || !form.name.trim()}>
          {saving ? "Saving…" : agent ? "Save changes" : "Create agent"}
        </GlassButton>
      </div>
    </form>
  );
}