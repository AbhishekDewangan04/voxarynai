import { base44 } from "@/api/base44Client";

const AGENTS = [
  {
    name: "Aria",
    purpose: "Personal concierge — books, reschedules and screens calls",
    voice: "Warm",
    language: "English (US)",
    tone: "Reassuring",
    greeting: "Hey there — this is Aria, answering for Marcus. I'm really glad you called.",
    rules: "Never promise discounts. Offer afternoon slots first. Escalate anything about money.",
    phone_number: "+1 (415) 555-0132",
    status: "active",
    recording_enabled: false,
    permissions: {
      book_appointments: true,
      read_contacts: true,
      send_confirmations: true,
      transfer_to_human: true,
      collect_info: true,
      send_notifications: true,
    },
  },
  {
    name: "Atlas",
    purpose: "Front desk for Northside Dental — appointments and reminders",
    voice: "Professional",
    language: "English (US)",
    tone: "Direct",
    greeting: "Good afternoon, you've reached Northside Dental. This is Atlas speaking.",
    rules: "Confirm insurance before booking. Never discuss clinical results.",
    phone_number: "+1 (415) 555-0188",
    status: "active",
    recording_enabled: false,
    permissions: {
      book_appointments: true,
      read_contacts: true,
      send_confirmations: true,
      transfer_to_human: false,
      collect_info: true,
      send_notifications: true,
    },
  },
];

const CALLS = [
  { caller_name: "Priya Nair", caller_number: "+91 98200 41277", intent: "Reschedule appointment", duration: 202, sentiment: "Positive", status: "completed", summary: "Priya moved Thursday's appointment to 3:30pm and asked about last month's invoice. Confirmation sent by SMS." },
  { caller_name: "Daniel Okafor", caller_number: "+1 646 555 0148", intent: "New booking", duration: 154, sentiment: "Positive", status: "completed", summary: "Booked a first consultation for next Tuesday morning and collected insurance details." },
  { caller_name: "Mei Lin", caller_number: "+1 415 555 0192", intent: "Pricing question", duration: 96, sentiment: "Neutral", status: "completed", summary: "Asked about cleaning pricing. Atlas quoted the standard rate and offered a slot." },
  { caller_name: "Sam Whitaker", caller_number: "+1 512 555 0173", intent: "Spam / robocall", duration: 18, sentiment: "Blocked", status: "blocked", summary: "Automated sales call. Agent ended the call after two exchanges." },
  { caller_name: "Elena Rossi", caller_number: "+39 340 555 0117", intent: "Follow-up", duration: 241, sentiment: "Positive", status: "completed", summary: "Followed up on a quote, asked for a written summary and booked a review call." },
  { caller_name: "Tom Becker", caller_number: "+1 303 555 0164", intent: "Cancel appointment", duration: 118, sentiment: "Neutral", status: "completed", summary: "Cancelled Friday's appointment and asked to be reminded next month." },
  { caller_name: "Aisha Rahman", caller_number: "+971 50 555 0121", intent: "New booking", duration: 167, sentiment: "Positive", status: "completed", summary: "Booked an afternoon slot and asked for WhatsApp confirmation." },
  { caller_name: "Jonas Weber", caller_number: "+49 151 555 0189", intent: "Missed call", duration: 0, sentiment: "Neutral", status: "missed", summary: "Caller hung up before the agent answered." },
  { caller_name: "Grace Lim", caller_number: "+65 8123 4455", intent: "Hours and location", duration: 74, sentiment: "Positive", status: "completed", summary: "Asked about opening hours and parking, then booked a Thursday slot." },
  { caller_name: "Chris Nolan", caller_number: "+1 917 555 0136", intent: "Invoice query", duration: 189, sentiment: "Negative", status: "completed", summary: "Disputed an invoice line. Agent logged the details and flagged the call for a human follow-up." },
];

const TRANSCRIPTS = {
  0: [
    ["caller", "Hi, it's Priya. I need to move my appointment this week.", 0],
    ["agent", "Of course, Priya. I have Thursday at 3:30pm or 4:15pm open — which suits you?", 3400],
    ["caller", "3:30 works. Same dentist please.", 7400],
    ["agent", "Booked for Thursday at 3:30pm with Dr. Lin. I've texted you the confirmation.", 11200],
    ["caller", "Great. Can you also ask Marcus about last month's invoice?", 15600],
    ["agent", "Noted — I've flagged the invoice for Marcus and he'll follow up today.", 18900],
  ],
  1: [
    ["caller", "Hello, I'd like to book a first consultation.", 0],
    ["agent", "Happy to help. I have Tuesday at 9:15am or Wednesday at 2pm.", 3100],
    ["caller", "Tuesday morning is perfect.", 6900],
    ["agent", "Booked. I'll need your insurance provider to finish the record.", 10200],
    ["caller", "It's Blue Shield, member 8842.", 13400],
    ["agent", "All set — confirmation is on its way.", 16200],
  ],
  4: [
    ["caller", "Hi, I'm following up on the quote you sent.", 0],
    ["agent", "I can see it, Elena. Would you like a short review call with Marcus?", 3600],
    ["caller", "Yes please, and could you email me a written summary?", 8100],
    ["agent", "Both done. Review call is Friday at 11am and the summary is sent.", 12400],
  ],
  9: [
    ["caller", "This invoice is higher than what we agreed.", 0],
    ["agent", "I'm sorry about that, Chris. Let me take the details so Marcus can correct it.", 3300],
    ["caller", "It's invoice 2291, billed for two hours instead of one.", 8100],
    ["agent", "Logged and flagged as high priority. Marcus will call you back today.", 12600],
  ],
};

