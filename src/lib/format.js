export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes ? `${minutes}m ${String(rest).padStart(2, "0")}s` : `${rest}s`;
}

export function formatWhen(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function formatStamp(ms) {
  const total = Math.max(0, Math.round((Number(ms) || 0) / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export const SENTIMENT_STYLES = {
  Positive: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  Neutral: "border-white/15 bg-white/[0.06] text-white/60",
  Negative: "border-amber-300/25 bg-amber-400/10 text-amber-200",
  Blocked: "border-rose-300/25 bg-rose-400/10 text-rose-200",
};

export const STATUS_STYLES = {
  live: "border-cyan-300/30 bg-cyan-400/10 text-cyan-200",
  completed: "border-white/15 bg-white/[0.06] text-white/60",
  missed: "border-amber-300/25 bg-amber-400/10 text-amber-200",
  blocked: "border-rose-300/25 bg-rose-400/10 text-rose-200",
};

export const TASK_TYPE_LABELS = {
  booking: "Booking",
  sms: "SMS",
  info_collected: "Info",
  notification: "Notification",
};

export const TASK_STATUS_STYLES = {
  done: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  pending: "border-amber-300/25 bg-amber-400/10 text-amber-200",
  failed: "border-rose-300/25 bg-rose-400/10 text-rose-200",
};