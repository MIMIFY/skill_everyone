import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, SANS, MONO } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade in
  const fadeIn = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Line 1
  const line1 = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2
  const line2 = interpolate(frame, [35, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Badge
  const badge = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle pulse on the dot
  const pulse = Math.sin((frame / 30) * Math.PI * 2) * 0.15 + 0.85;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(139,92,246,${
            0.06 * pulse
          }) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Main line */}
      <div
        style={{
          opacity: line1,
          color: C.text,
          fontFamily: SANS,
          fontSize: 48,
          fontWeight: 300,
          letterSpacing: 5,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        你也可以，召唤那个Ta
      </div>

      {/* Sub line */}
      <div
        style={{
          opacity: line2,
          marginTop: 20,
          color: C.textSub,
          fontFamily: SANS,
          fontSize: 24,
          fontWeight: 300,
          letterSpacing: 3,
          textAlign: "center",
        }}
      >
        小说 · 游戏 · 动漫 · 宠物 · 故人 · 任何你心里还亮着的存在
      </div>

      {/* Divider */}
      <div
        style={{
          opacity: line2,
          width: 240,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.purple}, transparent)`,
          marginTop: 36,
        }}
      />

      {/* Badge */}
      <div
        style={{
          opacity: badge,
          marginTop: 28,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.purple,
            boxShadow: `0 0 12px ${C.purpleGlow}`,
            opacity: pulse,
          }}
        />
        <span
          style={{
            color: C.textMuted,
            fontFamily: MONO,
            fontSize: 17,
            letterSpacing: 2,
          }}
        >
          skill-everyone · /summon
        </span>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.purple,
            boxShadow: `0 0 12px ${C.purpleGlow}`,
            opacity: pulse,
          }}
        />
      </div>

      {/* GitHub */}
      <div
        style={{
          opacity: badge,
          marginTop: 16,
          color: C.textMuted,
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 1,
        }}
      >
        github.com/MIMIFY/skill_everyone
      </div>
    </AbsoluteFill>
  );
};
