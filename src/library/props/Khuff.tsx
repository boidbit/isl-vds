import React from "react";
import { material } from "../materials";

/** A leather sock (khuff), the man's only "bucket" in the hadith. Origin = top opening. */
export const Khuff: React.FC<{ wet?: boolean }> = ({ wet }) => {
  const leather = material(wet ? "#4a2e1a" : "#6b4426", { roughness: wet ? 0.45 : 0.85 });
  return (
    <group>
      <mesh castShadow material={leather} position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.05, 0.045, 0.2, 12]} />
      </mesh>
      <mesh castShadow material={leather} position={[0, -0.2, 0.05]} rotation={[Math.PI / 2.4, 0, 0]}>
        <capsuleGeometry args={[0.045, 0.1, 4, 10]} />
      </mesh>
      <mesh material={material("#2a1a10")} position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.046, 12]} />
      </mesh>
    </group>
  );
};

/** Thin stream of water falling straight down from the origin. */
export const WaterStream: React.FC<{ length?: number; time: number }> = ({ length = 0.45, time }) => {
  const flicker = 0.85 + Math.sin(time * 40) * 0.15;
  return (
    <group>
      <mesh position={[0, -length / 2, 0]} scale={[flicker, 1, flicker]} material={material("#bfe4f2", { opacity: 0.75, roughness: 0.1 })}>
        <cylinderGeometry args={[0.012, 0.02, length, 8, 1, true]} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const y = -(((time * 2.2 + i / 3) % 1) * length);
        return (
          <mesh key={i} position={[Math.sin(i * 7) * 0.01, y, 0]} material={material("#e2f5fb", { opacity: 0.85, roughness: 0.1 })}>
            <sphereGeometry args={[0.016, 6, 6]} />
          </mesh>
        );
      })}
    </group>
  );
};
