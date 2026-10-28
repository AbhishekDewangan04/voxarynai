# Voxaryn voice server

A small Node service that connects a Twilio phone number to the Voxaryn AI agent
in your Base44 app. It handles Twilio Media Streams, bridges audio to the OpenAI
Realtime API, and reports every call back to Base44.

```
Caller → Twilio number → POST /voice/incoming (TwiML)
                       → wss://…/media-stream (audio in/out)
                       ↔ OpenAI Realtime (speech + tool calls)
                       → Base44: call_started · transcript_line · call_ended
                                 → summarizeCall · extractMemories
```

## What it does

1. **`POST /voice/incoming`** validates the Twilio signature and answers with
   TwiML that opens a bidirectional Media Stream.
2. On stream start it calls **`getAgentContext`** on Base44 to load the agent's
   personality and every stored memory for the caller's number.
3. Audio is bridged to the **OpenAI Realtime API**. The session instructions are
   built from the agent's voice, tone, language, purpose, rules and memories, and
   the agent opens with its saved greeting. Server VAD handles **barge-in**: when
   the caller speaks, queued assistant audio is cleared immediately.
4. **AI tools are gated by the agent's permissions** — and re-checked inside the
   tool handler, so a model can never call a tool it wasn't granted:

   | Tool | Requires permission |
   | --- | --- |
   | `book_appointment` (Google Calendar) | `book_appointments` |
   | `collect_info` | `collect_info` |
   | `send_sms` (Twilio) | `send_confirmations` |
   | `transfer_to_human` | `transfer_to_human` |

5. Each turn is reported with **`ingestCallEvent`** (`call_started`,
   `transcript_line`, `call_ended`). On `call_ended`, Base44 runs `summarizeCall`
   and `extractMemories`, so the next call from the same number greets the caller
   with what the agent remembers.
6. **`GET /health`** returns `{ ok, uptime, missingEnv }` for platform health checks.
7. **No audio is stored.** Nothing is written to disk and no recording is
   requested from Twilio, whatever the agent's `recording_enabled` flag says. If
   the AI connection fails at any point the caller hears a short fallback message
   and the call is closed.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `BASE44_API_URL` | yes | Base URL of the app's functions, e.g. `https://your-app.base44.app/functions` |
| `VOXARYN_WEBHOOK_SECRET` | yes | Must equal the app secret `VOXARYN_WEBHOOK_SECRET` (Dashboard → Secrets) |
| `OPENAI_API_KEY` | yes | Realtime API key |
| `TWILIO_ACCOUNT_SID` | yes* | Twilio account (needed for SMS + transfer) |
| `TWILIO_AUTH_TOKEN` | yes | Twilio auth token — also used to validate webhook signatures |
| `TWILIO_PHONE_NUMBER` | yes* | The number SMS confirmations are sent from |
| `TWILIO_HANDOFF_NUMBER` | no | Where `transfer_to_human` rings |
| `AGENT_ID` | yes* | Which agent answers this number |
| `AGENT_ROUTES` | no | Multi-number routing, `"+1415…:agentId1,+1415…:agentId2"` |
| `GOOGLE_CALENDAR_ACCESS_TOKEN` | no | Enables `book_appointment`; without it the tool reports `calendar_not_connected` |
| `GOOGLE_CALENDAR_ID` | no | Calendar to write to (default `primary`) |
| `OPENAI_REALTIME_MODEL` | no | Default `gpt-4o-realtime-preview` |
| `PORT` | no | Default `8080` (Render/Railway set this for you) |
| `PUBLIC_URL` | no | Public https URL of the service |

\* required for the features noted; the server boots without them and `/health`
lists what is missing.

## Run locally

```bash
cd voice-server
npm install
cp .env.example .env      # fill in the values
npm start                 # http://localhost:8080/health
```

Twilio cannot reach `localhost`, so for a real call expose the port with
`ngrok http 8080` and use the https URL below.

## Deploy on Render

1. New → **Web Service**, connect the repo that contains `voice-server/`.
2. Root directory `voice-server`, build `npm install`, start `npm start`.
3. Add every variable from `.env.example` in the service's Environment tab.
4. Deploy and confirm `https://<service>.onrender.com/health` returns `ok: true`.

## Deploy on Railway

1. New Project → **Deploy from GitHub repo**, set the root directory to `voice-server`.
2. Railway detects Node and runs `npm start`.
3. Add the same environment variables, then generate a public domain.

## Point Twilio at it

1. Twilio Console → **Phone Numbers → your number → Voice configuration**.
2. **A call comes in** → **Webhook**, `https://<your-service-host>/voice/incoming`, method **HTTP POST**.
3. Keep the number's voice settings on the default; the TwiML from this server
   controls the stream.
4. Call the number. In Base44, the call appears under **Dashboard → Calls**, and
   the transcript, summary and tasks land a few seconds after you hang up.

## Connecting back to Base44

Create the shared secret in **Dashboard → Secrets** as `VOXARYN_WEBHOOK_SECRET`
(e.g. `openssl rand -hex 32`) and use the same value in this service's `.env`.
The functions `ingestCallEvent` and `getAgentContext` reject any request without
the matching `x-voxaryn-secret` header.

## Swapping in ElevenLabs

`markElevenLabs()` in `server.js` marks the exact spot: ask the Realtime session
for text output (`modalities: ['text']`), stream `response.text.delta` to an
ElevenLabs TTS socket, and forward the returned mu-law frames to Twilio with the
same `sendAudio()` helper used for OpenAI audio.
