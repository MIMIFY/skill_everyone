import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile, interpolate } from "remotion";
import { C, SANS } from "./theme";
import { Intro } from "./scenes/Intro";
import { Terminal } from "./scenes/Terminal";
import { Research } from "./scenes/Research";
import { Modeling } from "./scenes/Modeling";
import { Generated } from "./scenes/Generated";
import { Chat } from "./scenes/Chat";
import { Outro } from "./scenes/Outro";

export const VIDEO_FPS = 30;
export const VIDEO_FRAMES = 1780; // 59.3 seconds

export const TIMELINE = {
  INTRO:     [0,    200],  //  0s –  6.7s  (extended for 5.8s narration)
  TERMINAL:  [200,  440],  //  6.7s – 14.7s
  RESEARCH:  [440,  740],  // 14.7s – 24.7s
  MODELING:  [740, 1010],  // 24.7s – 33.7s
  GENERATED: [1010, 1160], // 33.7s – 38.7s
  CHAT:      [1160, 1640], // 38.7s – 54.7s
  OUTRO:     [1640, 1780], // 54.7s – 59.3s
} as const;

// 旁白触发帧（全局帧号）
// Audio durations (MPEG2 L3 @24kHz, measured via frame count):
//   intro: 175f  terminal: 158f  research: 122f  modeling: 160f
//   generated: 108f  chat_pre: 55f  chat_post: 91f  outro: 99f
const N = {
  INTRO:        0,    //  0.0s  开场
  TERMINAL:   250,    //  8.3s  终端场景稳定后 (after intro narration ends ~215f)
  RESEARCH:   480,    // 16.0s  调研进行中
  MODELING:   780,    // 26.0s  建模开始后
  GENERATED: 1030,    // 34.3s  建模完成，角色成形
  CHAT_PRE:  1195,    // 39.8s  对话刚出现
  CHAT_POST: 1540,    // 51.3s  最后一行落下后
  OUTRO:     1675,    // 55.8s  结尾
} as const;

