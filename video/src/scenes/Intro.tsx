import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, SANS } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // 第一句随配音出现："有些人，用一生写了一封信。"
  const line1Opacity = interpolate(frame, [5, 32], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [5, 32], [20, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // 第二句跟上："收信人，只有一个。" (~第3.2s=96f处开始说)
  const line2Opacity = interpolate(frame, [92, 112], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [92, 112], [16, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // 分隔线
  const dividerW = interpolate(frame, [108, 135], [0, 180], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // 项目标语淡入："那些陪伴过你的角色，不该只活在记忆里"
  const taglineOpacity = interpolate(frame, [122, 145], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // skill 标签
  const badgeOpacity = interpolate(frame, [138, 158], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // 整场淡出（Intro scene 共 200 帧）
  const sceneOpacity = interpolate(frame, [165, 200], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: sceneOpacity,
      }}
    >
      {/* 配音同步文字 */}
      <div
        style={{
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          fontSize: 42,
          fontWeight: 300,
          color: C.textSub,
          letterSpacing: 5,
          fontFamily: SANS,
          textAlign: "center",
        }}
      >
        有些人，用一生写了一封信。
      </div>

      <div
        style={{
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          fontSize: 42,
          fontWeight: 300,
          color: C.textSub,
          letterSpacing: 5,
          marginTop: 10,
          fontFamily: SANS,
          textAlign: "center",
        }}
      >
        收信人，只有一个。
      </div>

      {/* 分隔线 */}
      <div
        style={{
          width: dividerW,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.purple}, transparent)`,
          marginTop: 32,
        }}
      />

      {/* 项目标语 */}
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 22,
          fontSize: 56,
          fontWeight: 300,
          color: C.text,
          letterSpacing: 8,
          fontFamily: SANS,
          textAlign: "center",
        }}
      >
        那些陪伴过你的角色
      </div>
      <div
        style={{
          opacity: taglineOpacity,
          fontSize: 34,
          fontWeight: 300,
          color: C.textSub,
          letterSpacing: 4,
          marginTop: 12,
          fontFamily: SANS,
        }}
      >
        不该只活在记忆里
      </div>

      {/* skill 标签 */}
      <div
        style={{
          opacity: badgeOpacity,
          marginTop: 28,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: C.textMuted,
          fontSize: 16,
          letterSpacing: 3,
          fontFamily: SANS,
          textTransform: "uppercase",
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.purple, boxShadow: `0 0 8px ${C.purpleGlow}` }} />
        skill-everyone · /summon
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.purple, boxShadow: `0 0 8px ${C.purpleGlow}` }} />
      </div>
    </AbsoluteFill>
  );
};
