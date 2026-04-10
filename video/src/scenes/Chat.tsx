import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, MONO, SANS } from "../theme";

// Typewriter utility
function typewrite(text: string, frame: number, startF: number, fps: number, cps = 12): string {
  if (frame < startF) return "";
  const n = Math.floor(((frame - startF) / fps) * cps);
  return text.slice(0, Math.min(n, text.length));
}

// The conversation script
// User message
const USER_Q = "你后悔过吗？";
const USER_START = 50;

// Itachi's response segments: {text, start, italic?}
const ITACHI_LINES = [
  { text: "后悔？",                                    start: 90,  italic: false },
  { text: "后悔的前提是，当时有别的路可以走。",        start: 115, italic: false },
  { text: "我把每一条路都算过了。",                    start: 175, italic: false },
  { text: "有些算法，答案从第一步就已经确定了。",      start: 205, italic: false },
  { text: "*他抬起眼，神情没有一丝波动。*",            start: 260, italic: true  },
  { text: "不后悔，不代表不疼。",                       start: 310, italic: false },
  { text: "只是疼，不影响答案。",                       start: 345, italic: false },
];

// Chat bubble component
const Bubble: React.FC<{
  side: "left" | "right";
  label: string;
  labelColor: string;
  children: React.ReactNode;
  opacity?: number;
  translateY?: number;
}> = ({ side, label, labelColor, children, opacity = 1, translateY = 0 }) => {
  const isLeft = side === "left";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isLeft ? "flex-start" : "flex-end",
        opacity,
        transform: `translateY(${translateY}px)`,
        maxWidth: "65%",
        alignSelf: isLeft ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          color: labelColor,
          fontFamily: MONO,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: 1,
          marginBottom: 6,
          paddingLeft: isLeft ? 4 : 0,
          paddingRight: isLeft ? 0 : 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: isLeft ? "rgba(255,255,255,0.05)" : "rgba(139,92,246,0.12)",
          border: `1px solid ${isLeft ? C.border : "rgba(139,92,246,0.25)"}`,
          borderRadius: isLeft ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
          padding: "14px 18px",
          color: C.text,
          fontFamily: SANS,
          fontSize: 19,
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Thinking dots
const ThinkingDots: React.FC<{ frame: number; visible: boolean }> = ({ frame, visible }) => {
  if (!visible) return null;
  const dot = Math.floor(frame / 12) % 3;
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: "12px 16px",
        alignSelf: "flex-start",
        opacity: 0.6,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C.textMuted,
            opacity: dot === i ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
};

export const Chat: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Window entrance
  const windowSpring = spring({ frame, fps, config: { damping: 200, stiffness: 400, mass: 1 } });
  const windowY = interpolate(windowSpring, [0, 1], [80, 0]);
  const windowOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Header entrance
  const headerOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });

  // User question
  const userQ = typewrite(USER_Q, frame, USER_START, fps, 14);
  const userOpacity = interpolate(frame, [USER_START - 5, USER_START + 5], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Thinking dots: visible between user done and first itachi line
  const userDone = frame >= USER_START + Math.ceil((USER_Q.length / 14) * fps) + 5;
  const firstItachiStart = ITACHI_LINES[0].start;
  const showDots = userDone && frame < firstItachiStart;

  // Build Itachi's visible text
  const itachiLinesVisible = ITACHI_LINES.filter((l) => frame >= l.start);

  // Itachi block entrance
  const itachiBlockOpacity = interpolate(
    frame, [firstItachiStart - 5, firstItachiStart + 10], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fade-in for the entire scene
  const sceneFadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Scene label
  const labelOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });

  // Cursor blink
  const cursor = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: sceneFadeIn,
      }}
    >
      {/* Scene label top-left */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 120,
          opacity: labelOpacity,
          color: C.textMuted,
          fontFamily: MONO,
          fontSize: 18,
          letterSpacing: 2,
        }}
      >
        Phase 4 · 验证对话 · /itachi-naruto
      </div>

      {/* Chat window */}
      <div
        style={{
          width: 820,
          background: "rgba(8,9,18,0.96)",
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: "hidden",
          transform: `translateY(${windowY}px)`,
          opacity: windowOpacity,
          boxShadow: `0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px ${C.border}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: `1px solid ${C.border}`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: headerOpacity,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `linear-gradient(135deg, #1a1a2e, #2d1b69)`,
              border: `1px solid rgba(139,92,246,0.4)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🔴
          </div>
          <div>
            <div style={{ color: C.text, fontFamily: SANS, fontSize: 18, fontWeight: 500 }}>
              宇智波鼬
            </div>
            <div style={{ color: C.textMuted, fontFamily: MONO, fontSize: 15 }}>
              itachi-naruto · 沉浸模式 · skill-everyone
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.green,
              boxShadow: `0 0 8px ${C.greenGlow}`,
            }}
          />
          <span style={{ color: C.textMuted, fontFamily: MONO, fontSize: 15 }}>
            在线
          </span>
        </div>

        {/* Messages area */}
        <div
          style={{
            padding: "28px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            minHeight: 360,
          }}
        >
          {/* User message */}
          <Bubble
            side="right"
            label="Claude"
            labelColor={C.purpleLight}
            opacity={userOpacity}
          >
            {userQ}
            {frame >= USER_START && frame < USER_START + Math.ceil((USER_Q.length / 14) * fps) && (
              <span style={{ opacity: cursor ? 1 : 0, color: C.purpleLight }}>▋</span>
            )}
          </Bubble>

          {/* Thinking dots */}
          <ThinkingDots frame={frame} visible={showDots} />

          {/* Itachi's response */}
          {frame >= firstItachiStart && (
            <Bubble
              side="left"
              label="鼬"
              labelColor={C.textSub}
              opacity={itachiBlockOpacity}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {itachiLinesVisible.map((line, i) => {
                  const typedText = typewrite(line.text, frame, line.start, fps, 14);
                  const isLastVisible = i === itachiLinesVisible.length - 1;
                  const isDone = frame >= line.start + Math.ceil((line.text.length / 14) * fps);

                  // Extra spacing: blank line after line index 0 and 3 (after "后悔？" and before italic)
                  const addSpacingBefore = i === 1 || i === 4 || i === 5;

                  return (
                    <div key={i}>
                      {addSpacingBefore && <div style={{ height: 12 }} />}
                      <span
                        style={{
                          fontStyle: line.italic ? "italic" : "normal",
                          color: line.italic ? C.textMuted : C.text,
                          fontSize: line.italic ? 16 : 19,
                        }}
                      >
                        {typedText}
                        {isLastVisible && !isDone && (
                          <span style={{ opacity: cursor ? 1 : 0, color: C.textSub }}>▋</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Bubble>
          )}
        </div>

        {/* Input bar */}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.01)",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 36,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
            }}
          >
            <span style={{ color: C.textMuted, fontFamily: MONO, fontSize: 16 }}>
              继续和鼬说话...
            </span>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `rgba(139,92,246,0.2)`,
              border: `1px solid rgba(139,92,246,0.3)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
            }}
          >
            ↑
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
