/**
 * skill-everyone web server
 * Uses the same `claude` binary as the CLI — no separate API key needed.
 * Auth: reads ~/.claude/ credentials automatically (subscription or API key, whatever CLI uses).
 */

const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const app = express();
const PORT = 3000;
const SKILLS_BASE = path.join(os.homedir(), ".claude", "skills");
const HISTORY_BASE = path.join(__dirname, "history");

// Empty MCP config — prevents claude child processes from trying to connect to
// MCP servers (Gmail, Calendar, etc.) which require OAuth and hang indefinitely.
const EMPTY_MCP_CONFIG = path.join(os.tmpdir(), "skill-everyone-empty-mcp.json");
fs.writeFileSync(EMPTY_MCP_CONFIG, JSON.stringify({ mcpServers: {} }));

// ── Input sanitisation helpers ───────────────────────────────────────────────
// Allow only alphanumeric, hyphen, underscore (max 80 chars).
// path.basename strips any directory traversal first, then we whitelist.
function sanitizeSlug(slug) {
  if (typeof slug !== "string") return null;
  const base = path.basename(slug);           // strip e.g. "../../etc/passwd"
  const clean = base.replace(/[^a-zA-Z0-9\-_]/g, "");
  return clean.length > 0 && clean.length <= 80 ? clean : null;
}

// Standard UUID v4 format check — keeps --resume arg safe.
function isValidUUID(str) {
  return (
    typeof str === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
  );
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── List installed characters ────────────────────────────────────────────────
app.get("/api/characters", (req, res) => {
  try {
    const chars = fs.readdirSync(SKILLS_BASE)
      .filter((d) => {
        try {
          if (!fs.statSync(path.join(SKILLS_BASE, d)).isDirectory()) return false;
          if (!fs.existsSync(path.join(SKILLS_BASE, d, "SKILL.md"))) return false;
          const baseSlug = d.replace(/-perspective$/, "");
          return fs.existsSync(path.join(__dirname, "..", "characters", baseSlug, "meta.json"));
        } catch { return false; }
      })
      .map((slug) => {
        const baseSlug = slug.replace(/-perspective$/, "");
        const isPerspective = slug.endsWith("-perspective");
        const metaPath = path.join(__dirname, "..", "characters", baseSlug, "meta.json");
        let name = slug;
        if (fs.existsSync(metaPath)) {
          try { name = JSON.parse(fs.readFileSync(metaPath, "utf8")).name || slug; }
          catch {}
        }
        if (isPerspective) name += "（视角）";
        return { slug, name };
      });
    res.json(chars);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Chat (SSE streaming) ─────────────────────────────────────────────────────
app.post("/api/chat", (req, res) => {
  const { character: rawChar, message, sessionId: rawSid } = req.body;
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message required" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let ended = false;
  const send = (obj) => { if (!ended) res.write(`data: ${JSON.stringify(obj)}\n\n`); };
  const finish = () => { if (!ended) { ended = true; res.end(); } };

  let args, sid, resolvedChar;

  if (rawSid) {
    // ── Continue existing session ──
    if (!isValidUUID(rawSid)) {
      send({ type: "error", error: "invalid sessionId" });
      return res.end();
    }
    sid = rawSid;
    resolvedChar = sanitizeSlug(rawChar) || "unknown";
    args = [
      "--print",
      "--verbose",
      "--resume", sid,
      "--output-format", "stream-json",
      "--include-partial-messages",
      "--allowedTools", "",
      "--mcp-config", EMPTY_MCP_CONFIG,
    ];
  } else {
    // ── New session: load SKILL.md as system prompt ──
    resolvedChar = sanitizeSlug(rawChar);
    if (!resolvedChar) {
      return res.status(400).json({ error: "character required for new session" });
    }
    const skillPath = path.join(SKILLS_BASE, resolvedChar, "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      return res.status(404).json({ error: "SKILL.md not found" });
    }

    sid = crypto.randomUUID();
    const skillContent = fs.readFileSync(skillPath, "utf8");

    args = [
      "--print",
      "--verbose",
      "--system-prompt", skillContent,
      "--session-id", sid,
      "--output-format", "stream-json",
      "--include-partial-messages",
      "--allowedTools", "",
      "--mcp-config", EMPTY_MCP_CONFIG,
    ];
  }

  // Tell client the session ID right away
  send({ type: "session", sessionId: sid });

  // Only strip CLAUDE_CODE_SSE_PORT — this is the IPC port that causes the child
  // process to connect back to the parent Claude Code session and hang indefinitely.
  // All other vars (CLAUDECODE, CLAUDE_CODE_USE_BEDROCK, etc.) must be kept so that
  // subscription auth and Bedrock routing both work correctly for any user.
  const { CLAUDE_CODE_SSE_PORT: _drop, ...childEnv } = process.env;
  const claude = spawn("claude", args, { env: childEnv, stdio: ["pipe", "pipe", "pipe"] });
  // Pass message via stdin to avoid --allowedTools consuming positional args
  claude.stdin.write(message);
  claude.stdin.end();
  let fullResponse = "";
  let streamedText = false;
  let buffer = "";
  // For new sessions, buffer text until the one-time disclaimer separator is passed.
  // Skills output "…disclaimer…\n\n---\n\n" on first activation; we strip it on
  // the web side so the user never sees it, while CLI users still do.
  let disclaimerDone = !!rawSid;   // resume sessions have no disclaimer
  let disclaimerBuf  = "";

  // Handle spawn failure (e.g. claude binary not found)
  claude.on("error", (err) => {
    console.error("[claude spawn error]", err.message);
    send({ type: "error", error: `Cannot start claude: ${err.message}` });
    send({ type: "done" });
    finish();
  });

  claude.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);
        // stream_event with content_block_delta carries streaming text chunks
        if (
          event.type === "stream_event" &&
          event.event?.type === "content_block_delta" &&
          event.event?.delta?.type === "text_delta"
        ) {
          const text = event.event.delta.text;
          if (!disclaimerDone) {
            // Buffer until we find the separator that follows the disclaimer
            disclaimerBuf += text;
            const sep = disclaimerBuf.indexOf("\n\n---\n\n");
            if (sep !== -1) {
              disclaimerDone = true;
              const after = disclaimerBuf.slice(sep + 7); // 7 = len("\n\n---\n\n")
              disclaimerBuf = "";
              if (after) {
                fullResponse += after;
                streamedText = true;
                send({ type: "text", text: after });
              }
            }
            // Still buffering — don't send anything yet
          } else {
            fullResponse += text;
            streamedText = true;
            send({ type: "text", text });
          }
        }
        // result event carries the final complete response
        if (event.type === "result" && event.result) {
          fullResponse = fullResponse || event.result;
        }
      } catch { /* partial JSON chunk — ignore */ }
    }
  });

  claude.stderr.on("data", (d) => {
    console.error("[claude stderr]", d.toString().trimEnd());
  });

  claude.on("close", () => {
    // Flush remaining buffer
    if (buffer.trim()) {
      try {
        const event = JSON.parse(buffer);
        if (event.type === "result" && event.result) {
          fullResponse = fullResponse || event.result;
        }
      } catch {}
    }

    if (!fullResponse) {
      fullResponse = "(No response)";
    }
    // Strip disclaimer from fallback (result-event) responses for new sessions
    if (!disclaimerDone) {
      const sep = fullResponse.indexOf("\n\n---\n\n");
      if (sep !== -1) fullResponse = fullResponse.slice(sep + 7);
    }
    // If streaming events never fired (format mismatch), send full response now
    if (!streamedText) {
      send({ type: "text", text: fullResponse });
    }

    saveHistory(resolvedChar, sid, message, fullResponse);
    send({ type: "done" });
    finish();
  });

  // Use res.on("close") — fires when the CLIENT disconnects from the SSE stream.
  // req.on("close") fires immediately after express.json() consumes the POST body,
  // which would kill claude only milliseconds after spawning it.
  res.on("close", () => { ended = true; claude.kill(); });
});

