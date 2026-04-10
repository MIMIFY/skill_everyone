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
          return fs.statSync(path.join(SKILLS_BASE, d)).isDirectory() &&
            fs.existsSync(path.join(SKILLS_BASE, d, "SKILL.md"));
        } catch { return false; }
      })
      .map((slug) => {
        // Try to get a display name from meta.json in characters/
        const metaPath = path.join(
          __dirname, "..", "characters", slug, "meta.json"
        );
        let name = slug;
        if (fs.existsSync(metaPath)) {
          try { name = JSON.parse(fs.readFileSync(metaPath, "utf8")).name || slug; }
          catch {}
        }
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

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

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
      "--resume", sid,
      "--output-format", "stream-json",
      "--include-partial-messages",
      "--allowedTools", "",
      message,
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
      "--system-prompt", skillContent,
      "--session-id", sid,
      "--output-format", "stream-json",
      "--include-partial-messages",
      "--allowedTools", "",
      message,
    ];
  }

  // Tell client the session ID right away
  send({ type: "session", sessionId: sid });

  const claude = spawn("claude", args, { env: process.env });
  let fullResponse = "";
  let buffer = "";

  // Handle spawn failure (e.g. claude binary not found)
  claude.on("error", (err) => {
    console.error("[claude spawn error]", err.message);
    send({ type: "error", error: `无法启动 claude: ${err.message}` });
    send({ type: "done" });
    res.end();
  });

  claude.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);
        if (
          event.type === "assistant" &&
          event.message?.partial === true &&
          event.message?.delta?.type === "text_delta"
        ) {
          const text = event.message.delta.text;
          fullResponse += text;
          send({ type: "text", text });
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
      fullResponse = "(无回复，请重试)";
      send({ type: "text", text: fullResponse });
    }

    saveHistory(resolvedChar, sid, message, fullResponse);
    send({ type: "done" });
    res.end();
  });

  req.on("close", () => claude.kill());
});

// ── History ──────────────────────────────────────────────────────────────────
app.get("/api/history/:character", (req, res) => {
  const slug = sanitizeSlug(req.params.character);
  if (!slug) return res.status(400).json({ error: "invalid character" });
  const dir = path.join(HISTORY_BASE, slug);
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().reverse().slice(0, 30);
  const sessions = files.map((f) => ({
    date: f.replace(".json", ""),
    messages: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")),
  }));
  res.json(sessions);
});

function saveHistory(character, sessionId, userMsg, assistantMsg) {
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
}

app.listen(PORT, () => {
  console.log(`\nskill-everyone web UI`);
  console.log(`→  http://localhost:${PORT}`);
  console.log(`→  Auth: same as CLI (reads ~/.claude/ credentials)\n`);
});
