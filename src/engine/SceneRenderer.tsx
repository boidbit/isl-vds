import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { Dog } from "../library/characters/Dog";
import { blendDogPose, evaluateDogClip } from "../library/characters/dogAnimations";
import { Human, type HeldProp } from "../library/characters/Human";
import { blendHumanPose, evaluateHumanClip } from "../library/characters/humanAnimations";
import type { DogLook, HumanLook } from "../library/characters/presets";
import { ENVIRONMENTS } from "../library/environments";
import { Desert, WELL_LAYOUT } from "../library/locations/Desert";
import { Sky } from "../library/locations/Sky";
import { PropNode } from "../library/props/Props";
import { computeCamera } from "./camera";
import type { ResolvedCast } from "./cast";
import type { Scene } from "./schema";
import { evaluateActor } from "./timeline";

const isPouring = (pour: boolean | [number, number] | undefined, t: number) =>
  Array.isArray(pour) ? t >= pour[0] && t <= pour[1] : !!pour;

const CameraRig: React.FC<{ position: [number, number, number]; lookAt: [number, number, number]; fov: number }> = ({
  position,
  lookAt,
  fov,
}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // Mutate synchronously during render: Remotion renders exactly once per frame.
  camera.position.set(...position);
  camera.lookAt(...lookAt);
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
};

const Lights: React.FC<{ env: (typeof ENVIRONMENTS)[string]; focus: [number, number, number] }> = ({ env, focus }) => {
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight(env.sunColor, env.sunIntensity);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const c = l.shadow.camera;
    c.left = -14;
    c.right = 14;
    c.top = 14;
    c.bottom = -14;
    c.near = 1;
    c.far = 140;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    l.shadow.radius = 4;
    return l;
  }, [env]);
  // Keep the shadow frustum centred on the action so shadows stay crisp.
  const dir = new THREE.Vector3(...env.sunPosition).normalize().multiplyScalar(60);
  light.position.set(focus[0] + dir.x, focus[1] + dir.y, focus[2] + dir.z);
  light.target.position.set(...focus);
  light.target.updateMatrixWorld();
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
      <hemisphereLight args={[env.hemiSky, env.hemiGround, env.hemiIntensity]} />
    </>
  );
};

export const SceneRenderer: React.FC<{ scene: Scene; time: number; cast: ResolvedCast; aspect: number }> = ({
  scene,
  time,
  cast,
  aspect,
}) => {
  const env = ENVIRONMENTS[scene.environment];
  const gl = useThree((s) => s.gl);
  gl.toneMappingExposure = env.exposure;

  const cam = computeCamera(scene, time, { height: (id) => cast[id]?.height ?? 1.75 }, aspect);
  const states = scene.actors.map((a) => evaluateActor(a, scene, time));
  const focus: [number, number, number] = [cam.lookAt[0], 0, cam.lookAt[2]];

  return (
    <>
      <color attach="background" args={[env.fog]} />
      <fog attach="fog" args={[env.fog, env.fogNear, env.fogFar]} />
      <CameraRig {...cam} />
      <Lights env={env} focus={focus} />
      <Sky env={env} />
      <Desert env={env} />
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
          return (
            <Human key={st.id} look={member.look as HumanLook} pose={pose} position={st.position} yaw={st.yaw} held={held} time={time} />
          );
        }
        const cur = evaluateDogClip(st.current.clip, st.current.ctx);
        const pose = st.from ? blendDogPose(evaluateDogClip(st.from.clip, st.from.ctx), cur, st.blend) : cur;
        return <Dog key={st.id} look={member.look as DogLook} pose={pose} position={st.position} yaw={st.yaw} />;
      })}
    </>
  );
};
