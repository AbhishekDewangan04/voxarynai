/**
 * Voxaryn voice server
 * -------------------------------------------------------------
 * Twilio number  ->  POST /voice/incoming   (TwiML, opens a Media Stream)
 * Media Stream   ->  wss://.../media-stream (audio bridge)
 * OpenAI Realtime <-> Twilio                (speech in, speech out)
 * Base44         <-  call_started / transcript_line / call_ended webhooks
 *
 * Nothing about the call is written to disk. Audio is never recorded here;
 * the agent's `recording_enabled` flag is reported to Base44 but this server
 * does not persist audio under any setting.
 */

import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import twilio from 'twilio';
import { WebSocketServer, WebSocket } from 'ws';

const {
  BASE44_API_URL,
  VOXARYN_WEBHOOK_SECRET,
  OPENAI_API_KEY,
  OPENAI_REALTIME_MODEL = 'gpt-4o-realtime-preview',
  OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime',
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  TWILIO_HANDOFF_NUMBER,
  AGENT_ID,
  AGENT_ROUTES,
  GOOGLE_CALENDAR_ACCESS_TOKEN,
  GOOGLE_CALENDAR_ID = 'primary',
  PORT = 8080,
} = process.env;

const FALLBACK_MESSAGE =
  "Sorry, our AI assistant can't take this call right now. Please try again in a moment.";

const log = (level, message, meta = {}) => {
  if (level === 'debug' && process.env.LOG_LEVEL !== 'debug') return;
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, message, ...meta }));
};

const twilioClient =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

function missingEnv() {
  return ['BASE44_API_URL', 'VOXARYN_WEBHOOK_SECRET', 'OPENAI_API_KEY', 'TWILIO_AUTH_TOKEN'].filter(
    (name) => !process.env[name]
  );
}

/* ------------------------------------------------------------------ Base44 */

async function callBase44(name, body) {
  const res = await fetch(`${BASE44_API_URL.replace(/\/$/, '')}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-voxaryn-secret': VOXARYN_WEBHOOK_SECRET },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${name} responded ${res.status}: ${text.slice(0, 200)}`);
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function ingest(event) {
  return callBase44('ingestCallEvent', event).catch((error) => {
    log('error', 'ingestCallEvent failed', { event: event.event, error: error.message });
    return null;
  });
}

/* ------------------------------------------------------- agent + personality */

function resolveAgentId(to) {
  if (AGENT_ROUTES) {
    for (const pair of AGENT_ROUTES.split(',')) {
      const [number, agentId] = pair.split(':').map((value) => (value || '').trim());
      if (!number || !agentId) continue;
      const digits = (value) => (value || '').replace(/\D/g, '').slice(-10);
      if (number === to || digits(number) === digits(to)) return agentId;
    }
  }
  return AGENT_ID || null;
}

function buildInstructions(agent, memories) {
  const permissions = agent.permissions || {};
  const lines = [
    `You are ${agent.name}, a voice assistant answering a real phone call for the account owner.`,
    agent.purpose ? `Your purpose: ${agent.purpose}.` : '',
    `Speak in ${agent.language} with a ${String(agent.voice).toLowerCase()} voice and a ${String(agent.tone).toLowerCase()} tone.`,
    agent.personality_prompt ? `Personality: ${agent.personality_prompt}` : '',
    agent.rules ? `Hard rules you must never break: ${agent.rules}` : '',
    'Keep every reply under three sentences. Never invent prices, availability or medical advice.',
  ];

  lines.push('What you may do on this call:');
  lines.push(
    permissions.book_appointments
      ? '- Book appointments with the book_appointment tool.'
      : '- You cannot book appointments. Offer to have the owner call back.'
  );
  lines.push(permissions.collect_info ? '- Collect and record caller details with collect_info.' : '- Do not collect personal details.');
  lines.push(permissions.send_confirmations ? '- Send confirmations with send_sms.' : '- Do not send SMS confirmations.');
  lines.push(
    permissions.transfer_to_human
      ? '- Transfer to a human with transfer_to_human when the caller asks, or when the request is sensitive.'
      : '- You cannot transfer calls. Apologise and promise a callback instead.'
  );

  if (memories.length) {
    lines.push('Facts you already know about this caller — use them naturally, never read the list aloud:');
    memories.forEach((memory) => lines.push(`- ${memory.fact}`));
  } else {
    lines.push('You have no stored history with this caller.');
  }

  return lines.filter(Boolean).join('\n');
}

function buildTools(agent) {
  const permissions = agent.permissions || {};
  const tools = [];

  if (permissions.book_appointments) {
    tools.push({
      type: 'function',
      name: 'book_appointment',
      description: 'Book an appointment in the owner calendar.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short appointment title' },
          start_time: { type: 'string', description: 'ISO 8601 start date-time' },
          duration_minutes: { type: 'integer', description: 'Length in minutes' },
          attendee_name: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['start_time'],
      },
    });
  }

  if (permissions.collect_info) {
    tools.push({
      type: 'function',
      name: 'collect_info',
      description: 'Record a piece of information the caller shared.',
      parameters: {
        type: 'object',
        properties: {
          field: { type: 'string', description: 'e.g. email, address, reason_for_call' },
          value: { type: 'string' },
        },
        required: ['field', 'value'],
      },
    });
  }

  if (permissions.send_confirmations) {
    tools.push({
      type: 'function',
      name: 'send_sms',
      description: 'Send a confirmation SMS to the caller.',
      parameters: {
        type: 'object',
        properties: { body: { type: 'string' } },
        required: ['body'],
      },
    });
  }

  if (permissions.transfer_to_human) {
    tools.push({
      type: 'function',
      name: 'transfer_to_human',
      description: 'Transfer the live call to the owner.',
      parameters: {
        type: 'object',
        properties: { reason: { type: 'string' } },
        required: [],
      },
    });
  }

  return tools;
}

