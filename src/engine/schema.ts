// Story JSON format. Claude (or a human) writes one of these per story;
// the engine turns it into a video. See stories/pyasa-kutta.json for an example.

import { z } from "zod";
import {
  ANIMATIONS,
  CAMERA_MOVES,
  CAMERA_SHOTS,
  CHARACTER_TYPES,
  ENVIRONMENT_NAMES,
  HOLDABLE,
  HOLD_SLOTS,
  LOCATIONS,
  PRESETS,
  PROPS,
} from "../library/catalog";

const Vec3 = z.tuple([z.number(), z.number(), z.number()]);

/** Facing: degrees (0 = +Z, 90 = +X) or the id of another actor to look at. */
const Facing = z.union([z.number(), z.string()]);

export const ActionSchema = z.object({
  type: z.string(),
  start: z.number().min(0),
  duration: z.number().positive(),
  /** Move to this point over the action. */
  to: Vec3.optional(),
  /** Or move through several waypoints. */
  path: z.array(Vec3).min(1).optional(),
  face: Facing.optional(),
  hold: z.object({ prop: z.enum(HOLDABLE), slot: z.enum(HOLD_SLOTS) }).optional(),
  /** Show water pouring from the held prop: always (true) or between [from, to] seconds into the action. */
  pour: z.union([z.boolean(), z.tuple([z.number().min(0), z.number().positive()])]).optional(),
});

export const SceneActorSchema = z.object({
  id: z.string(),
  at: Vec3,
  face: Facing.optional(),
  actions: z.array(ActionSchema).default([]),
});

export const CameraShotSchema = z.object({
  start: z.number().min(0).default(0),
  shot: z.enum(CAMERA_SHOTS),
  target: z.union([z.string(), z.array(z.string()).min(1)]).optional(),
  /** Degrees around the target relative to where it faces: 0 front, 90 its left side, 180 behind. */
  angle: z.number().optional(),
  move: z.enum(CAMERA_MOVES).default("follow"),
  /** Strength of the move (degrees for orbit, metres for crane). */
  amount: z.number().optional(),
  /** World point to frame instead of an actor (for establishing shots). */
  lookAt: Vec3.optional(),
});

export const PropSchema = z.object({
  type: z.enum(PROPS),
  at: Vec3,
  scale: z.number().positive().default(1),
  rotation: z.number().default(0),
  /** Seconds into the scene when the prop appears (e.g. a puddle forming). */
  appear: z.number().min(0).optional(),
});

const SubtitleSchema = z.object({
  text: z.string(),
  start: z.number().min(0).optional(),
  end: z.number().positive().optional(),
});

export const SceneSchema = z.object({
  id: z.string(),
  location: z.enum(LOCATIONS),
  environment: z.string(),
  duration: z.number().positive(),
  title: z.string().optional(),
  /** Narration text for the voice-over (not rendered on screen). */
  narration: z.string().optional(),
  subtitles: z.union([z.string(), z.array(SubtitleSchema)]).optional(),
  transition: z.enum(["cut", "fade"]).default("cut"),
  props: z.array(PropSchema).default([]),
  actors: z.array(SceneActorSchema).default([]),
  camera: z.union([CameraShotSchema, z.array(CameraShotSchema).min(1)]),
});

export const CastMemberSchema = z.object({
  type: z.enum(CHARACTER_TYPES),
  preset: z.string(),
  name: z.string().optional(),
  overrides: z.record(z.union([z.string(), z.number(), z.null()])).optional(),
});

export const StorySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "use lowercase-kebab-case"),
  title: z.string(),
  language: z.string().default("hi-Latn"),
  fps: z.number().int().min(12).max(60).default(30),
  source: z.object({
    type: z.enum(["quran", "hadith", "seerah", "moral-tale"]),
    references: z.array(z.string()).min(1),
    summary: z.string(),
    verified: z.boolean(),
    verifiedBy: z.string().optional(),
  }),
  audio: z
    .object({
      ambience: z.string().optional(),
      ambienceVolume: z.number().min(0).max(1).default(0.35),
      narration: z.string().optional(),
    })
    .default({}),
  cast: z.record(CastMemberSchema),
  scenes: z.array(SceneSchema).min(1),
  endCard: z
    .object({
      duration: z.number().positive().default(5),
      lines: z.array(z.string()).min(1),
    })
    .optional(),
});

