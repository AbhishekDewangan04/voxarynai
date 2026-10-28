import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { webhookSecretOk } from '../../shared/callIntelligence.ts';

// Called by the external voice server at the start of every call.
export default async function (req) {
  try {
    if (!webhookSecretOk(req)) {
      return Response.json({ error: 'Invalid webhook secret.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const agentId = String(body?.agent_id ?? '');
    const contactNumber = String(body?.contact_number ?? '').slice(0, 40);
    if (!agentId) return Response.json({ error: 'agent_id is required.' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const agent = await svc.entities.Agent.get(agentId).catch((error) =>
      error.status === 404 ? null : Promise.reject(error)
    );
    if (!agent) return Response.json({ error: 'Agent not found.' }, { status: 404 });

    const memoryPage = contactNumber
      ? await svc.entities.Memory.filter(
          { agent_id: agentId, contact_number: contactNumber },
          { sort: '-created_date', limit: 50 }
        )
      : { items: [] };

    return Response.json({
      ok: true,
      agent: {
        id: agent.id,
        name: agent.name,
        purpose: agent.purpose ?? '',
        voice: agent.voice ?? 'Warm',
        language: agent.language ?? 'English (US)',
        tone: agent.tone ?? 'Reassuring',
        greeting: agent.greeting ?? '',
        rules: agent.rules ?? '',
        personality_prompt: agent.personality_prompt ?? '',
        permissions: agent.permissions ?? {},
        recording_enabled: agent.recording_enabled === true,
        status: agent.status ?? 'active',
      },
      memories: (memoryPage?.items ?? []).map((memory) => ({
        fact: memory.fact,
        contact_name: memory.contact_name ?? '',
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}