/* ----------------------------------------------------------------- Twilio */

function publicUrl(req) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}${req.originalUrl}`;
}

async function sendFallbackTwiml(callSid, message = FALLBACK_MESSAGE) {
  if (!twilioClient || !callSid) return;
  const twiml = `<Response><Say voice="Polly.Joanna">${message}</Say><Hangup/></Response>`;
  try {
    await twilioClient.calls(callSid).update({ twiml });
    log('warn', 'fallback TwiML applied', { callSid });
  } catch (error) {
    log('error', 'could not apply fallback TwiML', { callSid, error: error.message });
  }
}

/* ------------------------------------------------------------ HTTP server */

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '256kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()), missingEnv: missingEnv() });
});

app.post('/voice/incoming', (req, res) => {
  const signature = req.headers['x-twilio-signature'];
  const url = publicUrl(req);

  if (!TWILIO_AUTH_TOKEN || !signature || !twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, url, req.body)) {
    log('warn', 'rejected request with invalid Twilio signature', { url });
    return res.status(403).type('text/plain').send('Invalid Twilio signature');
  }

  const to = req.body.To || '';
  const agentId = resolveAgentId(to);
  if (!agentId) {
    log('error', 'no agent mapped to this number', { to });
    return res
      .type('text/xml')
      .send(new twilio.twiml.VoiceResponse().say('This number is not configured yet.').toString());
  }

  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0];
  const proto = req.headers['x-forwarded-proto'] === 'http' ? 'ws' : 'wss';

  const response = new twilio.twiml.VoiceResponse();
  const connect = response.connect();
  const stream = connect.stream({ url: `${proto}://${host}/media-stream` });
  stream.parameter({ name: 'agent_id', value: agentId });
  stream.parameter({ name: 'caller_number', value: req.body.From || 'unknown' });
  stream.parameter({ name: 'caller_name', value: req.body.CallerName || '' });

  log('info', 'inbound call', { to, from: req.body.From, agentId, callSid: req.body.CallSid });
  return res.type('text/xml').send(response.toString());
});

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url, 'http://localhost');
  if (pathname !== '/media-stream') {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
});

/**
 * ElevenLabs swap-in point.
 * This build uses the OpenAI Realtime voice. To use ElevenLabs speech:
 *   1. Set the Realtime session to text-only output (response.modalities = ['text']).
 *   2. On 'response.text.delta', stream the text to ElevenLabs' WebSocket TTS.
 *   3. Send the returned mu-law frames to Twilio exactly like audio deltas below.
 * Nothing else in this file changes.
 */
function markElevenLabs() {}

/* -------------------------------------------------------- media stream */

