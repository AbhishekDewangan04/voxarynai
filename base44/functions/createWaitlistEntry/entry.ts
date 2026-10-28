import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Public endpoint: the landing-page waitlist form calls this.
export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? '').trim().toLowerCase();
    const source = String(body?.source ?? 'home').slice(0, 40);

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const existing = await base44.asServiceRole.entities.WaitlistEntry.filter({ email }, { limit: 1 });
    const alreadyJoined = (existing?.items ?? []).length > 0;

    if (!alreadyJoined) {
      await base44.asServiceRole.entities.WaitlistEntry.create({ email, source });
    }

    return Response.json({
      ok: true,
      alreadyJoined,
      message: alreadyJoined
        ? "You're already on the list — we'll email your invite soon."
        : "You're on the list.",
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}