// ── History ──────────────────────────────────────────────────────────────────
app.get("/api/history/:character", (req, res) => {
  const slug = sanitizeSlug(req.params.character);
  if (!slug) return res.status(400).json({ error: "invalid character" });
  const dir = path.join(HISTORY_BASE, slug);
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().reverse().slice(0, 30);
  const sessions = [];
  for (const f of files) {
    const date = f.replace(".json", "");
    let msgs;
    try { msgs = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { continue; }
    const groups = new Map();
    for (const m of msgs) {
      const sid = m.session || "default";
      if (!groups.has(sid)) groups.set(sid, []);
      groups.get(sid).push(m);
    }
    for (const [sid, messages] of groups) {
      sessions.push({ date, session: sid, messages });
    }
  }
  sessions.sort((a, b) => (b.messages[0]?.ts || 0) - (a.messages[0]?.ts || 0));
  res.json(sessions.slice(0, 30));
});

function saveHistory(character, sessionId, userMsg, assistantMsg) {
  try {
    const slug = sanitizeSlug(character) || "unknown";
    const dir = path.join(HISTORY_BASE, slug);
    fs.mkdirSync(dir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const file = path.join(dir, `${date}.json`);
    let msgs = [];
    if (fs.existsSync(file)) {
      try { msgs = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
    }
    msgs.push({ role: "user",      content: userMsg,      ts: Date.now(), session: sessionId });
    msgs.push({ role: "assistant", content: assistantMsg, ts: Date.now(), session: sessionId });
    fs.writeFileSync(file, JSON.stringify(msgs, null, 2));
  } catch (e) {
    console.error("[saveHistory error]", e.message);
  }
}

app.listen(PORT, () => {
  console.log(`\nskill-everyone web UI`);
  console.log(`→  http://localhost:${PORT}`);
  console.log(`→  Auth: same as CLI (reads ~/.claude/ credentials)\n`);
});
