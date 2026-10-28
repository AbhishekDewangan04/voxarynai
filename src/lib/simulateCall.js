import { base44 } from "@/api/base44Client";

const CALLER = { name: "Priya Nair", number: "+91 98200 41277" };
const LINE_INTERVAL_MS = 2000;

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function buildDialogue(agent, memories) {
  const permissions = agent.permissions || {};
  const canBook = permissions.book_appointments === true;
  const known = memories[0]?.fact;

  return [
    { speaker: "caller", text: "Hi, it's Priya. I need to move my appointment this week." },
    {
      speaker: "agent",
      text: known
        ? `Welcome back, Priya — I still have your note here: ${known} Shall I use that when I rebook you?`
        : `Hi Priya, this is ${agent.name} answering for Marcus. Happy to move that for you.`,
    },
    { speaker: "caller", text: "Yes please — Thursday if you have anything." },
    {
      speaker: "agent",
      text: canBook
        ? "I have Thursday at 3:30pm and 4:15pm open. Which suits you?"
        : "I can't book on my own, so I'll note Thursday and have Marcus confirm with you.",
    },
    { speaker: "caller", text: "3:30 works. Same dentist please." },
    {
      speaker: "agent",
      text: canBook
        ? "Booked for Thursday at 3:30pm with Dr. Lin. I've texted you the confirmation."
        : "Noted. Marcus will confirm the slot by text shortly.",
    },
    { speaker: "caller", text: "Thanks. Can you also ask him about last month's invoice?" },
    { speaker: "agent", text: "Noted — I've flagged last month's invoice for Marcus so he can look at it today." },
    { speaker: "caller", text: "Perfect, that's everything." },
    { speaker: "agent", text: `Happy to help, Priya. ${agent.name} will be here if you need anything else.` },
  ];
}

export async function simulateIncomingCall({ agent }) {
  const user = await base44.auth.me();
  const owner_id = user.id;

  const memoryPage = await base44.entities.Memory.filter(
    { agent_id: agent.id, contact_number: CALLER.number },
    { sort: "-created_date", limit: 3 }
  );
  const memories = memoryPage?.items ?? [];

  const call = await base44.entities.Call.create({
    owner_id,
    agent_id: agent.id,
    caller_name: CALLER.name,
    caller_number: CALLER.number,
    status: "live",
    sentiment: "Neutral",
    started_at: new Date().toISOString(),
    duration_seconds: 0,
  });

  const dialogue = buildDialogue(agent, memories);
  let elapsed = 0;

  for (const line of dialogue) {
    await sleep(LINE_INTERVAL_MS);
    elapsed += LINE_INTERVAL_MS;
    await base44.entities.TranscriptLine.create({
      owner_id,
      call_id: call.id,
      speaker: line.speaker,
      text: line.text,
      timestamp_ms: elapsed,
    });
  }

  await base44.entities.Call.update(call.id, {
    status: "completed",
    duration_seconds: Math.round(elapsed / 1000),
  });

  const summary = await base44.functions.invoke("summarizeCall", { call_id: call.id });
  const memory = await base44.functions.invoke("extractMemories", { call_id: call.id });

  return {
    callId: call.id,
    usedMemory: memories.length > 0,
    summary: summary?.data ?? null,
    memories: memory?.data?.created ?? [],
  };
}