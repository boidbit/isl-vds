import React from "react";
import { Composition } from "remotion";
import { StoryVideo } from "./engine/StoryVideo";
import { computeStoryTiming } from "./engine/timeline";
import { STORIES } from "./stories";
import { DEMO_2D_FRAMES, Demo2D } from "./two-d/Demo2D";
import { FilmPlayer, loadFilmMetadata, type FilmPlayerProps } from "./two-d/film/FilmPlayer";
import { FILMS } from "./two-d/films";
import { compositionId, thumbnailId } from "./two-d/film/schema";
import { Thumbnail, thumbnailSize } from "./two-d/film/Thumbnail";
import { DesertGallery } from "./two-d/library/DesertGallery";
import { MountainGallery } from "./two-d/library/MountainGallery";
import { VillageGallery } from "./two-d/library/VillageGallery";

// Each story gets two compositions: landscape for YouTube and portrait for Shorts.
export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(FILMS).flatMap(([id, { film }]) =>
      film.languages.map((lang) => (
      <Composition
        key={`${id}-${lang}`}
        id={compositionId(id, lang)}
        component={FilmPlayer}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={300}
        defaultProps={{ filmId: id, timing: null, lang }}
        calculateMetadata={async ({ props }: { props: FilmPlayerProps }) => {
          const meta = await loadFilmMetadata(props.filmId, props.lang);
          return { durationInFrames: meta.durationInFrames, fps: meta.fps, width: meta.width, height: meta.height, props: { ...props, timing: meta.timing } };
        }}
      />
      )),
    )}
    {Object.entries(FILMS).flatMap(([id, { film }]) =>
      film.thumbnail
        ? film.languages.map((lang) => (
            <Composition key={`thumb-${id}-${lang}`} id={thumbnailId(id, lang)} component={Thumbnail} durationInFrames={1} fps={30} {...thumbnailSize(id)} defaultProps={{ filmId: id, lang }} />
          ))
        : [],
    )}
    <Composition id="library-village" component={VillageGallery} durationInFrames={90} fps={30} width={1920} height={1080} />
    <Composition id="library-mountain" component={MountainGallery} durationInFrames={90} fps={30} width={1920} height={1080} />
    <Composition id="library-desert" component={DesertGallery} durationInFrames={90} fps={30} width={1920} height={1080} />
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