export type Story = z.infer<typeof StorySchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type SceneActor = z.infer<typeof SceneActorSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type CameraShot = z.infer<typeof CameraShotSchema>;
export type Prop = z.infer<typeof PropSchema>;

export type StoryIssue = { path: string; message: string };

/**
 * Parse + semantic checks the type system cannot express:
 * unknown cast ids, animations a character type does not have, actions that
 * overflow their scene, overlapping actions, camera targets that are not in the scene.
 */
export const checkStory = (input: unknown): { story?: Story; issues: StoryIssue[] } => {
  const parsed = StorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    };
  }
  const story = parsed.data;
  const issues: StoryIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });

  for (const [id, member] of Object.entries(story.cast)) {
    if (!PRESETS[member.type].includes(member.preset)) {
      add(`cast.${id}.preset`, `unknown ${member.type} preset "${member.preset}" (have: ${PRESETS[member.type].join(", ")})`);
    }
  }

  const sceneIds = new Set<string>();
  story.scenes.forEach((scene, si) => {
    const sp = `scenes[${si}:${scene.id}]`;
    if (sceneIds.has(scene.id)) add(sp, `duplicate scene id "${scene.id}"`);
    sceneIds.add(scene.id);

    if (!ENVIRONMENT_NAMES.includes(scene.environment)) {
      add(`${sp}.environment`, `unknown environment "${scene.environment}" (have: ${ENVIRONMENT_NAMES.join(", ")})`);
    }

    const actorIds = new Set<string>();
    scene.actors.forEach((actor, ai) => {
      const ap = `${sp}.actors[${ai}:${actor.id}]`;
      const member = story.cast[actor.id];
      if (!member) {
        add(ap, `"${actor.id}" is not in the cast`);
        return;
      }
      if (actorIds.has(actor.id)) add(ap, "actor listed twice in the same scene");
      actorIds.add(actor.id);

      const sorted = [...actor.actions].sort((a, b) => a.start - b.start);
      sorted.forEach((action, i) => {
        const p = `${ap}.actions[${action.type}@${action.start}s]`;
        if (!ANIMATIONS[member.type].includes(action.type)) {
          add(p, `${member.type} has no animation "${action.type}" (have: ${ANIMATIONS[member.type].join(", ")})`);
        }
        if (action.start + action.duration > scene.duration + 1e-6) {
          add(p, `ends at ${action.start + action.duration}s but the scene is only ${scene.duration}s`);
        }
        const next = sorted[i + 1];
        if (next && action.start + action.duration > next.start + 1e-6) {
          add(p, `overlaps the next action "${next.type}" starting at ${next.start}s`);
        }
        if (action.to && action.path) add(p, "use either `to` or `path`, not both");
        if (typeof action.face === "string" && !scene.actors.some((a) => a.id === action.face)) {
          add(p, `faces "${action.face}" who is not in this scene`);
        }
        if (action.hold && member.type !== "human") add(p, "only humans can hold props");
      });
    });

    const shots = Array.isArray(scene.camera) ? scene.camera : [scene.camera];
    shots.forEach((shot, ci) => {
      const cp = `${sp}.camera[${ci}]`;
      const targets = shot.target === undefined ? [] : Array.isArray(shot.target) ? shot.target : [shot.target];
      targets.forEach((t) => {
        if (!actorIds.has(t)) add(cp, `camera target "${t}" is not an actor in this scene`);
      });
      if (!shot.lookAt && targets.length === 0 && scene.actors.length === 0) {
        add(cp, "camera needs a target or lookAt when the scene has no actors");
      }
      if ((shot.shot === "two-shot" || shot.shot === "over-shoulder") && targets.length < 2) {
        add(cp, `"${shot.shot}" needs two targets`);
      }
      if (shot.start >= scene.duration) add(cp, `starts at ${shot.start}s, after the scene ends`);
    });

    if (Array.isArray(scene.subtitles)) {
      scene.subtitles.forEach((s, i) => {
        if ((s.end ?? scene.duration) > scene.duration + 1e-6) add(`${sp}.subtitles[${i}]`, "ends after the scene");
      });
    }
  });

  if (story.source.type === "hadith" || story.source.type === "quran") {
    if (!story.source.verified) {
      add("source.verified", "WARNING: religious source not yet verified by a human. Check every reference before publishing.");
    }
  }

  return { story, issues };
};

/** Issues that only warn (rendering still allowed). */
export const isWarning = (issue: StoryIssue) => issue.message.startsWith("WARNING");
