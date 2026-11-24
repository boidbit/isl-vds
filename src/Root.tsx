import React from "react";
import { Composition } from "remotion";
import { StoryVideo } from "./engine/StoryVideo";
import { computeStoryTiming } from "./engine/timeline";
import { STORIES } from "./stories";
import { DEMO_2D_FRAMES, Demo2D } from "./two-d/Demo2D";
import { FILM_FRAMES, PyasaKuttaFilm } from "./two-d/films/PyasaKuttaFilm";

// Each story gets two compositions: landscape for YouTube and portrait for Shorts.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="pyasa-kutta-2d" component={PyasaKuttaFilm} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="demo-2d" component={Demo2D} durationInFrames={DEMO_2D_FRAMES} fps={30} width={1920} height={1080} />
    {STORIES.map((story) => {
      const { totalFrames } = computeStoryTiming(story);
      return (
        <React.Fragment key={story.id}>
          <Composition
            id={story.id}
            component={StoryVideo}
            durationInFrames={totalFrames}
            fps={story.fps}
            width={1920}
            height={1080}
            defaultProps={{ story }}
          />
          <Composition
            id={`${story.id}-short`}
            component={StoryVideo}
            durationInFrames={totalFrames}
            fps={story.fps}
            width={1080}
            height={1920}
            defaultProps={{ story }}
          />
        </React.Fragment>
      );
    })}
  </>
);