const TASKS = [
  { callIndex: 0, type: "booking", description: "Moved Priya Nair's appointment to Thursday 3:30pm with Dr. Lin", status: "done" },
  { callIndex: 0, type: "sms", description: "Sent booking confirmation to +91 98200 41277", status: "done" },
  { callIndex: 0, type: "notification", description: "Flagged last month's invoice for Marcus", status: "done" },
  { callIndex: 1, type: "booking", description: "Booked first consultation for Daniel Okafor, Tuesday 9:15am", status: "done" },
  { callIndex: 1, type: "info_collected", description: "Captured insurance: Blue Shield, member 8842", status: "done" },
  { callIndex: 4, type: "notification", description: "Review call scheduled with Elena Rossi, Friday 11am", status: "pending" },
  { callIndex: 9, type: "notification", description: "Invoice 2291 dispute flagged for human follow-up", status: "pending" },
  { callIndex: 6, type: "sms", description: "WhatsApp confirmation queued for Aisha Rahman", status: "done" },
];

const MEMORIES = [
  { agentIndex: 0, contact_name: "Priya Nair", contact_number: "+91 98200 41277", fact: "Prefers afternoon appointments and Dr. Lin as her dentist.", callIndex: 0 },
  { agentIndex: 0, contact_name: "Priya Nair", contact_number: "+91 98200 41277", fact: "Usually asks about invoices from the previous month.", callIndex: 0 },
  { agentIndex: 0, contact_name: "Elena Rossi", contact_number: "+39 340 555 0117", fact: "Likes a written summary after every quote.", callIndex: 4 },
  { agentIndex: 1, contact_name: "Daniel Okafor", contact_number: "+1 646 555 0148", fact: "New patient, insured with Blue Shield.", callIndex: 1 },
  { agentIndex: 1, contact_name: "Aisha Rahman", contact_number: "+971 50 555 0121", fact: "Prefers WhatsApp for appointment confirmations.", callIndex: 6 },
];

export async function loadDemoData() {
  const user = await base44.auth.me();
  const owner_id = user.id;

  const agents = await base44.entities.Agent.bulkCreate(
    AGENTS.map((agent) => ({
      ...agent,
      owner_id,
      personality_prompt: `${agent.voice} voice, ${agent.tone.toLowerCase()} tone. Purpose: ${agent.purpose}. Rules: ${agent.rules}`,
    }))
  );

  const now = Date.now();
  const calls = await base44.entities.Call.bulkCreate(
    CALLS.map((call, index) => ({
      owner_id,
      agent_id: agents[index % agents.length].id,
      caller_name: call.caller_name,
      caller_number: call.caller_number,
      intent: call.intent,
      duration_seconds: call.duration,
      sentiment: call.sentiment,
      status: call.status,
      summary: call.summary,
      started_at: new Date(now - index * 7 * 3600 * 1000 - 20 * 60 * 1000).toISOString(),
    }))
  );

  const lineRows = Object.entries(TRANSCRIPTS).flatMap(([index, lines]) => {
    const call = calls[Number(index)];
    if (!call) return [];
    return lines.map(([speaker, text, timestamp_ms]) => ({
      owner_id,
      call_id: call.id,
      speaker,
      text,
      timestamp_ms,
    }));
  });
  if (lineRows.length) await base44.entities.TranscriptLine.bulkCreate(lineRows);

  await base44.entities.Task.bulkCreate(
    TASKS.filter((task) => calls[task.callIndex]).map((task) => {
      const call = calls[task.callIndex];
      return {
        owner_id,
        call_id: call.id,
        agent_id: call.agent_id,
        type: task.type,
        description: task.description,
        status: task.status,
      };
    })
  );

  await base44.entities.Memory.bulkCreate(
    MEMORIES.filter((memory) => calls[memory.callIndex]).map((memory) => {
      const call = calls[memory.callIndex];
      return {
        owner_id,
        agent_id: agents[memory.agentIndex].id,
        contact_name: memory.contact_name,
        contact_number: memory.contact_number,
        fact: memory.fact,
        source_call_id: call.id,
      };
    })
  );

  return { agents: agents.length, calls: calls.length };
}