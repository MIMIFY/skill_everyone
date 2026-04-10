import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, MONO, SANS } from "../theme";

const FILES = [
  "~/.claude/skills/itachi-naruto/SKILL.md",
  "~/.claude/skills/itachi-naruto/references/persona.md",
  "~/.claude/skills/itachi-naruto/references/world.md",
  "~/.claude/skills/itachi-naruto/references/auto/wiki.md",
  "~/.claude/skills/itachi-naruto/references/auto/quotes.md",
  "~/.claude/skills/itachi-naruto/references/auto/analysis.md",
];

export const Generated: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Big checkmark spring
  const checkSpring = spring({
    frame,
    fps,
    config: { damping: 120, stiffness: 600, mass: 0.5 },
  });
  const checkScale = interpolate(checkSpring, [0, 1], [0.3, 1]);
  const checkOpacity = interpolate(checkSpring, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow pulse
  const glowPulse = Math.sin((frame / fps) * Math.PI * 2) * 0.3 + 0.7;

  // Title
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [15, 35], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Slug line
  const slugOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Files list
  const filesOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Usage hint
  const usageOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Fade out
  const fadeOut = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(16,185,129,${
            0.12 * glowPulse
          }) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Check mark */}
      <div
        style={{
          opacity: checkOpacity,
          transform: `scale(${checkScale})`,
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: `2px solid ${C.green}`,
          boxShadow: `0 0 30px ${C.greenGlow}, 0 0 60px rgba(16,185,129,0.1)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          color: C.green,
          fontSize: 36,
        }}
      >
        ✓
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          color: C.text,
          fontFamily: SANS,
          fontSize: 36,
          fontWeight: 400,
          letterSpacing: 3,
          textAlign: "center",
        }}
      >
        宇智波鼬 · 角色已就绪
      </div>

      {/* Slug */}
      <div
        style={{
          opacity: slugOpacity,
          marginTop: 16,
          background: "rgba(139,92,246,0.12)",
          border: `1px solid rgba(139,92,246,0.3)`,
          borderRadius: 8,
          padding: "8px 20px",
          fontFamily: MONO,
          fontSize: 18,
          color: C.purpleLight,
          letterSpacing: 1,
        }}
      >
        /itachi-naruto
        <span style={{ color: C.textMuted }}> · </span>
        /itachi-naruto-perspective
      </div>

      {/* Files created */}
      <div
        style={{
          opacity: filesOpacity,
          marginTop: 28,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "flex-start",
        }}
      >
        {FILES.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: interpolate(frame, [40 + i * 6, 60 + i * 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span style={{ color: C.green, fontFamily: MONO, fontSize: 15 }}>
              ✓
            </span>
            <span
              style={{
                color: C.textSub,
                fontFamily: MONO,
                fontSize: 15,
              }}
            >
              {f}
            </span>
          </div>
        ))}
      </div>

      {/* Usage hint */}
      <div
        style={{
          opacity: usageOpacity,
          marginTop: 32,
          display: "flex",
          gap: 24,
        }}
      >
        {[
          { cmd: "/itachi-naruto", label: "沉浸对话" },
          { cmd: "/itachi-naruto-perspective", label: "思维视角" },
        ].map(({ cmd, label }) => (
          <div
            key={cmd}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "10px 18px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: C.tealLight,
                fontFamily: MONO,
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              {cmd}
            </div>
            <div
              style={{
                color: C.textMuted,
                fontFamily: SANS,
                fontSize: 15,
                marginTop: 4,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
