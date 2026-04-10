import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, MONO, SANS } from "../theme";

type AgentConfig = {
  label: string;
  color: string;
  glow: string;
  icon: string;
  task: string;
  url: string;
  urlStatus: "200" | "403" | "redirect";
  startDelay: number;
  duration: number;
  findings: string[];
};

const AGENTS: AgentConfig[] = [
  {
    label: "Agent A",
    color: C.teal,
    glow: C.tealGlow,
    icon: "🔍",
    task: "Wiki 基础档案",
    url: "en.wikipedia.org/wiki/Itachi_Uchiha",
    urlStatus: "200",
    startDelay: 0,
    duration: 155,
    findings: [
      "2023 全球人气投票 · #2（仅次于波风水门）",
      "岸本最爱 Akatsuki 角色 · 原因：背景故事",
      "原始设定：70 人暗杀队长 → 改为晓卧底",
    ],
  },
  {
    label: "Agent B",
    color: C.amber,
    glow: "rgba(245,158,11,0.25)",
    icon: "💬",
    task: "台词数据库",
    url: "en.wikiquote.org/wiki/Naruto",
    urlStatus: "redirect",
    startDelay: 20,
    duration: 165,
    findings: [
      "「Foolish little brother, foster your hatred...」",
      "额头轻触——出现于故事开头与临死前",
      "「No. None.」对鬼鲛关于木叶情感的回答",
    ],
  },
  {
    label: "Agent C",
    color: C.purple,
    glow: C.purpleGlow,
    icon: "🧠",
    task: "批评与社区分析",
    url: "wikipedia.org · fandom.com(403) · tvtropes(403)",
    urlStatus: "200",
    startDelay: 40,
    duration: 175,
    findings: [
      "额头轻触 = 整部作品情感密度最高单一动作",
      "回避型依恋 · 理智化防御 · 后习俗道德推理",
      "「缺席型的爱」— 批评界核心定义",
    ],
  },
];

const StatusBadge: React.FC<{ status: AgentConfig["urlStatus"] }> = ({
  status,
}) => {
  const config = {
    "200": { label: "200 OK", color: C.green },
    "403": { label: "403 Blocked", color: C.red },
    redirect: { label: "301 →", color: C.amber },
  }[status];
  return (
    <span
      style={{
        color: config.color,
        fontFamily: MONO,
        fontSize: 13,
        background: `${config.color}18`,
        border: `1px solid ${config.color}40`,
        borderRadius: 4,
        padding: "1px 6px",
        flexShrink: 0,
      }}
    >
      {config.label}
    </span>
  );
};

const AgentCard: React.FC<{
  agent: AgentConfig;
  globalFrame: number;
  fps: number;
  cardIndex: number;
}> = ({ agent, globalFrame, fps, cardIndex }) => {
  const stagger = cardIndex * 15;
  const localFrame = globalFrame - stagger;

  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 200, stiffness: 400, mass: 0.8 },
  });
  const translateX = interpolate(entrance, [0, 1], [-60, 0]);
  const opacity = interpolate(entrance, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  if (localFrame < 0) return null;

  const progress = interpolate(
    globalFrame,
    [agent.startDelay, agent.startDelay + agent.duration],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const done = progress >= 100;

  const findingDelay = agent.startDelay + Math.floor(agent.duration * 0.35);
  const findings = agent.findings.filter(
    (_, i) => globalFrame >= findingDelay + i * 28
  );

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${done ? agent.color + "50" : C.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        opacity,
        transform: `translateX(${translateX}px)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {done && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 0% 0%, ${agent.glow} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 15 }}>{agent.icon}</span>
        <span
          style={{
            color: agent.color,
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          {agent.label}
        </span>
        <span style={{ color: C.textMuted, fontFamily: MONO, fontSize: 14 }}>
          {agent.task}
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            color: done ? agent.color : C.textMuted,
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {done ? "✓ 完成" : `${Math.round(progress)}%`}
        </span>
      </div>

      {/* URL row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <StatusBadge status={agent.urlStatus} />
        <span
          style={{
            color: C.textMuted,
            fontFamily: MONO,
            fontSize: 17,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {agent.url}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 2,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 1,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${agent.color}60, ${agent.color})`,
          }}
        />
      </div>

      {/* Findings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {findings.map((f, i) => (
          <div
            key={i}
            style={{
              color: C.textSub,
              fontFamily: MONO,
              fontSize: 15,
              display: "flex",
              gap: 8,
            }}
          >
            <span style={{ color: agent.color, flexShrink: 0 }}>›</span>
            <span>{f}</span>
          </div>
        ))}
        {!done && globalFrame >= agent.startDelay + 10 && (
          <div
            style={{
              color: C.textMuted,
              fontFamily: MONO,
              fontSize: 17,
              display: "flex",
              gap: 6,
            }}
          >
            <span style={{ color: agent.color }}>›</span>
            <span>
              {["解析页面结构...", "提取关键段落...", "过滤噪音数据..."][
                Math.floor(globalFrame / 9) % 3
              ]}
            </span>
            <span
              style={{ opacity: Math.floor(globalFrame / 10) % 2 === 0 ? 1 : 0 }}
            >
              ▋
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const Research: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const titleSpring = spring({ frame, fps, config: { damping: 200, stiffness: 500 } });
  const titleOpacity = interpolate(titleSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(titleSpring, [0, 1], [-20, 0]);

  const fadeOut = interpolate(frame, [250, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const allDone = frame >= 210;
  const extractionOpacity = interpolate(frame, [215, 235], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Source summary line
  const sourceSummaryOpacity = interpolate(frame, [220, 240], [0, 1], {
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
        padding: "0 200px",
        opacity: fadeOut,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 32,
          width: "100%",
          maxWidth: 860,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              color: C.textMuted,
              fontFamily: MONO,
              fontSize: 15,
              letterSpacing: 2,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            Phase 1 · 自动调研
          </div>
          <div
            style={{
              color: C.text,
              fontFamily: SANS,
              fontSize: 28,
              fontWeight: 300,
              letterSpacing: 2,
            }}
          >
            三路并行 · 宇智波鼬
          </div>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
        </div>
      </div>

      {/* Agent cards */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 860 }}
      >
        {AGENTS.map((agent, i) => (
          <AgentCard key={agent.label} agent={agent} globalFrame={frame} fps={fps} cardIndex={i} />
        ))}
      </div>

      {/* Completion */}
      {allDone && (
        <div
          style={{
            marginTop: 24,
            width: "100%",
            maxWidth: 860,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              opacity: extractionOpacity,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: C.greenLight,
              fontFamily: MONO,
              fontSize: 17,
            }}
          >
            <span>✓</span>
            <span>调研完成 · 进入提炼阶段...</span>
          </div>
          <div
            style={{
              opacity: sourceSummaryOpacity,
              color: C.textMuted,
              fontFamily: MONO,
              fontSize: 17,
            }}
          >
            wikipedia · wikiquote · 2 sources saved · 2 blocked (403)
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
