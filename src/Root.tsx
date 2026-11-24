import React from "react";
import { Composition } from "remotion";
import { StoryVideo } from "./engine/StoryVideo";
import { computeStoryTiming } from "./engine/timeline";
import { STORIES } from "./stories";
import { DEMO_2D_FRAMES, Demo2D } from "./two-d/Demo2D";
import { FilmPlayer, loadFilmMetadata, type FilmPlayerProps } from "./two-d/film/FilmPlayer";
import { FILMS } from "./two-d/films";

// Each story gets two compositions: landscape for YouTube and portrait for Shorts.
export const RemotionRoot: React.FC = () => (
  <>
    {Object.keys(FILMS).map((id) => (
      <Composition
        key={id}
        id={`film-${id}`}
        component={FilmPlayer}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={300}
        defaultProps={{ filmId: id, timing: null }}
        calculateMetadata={async ({ props }: { props: FilmPlayerProps }) => {
          const meta = await loadFilmMetadata(props.filmId);
          return { durationInFrames: meta.durationInFrames, fps: meta.fps, props: { ...props, timing: meta.timing } };
        }}
      />
    ))}
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
