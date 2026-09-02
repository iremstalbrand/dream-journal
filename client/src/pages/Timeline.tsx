import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { Dream } from "../../../shared/types";

const TYPE_COLORS = {
  ordinary: "#6A6659",
  vivid: "#C89B4A",
  nightmare: "#8A6535",
  lucid: "#E8DCC4",
};

export default function Timeline() {
  const [dreams, setDreams] = useState<Dream[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/dreams")
      .then((res) => res.json())
      .then((data) => setDreams(data));
  }, []);

  const times = dreams.map((d) => new Date(d.date).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const range = maxTime - minTime || 1;

  return (
    <div className="h-screen bg-bg">
      <Canvas camera={{ position: [0, 0, 30] }}>
        {dreams.map((dream) => {
          const time = new Date(dream.date).getTime();
          const y = ((time - minTime) / range) * 40 - 20;

          return (
            <mesh key={dream._id} position={[0, y, 0]}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshBasicMaterial color={TYPE_COLORS[dream.type]} />
            </mesh>
          );
        })}
      </Canvas>
    </div>
  );
}