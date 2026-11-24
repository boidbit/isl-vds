import { useFrame, useThree } from "@react-three/fiber";
import * as PP from "postprocessing";
import React, { useMemo } from "react";
import * as THREE from "three";
import { Dog } from "../library/characters/Dog";
import { blendDogPose, evaluateDogClip } from "../library/characters/dogAnimations";
import { Human, type HeldProp } from "../library/characters/Human";
import { blendHumanPose, evaluateHumanClip } from "../library/characters/humanAnimations";
import type { DogLook, HumanLook } from "../library/characters/presets";
import { ENVIRONMENTS, type EnvironmentPreset } from "../library/environments";
import { Desert, DustMotes, WELL_LAYOUT } from "../library/locations/Desert";
import { Sky } from "../library/locations/Sky";
import { PropNode } from "../library/props/Props";
import { computeCamera, type CameraFrame } from "./camera";
import type { ResolvedCast } from "./cast";
import type { Vec3 } from "./math";
import type { Scene } from "./schema";
import { evaluateActor } from "./timeline";

const isPouring = (pour: boolean | [number, number] | undefined, t: number) =>
  Array.isArray(pour) ? t >= pour[0] && t <= pour[1] : !!pour;

const CameraRig: React.FC<{ cam: CameraFrame }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // Mutate synchronously during render: Remotion renders exactly once per frame.
  camera.position.set(...cam.position);
  camera.lookAt(...cam.lookAt);
  if (camera.fov !== cam.fov || camera.near !== 0.05) {
    camera.fov = cam.fov;
    camera.near = 0.05;
    camera.far = 1200;
    camera.updateProjectionMatrix();
  }
  return null;
};

/**
 * Three-light storybook setup:
 *  - key: warm sun with soft shadows, frustum follows the action
 *  - rim: warm light from behind the subject (relative to camera) to carve silhouettes
 *  - fill: lavender sky / warm sand hemisphere so shadows are coloured, never grey
 */
const Lights: React.FC<{ env: EnvironmentPreset; focus: Vec3; camera: Vec3 }> = ({ env, focus, camera }) => {
  const key = useMemo(() => {
    const l = new THREE.DirectionalLight(env.sunColor, env.sunIntensity);
    l.castShadow = true;
    l.shadow.mapSize.set(1536, 1536);
    const c = l.shadow.camera;
    c.left = -12;
    c.right = 12;
    c.top = 12;
    c.bottom = -12;
    c.near = 1;
    c.far = 140;
    l.shadow.bias = -0.0003;
    l.shadow.normalBias = 0.025;
    l.shadow.radius = 7;
    l.shadow.blurSamples = 8;
    return l;
  }, [env]);
  const rim = useMemo(() => new THREE.DirectionalLight(env.rimColor, env.rimIntensity), [env]);
  // Soft warm fill from the camera side: keeps backlit faces and robes readable.
  const fill = useMemo(() => new THREE.DirectionalLight(env.sunGlow, env.hemiIntensity * 1.1), [env]);

  const sunDir = new THREE.Vector3(...env.sunPosition).normalize().multiplyScalar(60);
  key.position.set(focus[0] + sunDir.x, focus[1] + sunDir.y, focus[2] + sunDir.z);
  key.target.position.set(...focus);
  key.target.updateMatrixWorld();

  const away = new THREE.Vector3(focus[0] - camera[0], 0, focus[2] - camera[2]).normalize();
  rim.position.set(focus[0] + away.x * 10, focus[1] + 3, focus[2] + away.z * 10);
  rim.target.position.set(...focus);
  rim.target.updateMatrixWorld();
  fill.position.set(camera[0] - away.x * 4, focus[1] + 2.5, camera[2] - away.z * 4);
  fill.target.position.set(...focus);
  fill.target.updateMatrixWorld();

  return (
    <>
      <primitive object={key} />
      <primitive object={key.target} />
      <primitive object={rim} />
      <primitive object={rim.target} />
      <primitive object={fill} />
      <primitive object={fill.target} />
      <hemisphereLight args={[env.hemiSky, env.hemiGround, env.hemiIntensity]} />
    </>
  );
};

/**
 * Cinematic post stack driven manually (the R3F wrapper does not render inside
 * Remotion's headless frame loop): depth of field on the subject, soft bloom,
 * ACES tone mapping, gentle grade, vignette, SMAA.
 */