// BGM 音量曲线：在每段旁白播放时压低，让人声清晰
const bgmVolume = (frame: number): number => {
  const duck = (f: number, start: number, dur: number, lo: number, hi: number) =>
    interpolate(f, [start - 10, start, start + dur, start + dur + 20], [hi, lo, lo, hi], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // 开场淡入
  if (frame < 30) return interpolate(frame, [0, 30], [0, 0.16], { extrapolateRight: "clamp" });

  // 各旁白段压低 BGM（window = 实际音频时长 + 少量余量）
  if (frame >= N.INTRO      && frame < N.INTRO      + 220) return duck(frame, N.INTRO,      175, 0.10, 0.18);
  if (frame >= N.TERMINAL   && frame < N.TERMINAL   + 200) return duck(frame, N.TERMINAL,   158, 0.10, 0.26);
  if (frame >= N.RESEARCH   && frame < N.RESEARCH   + 165) return duck(frame, N.RESEARCH,   122, 0.10, 0.28);
  if (frame >= N.MODELING   && frame < N.MODELING   + 205) return duck(frame, N.MODELING,   160, 0.10, 0.30);
  if (frame >= N.GENERATED  && frame < N.GENERATED  + 150) return duck(frame, N.GENERATED,  108, 0.10, 0.28);
  if (frame >= N.CHAT_PRE   && frame < N.CHAT_PRE   + 100) return duck(frame, N.CHAT_PRE,    55, 0.10, 0.14);
  if (frame >= N.CHAT_POST  && frame < N.CHAT_POST  + 135) return duck(frame, N.CHAT_POST,   91, 0.08, 0.12);
  if (frame >= N.OUTRO      && frame < N.OUTRO       + 110) return duck(frame, N.OUTRO,       99, 0.08, 0.18);

  // 各场景基础音量
  if (frame < 200)  return 0.18;  // Intro
  if (frame < 440)  return 0.26;  // Terminal
  if (frame < 740)  return 0.28;  // Research
  if (frame < 1010) return 0.30;  // Modeling（情绪高峰）
  if (frame < 1160) return 0.28;  // Generated
  if (frame < 1640) return 0.14;  // Chat（整体偏低）
  return interpolate(frame, [1640, 1780], [0.18, 0]); // Outro 淡出
};

export const SkillEveryone: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS }}>

      {/* 点阵背景 */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        backgroundPosition: "24px 24px",
      }} />

      {/* 环境光 — 左上紫 */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 60% 40% at 15% 20%, rgba(139,92,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* 环境光 — 右下青 */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 50% 35% at 85% 80%, rgba(6,182,212,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── BGM ── */}
      <Audio src={staticFile("audio/bgm.mp3")} volume={bgmVolume} />

      {/* ── 旁白轨道（8条）── */}

      {/* 1. 开场 0s："有些人，用一生写了一封信。收信人，只有一个。" (175f = 5.8s) */}
      <Sequence from={N.INTRO} durationInFrames={215}>
        <Audio src={staticFile("audio/narration_intro_yunxi.mp3")} volume={0.8} />
      </Sequence>

      {/* 2. 终端 8.3s："他从不说爱。但他做了，所有爱会做的事。" (158f = 5.3s) */}
      <Sequence from={N.TERMINAL} durationInFrames={198}>
        <Audio src={staticFile("audio/narration_terminal.mp3")} volume={0.8} />
      </Sequence>

      {/* 3. 调研 16.0s："每一个能找到他的地方，我们都去了。" (122f = 4.1s) */}
      <Sequence from={N.RESEARCH} durationInFrames={162}>
        <Audio src={staticFile("audio/narration_research.mp3")} volume={0.8} />
      </Sequence>

      {/* 4. 建模 26.0s："不是模仿他的语气，是理解他为什么这样说话。" (160f = 5.3s) */}
      <Sequence from={N.MODELING} durationInFrames={200}>
        <Audio src={staticFile("audio/narration_modeling.mp3")} volume={0.8} />
      </Sequence>

      {/* 5. 生成 34.3s："就这样，他从记忆里走了出来。" (108f = 3.6s) */}
      <Sequence from={N.GENERATED} durationInFrames={148}>
        <Audio src={staticFile("audio/narration_generated.mp3")} volume={0.8} />
      </Sequence>

      {/* 6. 对话前 39.8s："问他吧。" (55f = 1.8s) */}
      <Sequence from={N.CHAT_PRE} durationInFrames={95}>
        <Audio src={staticFile("audio/narration_chat_pre.mp3")} volume={0.8} />
      </Sequence>

      {/* 7. 对话后 51.3s："二十一年，一个动作。" (91f = 3.0s) */}
      <Sequence from={N.CHAT_POST} durationInFrames={131}>
        <Audio src={staticFile("audio/narration_chat_post.mp3")} volume={0.8} />
      </Sequence>

      {/* 8. 结尾 55.8s："你也可以，召唤任何人。" (99f = 3.3s) */}
      <Sequence from={N.OUTRO} durationInFrames={105}>
        <Audio src={staticFile("audio/narration_outro_yunxi.mp3")} volume={0.8} />
      </Sequence>

      {/* ── 场景 ── */}
      <Sequence from={TIMELINE.INTRO[0]}     durationInFrames={TIMELINE.INTRO[1]     - TIMELINE.INTRO[0]}>     <Intro />     </Sequence>
      <Sequence from={TIMELINE.TERMINAL[0]}  durationInFrames={TIMELINE.TERMINAL[1]  - TIMELINE.TERMINAL[0]}>  <Terminal />  </Sequence>
      <Sequence from={TIMELINE.RESEARCH[0]}  durationInFrames={TIMELINE.RESEARCH[1]  - TIMELINE.RESEARCH[0]}>  <Research />  </Sequence>
      <Sequence from={TIMELINE.MODELING[0]}  durationInFrames={TIMELINE.MODELING[1]  - TIMELINE.MODELING[0]}>  <Modeling />  </Sequence>
      <Sequence from={TIMELINE.GENERATED[0]} durationInFrames={TIMELINE.GENERATED[1] - TIMELINE.GENERATED[0]}> <Generated /> </Sequence>
      <Sequence from={TIMELINE.CHAT[0]}      durationInFrames={TIMELINE.CHAT[1]      - TIMELINE.CHAT[0]}>      <Chat />      </Sequence>
      <Sequence from={TIMELINE.OUTRO[0]}     durationInFrames={TIMELINE.OUTRO[1]     - TIMELINE.OUTRO[0]}>     <Outro />     </Sequence>

    </AbsoluteFill>
  );
};