wss.on('connection', (twilioWs) => {
  const session = {
    streamSid: null,
    callSid: null,
    callId: null,
    agent: null,
    memories: [],
    callerNumber: 'unknown',
    startedAt: Date.now(),
    openai: null,
    ended: false,
    collected: {},
  };

  const sendAudio = (payload) => {
    if (twilioWs.readyState === WebSocket.OPEN && session.streamSid) {
      twilioWs.send(JSON.stringify({ event: 'media', streamSid: session.streamSid, media: { payload } }));
    }
  };

  const clearAudio = () => {
    if (twilioWs.readyState === WebSocket.OPEN && session.streamSid) {
      twilioWs.send(JSON.stringify({ event: 'clear', streamSid: session.streamSid }));
    }
  };

  const pushTranscript = (speaker, text) => {
    if (!session.callId || !text) return;
    ingest({
      event: 'transcript_line',
      call_id: session.callId,
      speaker,
      text,
      timestamp_ms: Date.now() - session.startedAt,
    });
  };

  const endCall = async (status = 'completed') => {
    if (session.ended) return;
    session.ended = true;
    try {
      if (session.openai && session.openai.readyState === WebSocket.OPEN) session.openai.close();
    } catch {
      /* ignore */
    }
    if (session.callId) {
      await ingest({
        event: 'call_ended',
        call_id: session.callId,
        status,
        duration_seconds: Math.round((Date.now() - session.startedAt) / 1000),
      });
    }
    log('info', 'call ended', { callSid: session.callSid, duration: Math.round((Date.now() - session.startedAt) / 1000) });
  };

  const runTool = async (name, args) => {
    const permissions = session.agent?.permissions || {};

    // Permissions are enforced here as well as in the model instructions.
    if (name === 'book_appointment') {
      if (!permissions.book_appointments) return { ok: false, error: 'not_permitted' };
      if (!GOOGLE_CALENDAR_ACCESS_TOKEN) return { ok: false, error: 'calendar_not_connected' };
      const start = new Date(args.start_time || Date.now() + 3600_000);
      const end = new Date(start.getTime() + (Number(args.duration_minutes) || 30) * 60_000);
      try {
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${GOOGLE_CALENDAR_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              summary: args.title || 'Call booking',
              description: [args.notes, session.callerNumber && `Caller: ${session.callerNumber}`]
                .filter(Boolean)
                .join('\n'),
              start: { dateTime: start.toISOString() },
              end: { dateTime: end.toISOString() },
            }),
            signal: AbortSignal.timeout(10000),
          }
        );
        if (!res.ok) return { ok: false, error: `calendar_error_${res.status}` };
        const event = await res.json();
        return { ok: true, event_id: event.id, start: start.toISOString() };
      } catch (error) {
        log('error', 'book_appointment failed', { error: error.message });
        return { ok: false, error: 'calendar_unavailable' };
      }
    }

    if (name === 'collect_info') {
      if (!permissions.collect_info) return { ok: false, error: 'not_permitted' };
      session.collected[args.field] = args.value;
      return { ok: true, recorded: args.field };
    }

    if (name === 'send_sms') {
      if (!permissions.send_confirmations) return { ok: false, error: 'not_permitted' };
      if (!twilioClient || !TWILIO_PHONE_NUMBER) return { ok: false, error: 'sms_not_configured' };
      try {
        await twilioClient.messages.create({
          to: session.callerNumber,
          from: TWILIO_PHONE_NUMBER,
          body: String(args.body || 'Confirmed. Thank you!').slice(0, 300),
        });
        return { ok: true };
      } catch (error) {
        log('error', 'send_sms failed', { error: error.message });
        return { ok: false, error: 'sms_failed' };
      }
    }

    if (name === 'transfer_to_human') {
      if (!permissions.transfer_to_human) return { ok: false, error: 'not_permitted' };
      if (!TWILIO_HANDOFF_NUMBER || !twilioClient || !session.callSid) return { ok: false, error: 'handoff_not_configured' };
      await twilioClient.calls(session.callSid).update({
        twiml: `<Response><Say voice="Polly.Joanna">Connecting you now.</Say><Dial>${TWILIO_HANDOFF_NUMBER}</Dial></Response>`,
      });
      await endCall('completed');
      return { ok: true, transferring: true };
    }

    return { ok: false, error: 'unknown_tool' };
  };

  const connectRealtime = () => {
    const url = `${OPENAI_REALTIME_URL}?model=${encodeURIComponent(OPENAI_REALTIME_MODEL)}`;
    const ws = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });
    session.openai = ws;

    const fail = async (reason) => {
      log('error', 'realtime connection problem', { reason, callSid: session.callSid });
      await sendFallbackTwiml(session.callSid);
      await endCall('missed');
    };

    const timeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) fail('connect_timeout');
    }, 10000);

    ws.on('open', () => {
      clearTimeout(timeout);
      log('info', 'realtime connected', { callSid: session.callSid });

      ws.send(
        JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['audio', 'text'],
            instructions: buildInstructions(session.agent, session.memories),
            voice: 'alloy',
            input_audio_format: 'g711_ulaw',
            output_audio_format: 'g711_ulaw',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: { type: 'server_vad', threshold: 0.5, silence_duration_ms: 500 },
            tools: buildTools(session.agent),
            tool_choice: 'auto',
          },
        })
      );

      const greeting =
        session.agent.greeting ||
        `Hi, this is ${session.agent.name}. How can I help you today?`;

      ws.send(
        JSON.stringify({
          type: 'response.create',
          response: { instructions: `Greet the caller by saying exactly: "${greeting}"` },
        })
      );
    });

    ws.on('message', async (raw) => {
      let event;
      try {
        event = JSON.parse(raw.toString());
      } catch {
        return;
      }

      switch (event.type) {
        case 'response.audio.delta':
          sendAudio(event.delta);
          break;
        case 'input_audio_buffer.speech_started':
          // Barge-in: the caller started talking, drop the queued assistant audio.
          clearAudio();
          break;
        case 'conversation.item.input_audio_transcription.completed':
          pushTranscript('caller', event.transcript);
          break;
        case 'response.audio_transcript.done':
          pushTranscript('agent', event.transcript);
          break;
        case 'response.function_call_arguments.done': {
          let args = {};
          try {
            args = JSON.parse(event.arguments || '{}');
          } catch {
            args = {};
          }
          const result = await runTool(event.name, args);
          ws.send(
            JSON.stringify({
              type: 'conversation.item.create',
              item: { type: 'function_call_output', call_id: event.call_id, output: JSON.stringify(result) },
            })
          );
          ws.send(JSON.stringify({ type: 'response.create' }));
          break;
        }
        case 'error':
          log('error', 'realtime error', { error: event.error?.message || 'unknown' });
          break;
        default:
          log('debug', 'realtime event', { type: event.type });
      }
    });

    ws.on('close', () => {
      clearTimeout(timeout);
      log('info', 'realtime closed', { callSid: session.callSid });
      if (!session.ended) endCall('completed');
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      log('error', 'realtime socket error', { error: error.message });
      fail('socket_error');
    });
  };

  twilioWs.on('message', async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.event === 'start') {
      session.streamSid = msg.start.streamSid;
      session.callSid = msg.start.callSid;
      const params = msg.start.customParameters || {};
      session.callerNumber = params.caller_number || 'unknown';

      try {
        const context = await callBase44('getAgentContext', {
          agent_id: params.agent_id,
          contact_number: session.callerNumber,
        });
        session.agent = context.agent;
        session.memories = context.memories || [];
      } catch (error) {
        log('error', 'could not load agent context', { error: error.message });
        await sendFallbackTwiml(session.callSid);
        return;
      }

      if (session.agent.recording_enabled) {
        log('info', 'agent has recording enabled server-side; this service never stores audio', {
          agentId: session.agent.id,
        });
      }

      const started = await ingest({
        event: 'call_started',
        agent_id: session.agent.id,
        caller_number: session.callerNumber,
        caller_name: params.caller_name || '',
      });
      session.callId = started?.call_id || null;

      connectRealtime();
      return;
    }

    if (msg.event === 'media' && session.openai?.readyState === WebSocket.OPEN) {
      session.openai.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: msg.media.payload }));
      return;
    }

    if (msg.event === 'stop') {
      await endCall('completed');
    }
  });

  twilioWs.on('close', () => {
    endCall('completed');
  });

  twilioWs.on('error', (error) => {
    log('error', 'twilio stream error', { error: error.message });
  });
});

server.listen(PORT, () => {
  const missing = missingEnv();
  log('info', 'voxaryn voice server listening', { port: Number(PORT), missing });
  markElevenLabs();
});
