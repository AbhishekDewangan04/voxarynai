export const VOICES = ["Warm", "Professional", "Playful", "Calm"];

export const LANGUAGES = [
  "English (US)",
  "English (UK)",
  "Spanish (ES)",
  "French (FR)",
  "German (DE)",
  "Hindi (HI)",
  "Arabic (AR)",
];

export const TONES = ["Reassuring", "Direct", "Curious"];

export const PERMISSIONS = [
  { key: "book_appointments", label: "Book appointments", hint: "Create calendar events on your behalf" },
  { key: "read_contacts", label: "Read contacts", hint: "Look up who is calling" },
  { key: "send_confirmations", label: "Send confirmations", hint: "Send a confirmation after the call" },
  { key: "transfer_to_human", label: "Transfer to you", hint: "Hand the call over when it matters" },
  { key: "collect_info", label: "Collect information", hint: "Capture details like address or reason" },
  { key: "send_notifications", label: "Send notifications", hint: "Ping you when a call needs attention" },
];

export const DEFAULT_PERMISSIONS = {
  book_appointments: true,
  read_contacts: true,
  send_confirmations: true,
  transfer_to_human: false,
  collect_info: true,
  send_notifications: true,
};

const VOICE_LINE = {
  Warm: "Hey there — this is Aria, answering for Marcus. I'm really glad you called.",
  Professional: "Good afternoon, you've reached Marcus's office. This is Aria speaking.",
  Playful: "Hey hey, Aria here running Marcus's phone — what do you need?",
  Calm: "Hello. This is Aria, answering for Marcus. There's no rush at all.",
};

const TONE_LINE = {
  Reassuring: "Whatever it is, we'll take it one step at a time.",
  Direct: "Tell me exactly what you need and I'll get it sorted.",
  Curious: "I'd love to hear what's on your mind — what brings you here today?",
};

const TRANSLATED = {
  "Spanish (ES)": { text: "Hola, has llamado a la línea de Marcus. Soy Aria, ¿en qué puedo ayudarte hoy?", lang: "es-ES" },
  "French (FR)": { text: "Bonjour, vous êtes bien chez Marcus. Ici Aria, comment puis-je vous aider ?", lang: "fr-FR" },
  "German (DE)": { text: "Guten Tag, Sie erreichen Marcus. Hier spricht Aria. Wie kann ich helfen?", lang: "de-DE" },
  "Hindi (HI)": { text: "नमस्ते, यह मार्कस की लाइन है। मैं एरिया हूँ — मैं आपकी कैसे मदद कर सकती हूँ?", lang: "hi-IN" },
  "Arabic (AR)": { text: "مرحبًا، هذه خط ماركوس. أنا آريا — كيف يمكنني مساعدتك اليوم؟", lang: "ar-SA" },
};

export function buildGreeting({ voice = "Warm", tone = "Reassuring", language = "English (US)", name = "Aria" } = {}) {
  const translation = TRANSLATED[language];
  if (translation) return translation.text;
  const line = `${VOICE_LINE[voice] ?? VOICE_LINE.Warm} ${TONE_LINE[tone] ?? TONE_LINE.Reassuring}`;
  return name && name !== "Aria" ? line.replace("Aria", name) : line;
}

export function isRtl(language) {
  return language === "Arabic (AR)";
}

export function buildPersonalityPrompt(agent) {
  return [
    `${agent.voice} voice, ${agent.tone.toLowerCase()} tone, speaking ${agent.language}.`,
    agent.purpose ? `Purpose: ${agent.purpose}.` : "",
    agent.rules ? `Rules: ${agent.rules}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}