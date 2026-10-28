import { secrets } from "base44:runtime";

// Which agent permission unlocks each task type an agent can perform.
export const PERMISSION_BY_TASK = {
  booking: "book_appointments",
  sms: "send_confirmations",
  notification: "send_notifications",
  info_collected: "collect_info",
};

const SENTIMENTS = ["Positive", "Neutral", "Negative", "Blocked"];
const TASK_TYPES = ["booking", "sms", "info_collected", "notification"];

/** Constant-time-ish comparison of the shared webhook secret header. */
export function webhookSecretOk(req) {
  try {
    const expected = secrets.get("VOXARYN_WEBHOOK_SECRET");
    const provided = req.headers.get("x-voxaryn-secret") || "";
    if (!expected || !provided || expected.length !== provided.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i += 1) {
      diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export function buildTranscript(lines) {
  return lines
    .map((line) => `${line.speaker === "caller" ? "Caller" : "Agent"}: ${line.text}`)
    .join("\n");
}

export function normalizeFact(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function loadCallBundle(base44, callId) {
  const svc = base44.asServiceRole;
  const call = await svc.entities.Call.get(callId);
  const agent = call.agent_id
    ? await svc.entities.Agent.get(call.agent_id).catch((error) => (error.status === 404 ? null : Promise.reject(error)))
    : null;
  const page = await svc.entities.TranscriptLine.filter(
    { call_id: callId },
    { sort: "timestamp_ms", limit: 400 }
  );
  return { call, agent, lines: page?.items ?? [] };
}

/**
 * Summarises a finished call, then records only the follow-up tasks the
 * agent's permissions actually allow. Safe to call more than once.
 */
export async function runSummarize(base44, callId) {
  const svc = base44.asServiceRole;
  const { call, agent, lines } = await loadCallBundle(base44, callId);
  const transcript = buildTranscript(lines) || "(no transcript captured)";
  const permissions = agent?.permissions || {};
  const allowed = Object.keys(PERMISSION_BY_TASK).filter(
    (type) => permissions[PERMISSION_BY_TASK[type]] === true
  );

  const result = await svc.integrations.Core.InvokeLLM({
    prompt: [
      "You are analysing the transcript of a phone call handled by an AI voice agent.",
      `Agent name: ${agent?.name || "Agent"}`,
      `Agent purpose: ${agent?.purpose || "Answer calls on the owner's behalf"}`,
      `Caller: ${call.caller_name || "Unknown"} (${call.caller_number || "unknown number"})`,
      "",
      "Transcript:",
      transcript,
      "",
      "Return:",
      "- summary: 2-3 sentences a busy owner can read in five seconds.",
      "- intent: short label such as 'Appointment booking' or 'Pricing question'.",
      "- sentiment: one of Positive, Neutral, Negative, Blocked.",
      "- tasks: concrete follow-up actions the agent completed or that are still open.",
      allowed.length
        ? `Only use these task types: ${allowed.join(", ")}.`
        : "The agent has no permissions, so tasks must be an empty array.",
    ].join("\n"),
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        intent: { type: "string" },
        sentiment: { type: "string", enum: SENTIMENTS },
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: TASK_TYPES },
              description: { type: "string" },
            },
            required: ["type", "description"],
          },
        },
      },
      required: ["summary", "intent", "sentiment", "tasks"],
    },
  });

  const summary = String(result?.summary || "").slice(0, 1200);
  const intent = String(result?.intent || "").slice(0, 120);
  const sentiment = SENTIMENTS.includes(result?.sentiment) ? result.sentiment : "Neutral";
  const duration = call.duration_seconds
    ? call.duration_seconds
    : lines.length
      ? Math.round(Math.max(...lines.map((line) => Number(line.timestamp_ms) || 0)) / 1000)
      : 0;

  const rows = (Array.isArray(result?.tasks) ? result.tasks : [])
    .filter((task) => allowed.includes(task?.type) && typeof task?.description === "string")
    .slice(0, 6)
    .map((task) => ({
      owner_id: call.owner_id,
      call_id: callId,
      agent_id: call.agent_id,
      type: task.type,
      description: task.description.slice(0, 400),
      status: "done",
    }));

  if (rows.length) await svc.entities.Task.bulkCreate(rows);

  await svc.entities.Call.update(callId, {
    summary,
    intent,
    sentiment,
    duration_seconds: duration,
    status: sentiment === "Blocked" ? "blocked" : call.status === "live" ? "completed" : call.status,
  });

  return { summary, intent, sentiment, tasks: rows };
}

/** Extracts durable caller facts into Memory, skipping anything already stored. */
export async function runExtractMemories(base44, callId) {
  const svc = base44.asServiceRole;
  const { call, lines } = await loadCallBundle(base44, callId);
  const transcript = buildTranscript(lines);
  if (!transcript) return { created: [] };

  const contactNumber = call.caller_number || "unknown";
  const existing = await svc.entities.Memory.filter(
    { agent_id: call.agent_id, contact_number: contactNumber },
    { limit: 100 }
  );
  const known = (existing?.items ?? []).map((memory) => memory.fact);

  const result = await svc.integrations.Core.InvokeLLM({
    prompt: [
      "Extract durable facts about the caller from this phone transcript.",
      "Only include stable, reusable details (preferences, names, relationships, recurring constraints, important dates).",
      "Ignore small talk, one-off requests and anything already known.",
      "",
      `Caller: ${call.caller_name || "Unknown"} (${contactNumber})`,
      `Already known facts:\n${known.length ? known.map((fact) => `- ${fact}`).join("\n") : "- none"}`,
      "",
      "Transcript:",
      transcript,
      "",
      "Return new facts only. Each fact must be a single short sentence in the third person.",
    ].join("\n"),
    response_json_schema: {
      type: "object",
      properties: {
        facts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              fact: { type: "string" },
              contact_name: { type: "string" },
            },
            required: ["fact"],
          },
        },
      },
      required: ["facts"],
    },
  });

  const knownKeys = known.map(normalizeFact).filter(Boolean);
  const seen = new Set(knownKeys);
  const isNearDuplicate = (key) =>
    knownKeys.some((existing) => existing === key || existing.includes(key) || key.includes(existing));

  const rows = [];
  for (const entry of Array.isArray(result?.facts) ? result.facts : []) {
    const fact = String(entry?.fact || "").trim();
    const key = normalizeFact(fact);
    if (!fact || key.length < 8 || seen.has(key) || isNearDuplicate(key)) continue;
    seen.add(key);
    rows.push({
      owner_id: call.owner_id,
      agent_id: call.agent_id,
      contact_number: contactNumber,
      contact_name: entry?.contact_name || call.caller_name || "Unknown caller",
      fact: fact.slice(0, 400),
      source_call_id: callId,
    });
    if (rows.length >= 8) break;
  }

  if (!rows.length) return { created: [] };
  const created = await svc.entities.Memory.bulkCreate(rows);
  return { created: rows };
}