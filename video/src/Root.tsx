import React from "react";
import { Composition } from "remotion";
import { SkillEveryone, VIDEO_FPS, VIDEO_FRAMES } from "./SkillEveryone";
import "./fonts";

export const Root: React.FC = () => {
  return (
    <Composition
      id="SkillEveryone"
      component={SkillEveryone}
      durationInFrames={VIDEO_FRAMES}
      fps={VIDEO_FPS}
      width={1920}
      height={1080}
    />
  );
};