const PostFX: React.FC<{ env: EnvironmentPreset; cam: CameraFrame }> = ({ env, cam }) => {
  const { gl, scene, camera } = useThree();
  const fx = useMemo(() => {
    const composer = new PP.EffectComposer(gl, { frameBufferType: THREE.HalfFloatType });
    composer.addPass(new PP.RenderPass(scene, camera));
    const dof = new PP.DepthOfFieldEffect(camera, { worldFocusRange: 2, bokehScale: 4.5, resolutionScale: 0.5 });
    dof.target = new THREE.Vector3();
    const bloom = new PP.BloomEffect({ intensity: env.grade.bloom, luminanceThreshold: 0.78, luminanceSmoothing: 0.25, mipmapBlur: true, radius: 0.7 });
    const tone = new PP.ToneMappingEffect({ mode: PP.ToneMappingMode.ACES_FILMIC });
    const hue = new PP.HueSaturationEffect({ saturation: env.grade.saturation });
    const bc = new PP.BrightnessContrastEffect({ brightness: env.grade.brightness, contrast: env.grade.contrast });
    const vignette = new PP.VignetteEffect({ offset: 0.32, darkness: env.grade.vignette });
    const smaa = new PP.SMAAEffect();
    composer.addPass(new PP.EffectPass(camera, dof));
    composer.addPass(new PP.EffectPass(camera, bloom, tone, hue, bc, vignette, smaa));
    return { composer, dof };
  }, [gl, scene, camera, env]);

  const size = gl.getSize(new THREE.Vector2());
  fx.composer.setSize(size.x, size.y, false);
  const focusDist = Math.hypot(cam.focus[0] - cam.position[0], cam.focus[1] - cam.position[1], cam.focus[2] - cam.position[2]);
  fx.dof.target!.set(...cam.focus);
  fx.dof.cocMaterial.worldFocusRange = Math.max(0.9, focusDist * 0.32);

  useFrame(() => {
    fx.composer.render();
  }, 1);
  return null;
};

export const SceneRenderer: React.FC<{ scene: Scene; time: number; cast: ResolvedCast; aspect: number; postFx?: boolean }> = ({
  scene,
  time,
  cast,
  aspect,
  postFx = true,
}) => {
  const env = ENVIRONMENTS[scene.environment];
  const gl = useThree((s) => s.gl);
  gl.toneMappingExposure = env.exposure;
  gl.shadowMap.type = THREE.VSMShadowMap;

  const cam = computeCamera(scene, time, { height: (id) => cast[id]?.height ?? 1.75 }, aspect);
  const states = scene.actors.map((a) => evaluateActor(a, scene, time));
  const focus: Vec3 = [cam.focus[0], 0, cam.focus[2]];

  return (
    <>
      <color attach="background" args={[env.fog]} />
      <fog attach="fog" args={[env.fog, env.fogNear, env.fogFar]} />
      <CameraRig cam={cam} />
      <Lights env={env} focus={focus} camera={cam.position} />
      <Sky env={env} />
      <Desert env={env} time={time} />
      <DustMotes env={env} center={focus} time={time} />
      {scene.location === "registan-kuan" && WELL_LAYOUT.map((p, i) => <PropNode key={`l${i}`} prop={p} time={time} />)}
      {scene.props.map((p, i) => (
        <PropNode key={`p${i}`} prop={p} time={time} />
      ))}
      {states.map((st) => {
        const member = cast[st.id];
        if (!member) return null;
        if (member.type === "human") {
          const cur = evaluateHumanClip(st.current.clip, st.current.ctx);
          const pose = st.from ? blendHumanPose(evaluateHumanClip(st.from.clip, st.from.ctx), cur, st.blend) : cur;
          const held: HeldProp | undefined = st.action?.hold
            ? { prop: st.action.hold.prop, slot: st.action.hold.slot, pour: isPouring(st.action.pour, st.current.ctx.t) }
            : undefined;
          return <Human key={st.id} look={member.look as HumanLook} pose={pose} position={st.position} yaw={st.yaw} held={held} time={time} />;
        }
        const cur = evaluateDogClip(st.current.clip, st.current.ctx);
        const pose = st.from ? blendDogPose(evaluateDogClip(st.from.clip, st.from.ctx), cur, st.blend) : cur;
        return <Dog key={st.id} look={member.look as DogLook} pose={pose} position={st.position} yaw={st.yaw} />;
      })}
      {postFx && <PostFX env={env} cam={cam} />}
    </>
  );
};
