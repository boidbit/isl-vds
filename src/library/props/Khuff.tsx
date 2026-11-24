import React from "react";
import { material } from "../materials";

/** A leather sock (khuff), the man's only "bucket" in the hadith. Origin = top opening. */
export const Khuff: React.FC<{ wet?: boolean }> = ({ wet }) => {
  const leather = material(wet ? "#8a5634" : "#a06a40", { roughness: wet ? 0.4 : 0.8 });
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
      <mesh position={[0, -length / 2, 0]} scale={[flicker, 1, flicker]} material={material("#cdeefa", { opacity: 0.7, roughness: 0.05, emissive: "#6fb3d0" })}>
        <cylinderGeometry args={[0.005, 0.011, length, 10, 1, true]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = -(((time * 2.6 + i / 5) % 1) * length);
        return (
          <mesh key={i} position={[Math.sin(i * 7 + time * 3) * 0.008, y, Math.cos(i * 5) * 0.006]} material={material("#e8f8ff", { opacity: 0.9, roughness: 0.05, emissive: "#7fc0dc" })}>
            <sphereGeometry args={[0.007 + (i % 2) * 0.003, 8, 6]} />
          </mesh>
        );
      })}
      {/* splash ring where it lands */}
      <mesh position={[0, -length + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1 + Math.sin(time * 9) * 0.15} material={material("#e8f8ff", { opacity: 0.55, roughness: 0.05, emissive: "#7fc0dc" })}>
        <ringGeometry args={[0.02, 0.035, 20]} />
      </mesh>
    </group>
  );
};
