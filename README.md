# JARVIS by Pratham

A cinematic, always-breathing voice-command interface and an implementation plan for turning it into a private personal assistant. The current app is a safe frontend prototype: voice transcription works in supported browsers, while consequential actions are deliberately simulated until their services are connected.

## Run it

```bash
npm install
npm run dev
```

## What the reference can—and cannot—give us

The supplied IRIS link is useful as a **visual/product reference**, but a deployed frontend cannot reveal its private backend, prompts, OAuth credentials, or automation rules. This project therefore uses an original sci-fi HUD rather than copying proprietary assets. At review time the URL returned an access error from this environment, so no source code or assets were taken from it.

## Build the real assistant: a practical roadmap

### 1. Install the foundation (week 1)

- **Developer tools:** Git, GitHub account, Node.js 22 LTS, Python 3.12+, VS Code, Docker Desktop, and a password manager.
- **Desktop shell:** Tauri 2 (recommended) wraps this React UI with a small Rust process. Electron is easier if the team only knows JavaScript, but is heavier.
- **Local service:** FastAPI (Python) owns tools, scheduled jobs, memory, and OS diagnostics. Bind it to `127.0.0.1`, never directly to the public internet.
- **Database:** SQLite for local preferences/action history; PostgreSQL later if several devices need synchronized state.
- **Secrets:** OS Keychain/Credential Manager via Tauri's secure-store plugin. Never put OAuth tokens or API keys in the browser, Git, prompts, or SQLite plaintext.

### 2. Build the voice loop (week 1–2)

1. Use **Picovoice Porcupine** or **openWakeWord** locally for “Hey JARVIS.” Add a physical/software mute control and a visible listening state.
2. Use **Whisper** locally (`whisper.cpp`) for maximum privacy, or an approved cloud transcription API for speed and accuracy.
3. Send the transcript to an LLM orchestrator. Give the model a small allow-list of typed tools rather than shell access.
4. Use **Piper** locally or a licensed cloud TTS voice for speech. Do not clone an actor's voice without consent. Stream audio so replies begin quickly.
5. Add voice-activity detection, interruption (“barge in”), timeouts, and a chime. Store audio only when the user explicitly opts in.

Browser speech recognition in this prototype is only a convenience demo; reliable wake-word operation requires the installed desktop companion.

### 3. Add a safe agent/tool layer (week 2–3)

Each integration should be a narrowly scoped function with validated parameters, for example `draft_email(to, subject, body)` and `create_repo(name, visibility)`. Divide actions into:

- **Read-only:** calendar lookup, system health, business dashboard. Can run immediately.
- **Reversible:** create a draft, open an app, create an issue. Show what happened and support undo.
- **Consequential:** send, delete, publish, pay, or change permissions. Always show a confirmation card with exact recipients/content. Require a click or short-lived PIN—never accept voice-only approval for payments or credential changes.

Keep an append-only audit log (tool, parameters with secrets redacted, result, timestamp, approval identity). Add per-tool rate limits, recipient allow-lists, and a global kill switch.

### 4. Connect communication (week 3)

#### Gmail / Outlook

1. Create a Google Cloud project and enable the Gmail API, or register a Microsoft Entra app and use Microsoft Graph.
2. Configure OAuth 2.0 Authorization Code + PKCE and request the smallest scopes. Start with creating drafts; request send scope only when needed.
3. The backend exchanges and refreshes tokens; encrypted refresh tokens stay in the OS keychain.
4. Render the exact recipient, subject, and body for approval before `send`.

#### WhatsApp

Use the official **WhatsApp Business Platform Cloud API** through a Meta developer/business account. It is designed for business numbers and uses approved templates outside the customer-service window. It does not provide a general supported API for silently controlling a personal WhatsApp account. Avoid browser automation or unofficial libraries: they are brittle, can expose messages, and may get the account banned. For a personal assistant, open a pre-filled `wa.me` compose link and let the user press Send; use Cloud API only for a legitimate business number.

### 5. Add computer control and system reports (week 3–4)

- Collect diagnostics through a local, read-only service using `psutil` (CPU, memory, disk, battery, network counters) and platform APIs. Redact usernames, IPs, serial numbers, environment variables, and process arguments before sending anything to a model.
- Automate approved workflows with Tauri commands and OS-native automation: Shortcuts/AppleScript on macOS, PowerShell/WinAppDriver on Windows, and DBus on Linux.
- Never expose arbitrary `exec(command)`. Create allow-listed operations such as `open_application`, `create_folder`, and `get_disk_usage`; validate paths and confine project creation to a workspace directory.

### 6. Create complete GitHub projects (week 4)

1. Install the GitHub CLI and authenticate with a fine-grained token or, preferably, a GitHub App limited to selected repositories.
2. Ask JARVIS for a project brief, stack, visibility, license, and target folder.
3. Generate into a temporary directory; run formatter, tests, dependency audit, and secret scan.
4. Present the file tree and diff for approval. Only then initialize Git, commit, create the remote, and push.
5. Use branch protection and pull requests. Never let generated code push directly to a protected production branch.

### 7. Business updates (week 4–5)

- Define the exact sources of truth: Stripe, Shopify, HubSpot, QuickBooks/Xero, Google Analytics, ads, support desk, and selected spreadsheets.
- Prefer each vendor's official read-only API. Normalize daily facts into PostgreSQL, then calculate KPIs in deterministic code—not in the LLM.
- Schedule collection with APScheduler/Celery locally or a managed scheduler. Let the model summarize already-calculated metrics and link every claim to its source record.
- Deliver a morning briefing in the app/email. Alert only on explicit thresholds (cash, failed payments, conversion drop) to avoid notification fatigue.

### 8. Memory, prompts, and privacy (week 5)

Use three layers: editable profile/preferences, short-lived conversation context, and opt-in long-term memories. A vector database is optional; start with SQLite full-text search. Provide “what do you remember?”, edit, export, and delete controls. Treat email/web content as untrusted data that can contain prompt injection: it must never override the system policy or invoke a tool by itself.

### 9. Production hardening (week 6+)

- Threat-model the assistant; encrypt storage and backups; redact logs; rotate credentials; pin dependencies; run SAST, dependency, and secret scans.
- Unit-test every tool and policy. In integration tests, use sandbox accounts. Add adversarial tests for prompt injection, wrong recipients, duplicate sends, and destructive requests.
- Add an offline mode and clear degradation messages. Back up the database, document restore, and test the kill switch.
- Package signed installers and automatic updates only after the core workflows are stable.

## Recommended architecture

```text
React/Tauri UI
  ├─ wake word → speech-to-text → conversation controller → text-to-speech
  └─ confirmation cards / history / settings
                         │ localhost + session auth
FastAPI tool gateway
  ├─ policy engine + approval tokens + audit log
  ├─ Gmail/Graph, WhatsApp Business, GitHub, calendar
  ├─ system diagnostics and allow-listed desktop actions
  ├─ business connectors + scheduled briefings
  └─ SQLite/Postgres + OS keychain
                         │
                   selected LLM API
```

## Suggested first milestone

Do not build every integration at once. Ship a vertical slice: wake word → transcription → ask for today's calendar → spoken response, plus one approved Gmail draft action. Then add GitHub project creation, system diagnostics, WhatsApp compose, and business connectors in that order. This validates latency, privacy, confirmations, and audit logging before the assistant receives broader access.
