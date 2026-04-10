import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, MONO, SANS } from "../theme";

// Typewriter helper
function typewrite(
  text: string,
  frame: number,
  startFrame: number,
  fps: number,
  cps = 10
): string {
  if (frame < startFrame) return "";
  const chars = Math.floor(((frame - startFrame) / fps) * cps);
  return text.slice(0, Math.min(chars, text.length));
}

function isDone(
  text: string,
  frame: number,
  startFrame: number,
  fps: number,
  cps = 10
): boolean {
  return frame >= startFrame + Math.ceil((text.length / cps) * fps);
}

const COMMAND = "/summon 宇智波鼬";
const CMD_START = 35;
const CMD_CPS = 9;

export const Terminal: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Terminal slides up with spring
  const s = spring({ frame, fps, config: { damping: 180, stiffness: 500, mass: 0.9 } });
  const translateY = interpolate(s, [0, 1], [160, 0]);
  const windowOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Cursor blink (15-frame cycle)
  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  const cmdText = typewrite(COMMAND, frame, CMD_START, fps, CMD_CPS);
  const cmdDone = isDone(COMMAND, frame, CMD_START, fps, CMD_CPS);
  const cmdEndFrame = CMD_START + Math.ceil((COMMAND.length / CMD_CPS) * fps);

  const r1 = frame >= cmdEndFrame + 12;
  const r2 = frame >= cmdEndFrame + 22;
  const r3 = frame >= cmdEndFrame + 34;
  const r4 = frame >= cmdEndFrame + 50;
  const r5 = frame >= cmdEndFrame + 68;
  const r6 = frame >= cmdEndFrame + 86;

  const fadeOut = interpolate(frame, [200, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Terminal window */}
      <div
        style={{
          width: 860,
          background: C.terminalBg,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
          transform: `translateY(${translateY}px)`,
          opacity: windowOpacity,
          boxShadow: `0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px ${C.border}, 0 0 60px rgba(139,92,246,0.08)`,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {(["#EF4444", "#F59E0B", "#10B981"] as string[]).map(
            (color, i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: color,
                  opacity: 0.8,
                }}
              />
            )
          )}
          <span
            style={{
              marginLeft: 10,
              color: C.textMuted,
              fontFamily: MONO,
              fontSize: 15,
            }}
          >
            claude — skill-everyone
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ color: C.textMuted, fontFamily: MONO, fontSize: 14 }}>
            ~/.claude/skills/skill-everyone
          </span>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "22px 28px 28px",
            fontFamily: MONO,
            fontSize: 17,
            lineHeight: 1.9,
            minHeight: 300,
          }}
        >
          {/* History hint */}
          <div style={{ color: C.textMuted, marginBottom: 12, fontSize: 15 }}>
            skill-everyone v1.0.0 · 已安装角色：4 · 输入 /summon 召唤新角色
          </div>

          {/* Prompt line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ color: C.terminalPrompt, fontWeight: 600 }}>
              claude
            </span>
            <span style={{ color: C.textMuted }}>›</span>
            <span style={{ color: C.terminalText }}>{cmdText}</span>
            {!cmdDone && (
              <span
                style={{
                  opacity: cursorBlink ? 1 : 0,
                  color: C.terminalCaret,
                  transition: "opacity 0s",
                }}
              >
                ▋
              </span>
            )}
          </div>

          {/* Response */}
          {r1 && (
            <div style={{ marginTop: 14, color: C.textMuted, fontSize: 15 }}>
              ──────────────────────────────────────────
            </div>
          )}
          {r2 && (
            <div
              style={{
                marginTop: 6,
                color: C.purpleLight,
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              ✦ skill-everyone · /summon
            </div>
          )}
          {r3 && (
            <div style={{ marginTop: 10 }}>
              <span style={{ color: C.textSub }}>检测到角色：</span>
              <span style={{ color: C.tealLight, fontWeight: 500 }}>
                宇智波鼬
              </span>
              <span style={{ color: C.textMuted }}>
                {" "}
                · 火影忍者 (Masashi Kishimoto)
              </span>
            </div>
          )}
          {r4 && (
            <div style={{ color: C.textSub, marginTop: 4 }}>
              <span>模式：沉浸对话 + 思维视角</span>
              <span style={{ color: C.textMuted }}> · 来源：自动调研</span>
            </div>
          )}
          {r5 && (
            <div
              style={{
                marginTop: 12,
                color: C.green,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>✓</span>
              <span>初始化完成</span>
              <span style={{ color: C.textMuted }}>
                · 启动三路并行调研引擎...
              </span>
            </div>
          )}
          {r6 && (
            <div
              style={{
                marginTop: 4,
                display: "flex",
                gap: 20,
                fontSize: 15,
              }}
            >
              <span style={{ color: C.teal }}>● Agent A 启动</span>
              <span style={{ color: C.amber }}>● Agent B 启动</span>
              <span style={{ color: C.purple }}>● Agent C 启动</span>
            </div>
          )}
        </div>
      </div>

      {/* Side label */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          right: "calc(50% - 500px)",
          color: C.textMuted,
          fontSize: 16,
          fontFamily: MONO,
          letterSpacing: 1,
          opacity: windowOpacity,
        }}
      >
        Phase 0 · 信息采集
      </div>
    </AbsoluteFill>
  );
};
