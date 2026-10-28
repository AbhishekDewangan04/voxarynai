import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { runSummarize, webhookSecretOk } from '../../shared/callIntelligence.ts';

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const callId = String(body?.call_id ?? '');
    if (!callId) return Response.json({ error: 'call_id is required.' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const call = await base44.asServiceRole.entities.Call.get(callId).catch((error) =>
      error.status === 404 ? null : Promise.reject(error)
    );
    if (!call) return Response.json({ error: 'Call not found.' }, { status: 404 });

    const user = await base44.auth.me().catch((error) => (error.status === 401 ? null : Promise.reject(error)));
    const isOwner = user && (call.owner_id === user.id || call.created_by_id === user.id);
    if (!isOwner && !webhookSecretOk(req)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runSummarize(base44, callId);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}