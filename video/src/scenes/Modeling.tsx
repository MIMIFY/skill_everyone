import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, MONO, SANS } from "../theme";

type DimensionData = {
  emoji: string;
  emojiColor: string;
  borderColor: string;
  glowColor: string;
  title: string;
  subtitle: string;
  value: string;
  evidence: string;
};

const DIMENSIONS: DimensionData[] = [
  {
    emoji: "💜",
    emojiColor: "#A78BFA",
    borderColor: "rgba(139,92,246,0.3)",
    glowColor: "rgba(139,92,246,0.08)",
    title: "依恋模式",
    subtitle: "Bowlby / Ainsworth",
    value: "回避型依恋",
    evidence: "越在乎，越主动拉开距离",
  },
  {
    emoji: "💙",
    emojiColor: "#60A5FA",
    borderColor: "rgba(96,165,250,0.3)",
    glowColor: "rgba(96,165,250,0.08)",
    title: "防御机制",
    subtitle: "Anna Freud",
    value: "理智化 · 升华",
    evidence: "把悲痛锁进任务里",
  },
  {
    emoji: "💚",
    emojiColor: "#34D399",
    borderColor: "rgba(52,211,153,0.3)",
    glowColor: "rgba(52,211,153,0.08)",
    title: "核心图式",
    subtitle: "Beck / Young",
    value: "自我牺牲 · 严苛标准",
    evidence: "我没有资格被爱",
  },
  {
    emoji: "💛",
    emojiColor: "#FCD34D",
    borderColor: "rgba(252,211,77,0.3)",
    glowColor: "rgba(252,211,77,0.08)",
    title: "需求层级",
    subtitle: "Maslow",
    value: "佐助安全 > 自己生命",
    evidence: "唯一情感连接，也是最大弱点",
  },
  {
    emoji: "🧡",
    emojiColor: "#FB923C",
    borderColor: "rgba(251,146,60,0.3)",
    glowColor: "rgba(251,146,60,0.08)",
    title: "道德推理",
    subtitle: "Kohlberg 第六阶段",
    value: "后习俗 · 普遍原则",
    evidence: "你说得对。但答案不变。",
  },
];

const DimensionCard: React.FC<{
  dim: DimensionData;
  frame: number;
  fps: number;
  index: number;
}> = ({ dim, frame, fps, index }) => {
  const delay = index * 38;
  const localFrame = frame - delay;

  if (localFrame < 0) return null;

  const s = spring({
    frame: localFrame,
    fps,
    config: { damping: 220, stiffness: 350, mass: 1.0 },
  });
  const translateX = interpolate(s, [0, 1], [120, 0]);
  const opacity = interpolate(s, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        background: `${dim.glowColor}`,
        border: `1px solid ${dim.borderColor}`,
        borderRadius: 10,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Emoji */}
      <div style={{ fontSize: 28, flexShrink: 0 }}>{dim.emoji}</div>

      {/* Left: title + subtitle */}
      <div style={{ width: 140, flexShrink: 0 }}>
        <div
          style={{
            color: dim.emojiColor,
            fontFamily: SANS,
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          {dim.title}
        </div>
        <div
          style={{
            color: C.textMuted,
            fontFamily: MONO,
            fontSize: 17,
            marginTop: 2,
          }}
        >
          {dim.subtitle}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 36,
          background: dim.borderColor,
          flexShrink: 0,
        }}
      />

      {/* Middle: value */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            color: C.text,
            fontFamily: SANS,
            fontSize: 19,
            fontWeight: 500,
          }}
        >
          {dim.value}
        </div>
      </div>

      {/* Right: evidence quote */}
      <div
        style={{
          color: C.textSub,
          fontFamily: SANS,
          fontSize: 19,
          fontStyle: "italic",
          maxWidth: 280,
          textAlign: "right",
          lineHeight: 1.4,
        }}
      >
        {dim.evidence}
      </div>
    </div>
  );
};

export const Modeling: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Title
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 20], [-16, 0], {
    extrapolateRight: "clamp",
  });

  // Scene badge
  const badgeOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Fade out
  const fadeOut = interpolate(frame, [240, 270], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // All cards visible?
  const lastCardAppears = (DIMENSIONS.length - 1) * 38 + 30;
  const allVisible = frame >= lastCardAppears;
  const summaryOpacity = interpolate(
    frame,
    [lastCardAppears + 20, lastCardAppears + 40],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 180px",
        opacity: fadeOut,
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 36,
          width: "100%",
          maxWidth: 860,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              opacity: badgeOpacity,
              color: C.textMuted,
              fontFamily: MONO,
              fontSize: 18,
              letterSpacing: 2,
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              padding: "4px 12px",
              borderRadius: 20,
            }}
          >
            Phase 2 · 心理建模
          </div>
          <div
            style={{
              color: C.text,
              fontFamily: SANS,
              fontSize: 30,
              fontWeight: 300,
              letterSpacing: 2,
            }}
          >
            5 维人格提炼
          </div>
          <div
            style={{
              flex: 1,
              height: 1,
              background: `linear-gradient(90deg, ${C.border}, transparent)`,
            }}
          />
          <div
            style={{
              color: C.textMuted,
              fontFamily: MONO,
              fontSize: 19,
            }}
          >
            宇智波鼬
          </div>
        </div>
      </div>

      {/* Dimension cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 860,
        }}
      >
        {DIMENSIONS.map((dim, i) => (
          <DimensionCard
            key={dim.title}
            dim={dim}
            frame={frame}
            fps={fps}
            index={i}
          />
        ))}
      </div>

      {/* Summary quote */}
      {allVisible && (
        <div
          style={{
            opacity: summaryOpacity,
            marginTop: 28,
            maxWidth: 860,
            width: "100%",
            borderLeft: `2px solid ${C.purple}`,
            paddingLeft: 16,
            color: C.textSub,
            fontFamily: SANS,
            fontSize: 17,
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
        >
          每一次回应不是随机生成「符合语气」的话——而是从心理学理论出发，有可追溯的行为逻辑。
        </div>
      )}
    </AbsoluteFill>
  );
};
