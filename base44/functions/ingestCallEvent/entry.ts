import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { webhookSecretOk, runSummarize, runExtractMemories } from '../../shared/callIntelligence.ts';

const EVENTS = ['call_started', 'transcript_line', 'call_ended'];

export default async function (req) {
  try {
    if (!webhookSecretOk(req)) {
      return Response.json({ error: 'Invalid webhook secret.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const event = String(body?.event ?? '');
    if (!EVENTS.includes(event)) {
      return Response.json({ error: 'Unsupported event type.' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    if (event === 'call_started') {
      const agentId = String(body?.agent_id ?? '');
      if (!agentId) return Response.json({ error: 'agent_id is required.' }, { status: 400 });

      const agent = await svc.entities.Agent.get(agentId).catch((error) =>
        error.status === 404 ? null : Promise.reject(error)
      );
      if (!agent) return Response.json({ error: 'Agent not found.' }, { status: 404 });
      if (agent.status === 'paused') {
        return Response.json({ error: 'Agent is paused.' }, { status: 409 });
      }

      const call = await svc.entities.Call.create({
        owner_id: agent.owner_id || agent.created_by_id,
        agent_id: agentId,
        caller_name: String(body?.caller_name ?? 'Unknown caller').slice(0, 120),
        caller_number: String(body?.caller_number ?? 'unknown').slice(0, 40),
        status: 'live',
        sentiment: 'Neutral',
        started_at: new Date().toISOString(),
        duration_seconds: 0,
      });
      return Response.json({ ok: true, call_id: call.id });
    }

    const callId = String(body?.call_id ?? '');
    if (!callId) return Response.json({ error: 'call_id is required.' }, { status: 400 });

    const call = await svc.entities.Call.get(callId).catch((error) =>
      error.status === 404 ? null : Promise.reject(error)
    );
    if (!call) return Response.json({ error: 'Call not found.' }, { status: 404 });

    if (event === 'transcript_line') {
      const text = String(body?.text ?? '').trim().slice(0, 4000);
      if (!text) return Response.json({ error: 'text is required.' }, { status: 400 });

      await svc.entities.TranscriptLine.create({
        owner_id: call.owner_id,
        call_id: callId,
        speaker: body?.speaker === 'agent' ? 'agent' : 'caller',
        text,
        timestamp_ms: Number(body?.timestamp_ms) || 0,
      });
      return Response.json({ ok: true });
    }

    // call_ended
    const status = body?.status === 'blocked' ? 'blocked' : body?.status === 'missed' ? 'missed' : 'completed';
    const duration = Math.max(0, Math.round(Number(body?.duration_seconds) || 0));
    await svc.entities.Call.update(callId, duration ? { status, duration_seconds: duration } : { status });

    const summary = await runSummarize(base44, callId).catch((error) => ({ error: error.message }));
    const memories = await runExtractMemories(base44, callId).catch((error) => ({ error: error.message }));

    return Response.json({ ok: true, summary, memories });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}