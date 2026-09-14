import { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Text, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Dream } from "../../../shared/types";

type Month = { key: string; label: string; short: string; dreams: Dream[] };

const TYPE_COLORS: Record<string, string> = {
  ordinary: "#6A6659",
  vivid: "#C89B4A",
  nightmare: "#8A6535",
  lucid: "#E8DCC4",
};

const SPACING = 6;
const AMPLITUDE = 3.2;

function monthPosition(i: number): [number, number, number] {
  const y = -i * SPACING;
  const x = Math.sin(i * 0.9) * AMPLITUDE;
  return [x, y, 0];
}

function PathDots({ count }: { count: number }) {
  const dots = useMemo(() => {
    const points: [number, number, number][] = [];
    const steps = 14;
    for (let i = 0; i < count - 1; i++) {
      for (let s = 1; s < steps; s++) {
        const t = i + s / steps;
        const y = -t * SPACING;
        const x = Math.sin(t * 0.9) * AMPLITUDE;
        points.push([x, y, 0]);
      }
    }
    return points;
  }, [count]);

  return (
    <>
      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshBasicMaterial color="#C89B4A" transparent opacity={0.4} />
        </mesh>
      ))}
    </>
  );
}

function WiggleSphere({ size, bright }: { size: number; bright: boolean }) {
  const ref = useRef<THREE.Group>(null);

  const curves = useMemo(() => {
    return Array.from({ length: 7 }, () => {
      const points: THREE.Vector3[] = [];
      const tilt = Math.random() * Math.PI;
      const wobble = 0.15 + Math.random() * 0.2;
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const r = size * (1 + Math.sin(a * 3) * wobble);
        points.push(
          new THREE.Vector3(
            Math.cos(a) * r,
            Math.sin(a) * r * Math.cos(tilt),
            Math.sin(a) * r * Math.sin(tilt)
          )
        );
      }
      return points;
    });
  }, [size]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
      ref.current.rotation.x += delta * 0.08;
    }
  });

  return (
    <group ref={ref}>
      {curves.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#E8DCC4"
          lineWidth={1.5}
          transparent
          opacity={bright ? 0.9 : 0.55}
        />
      ))}
    </group>
  );
}

function MonthSphere({
  month,
  index,
  size,
  selected,
  onSelect,
}: {
  month: Month;
  index: number;
  size: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const position = monthPosition(index);

  return (
    <group position={position}>
      <mesh onClick={onSelect} visible={false}>
        <sphereGeometry args={[size * 1.3, 16, 16]} />
      </mesh>

      <WiggleSphere size={size} bright={selected} />

      <Text
        position={[0, 0, size + 0.4]}
        fontSize={size * 0.5}
        color="#E8DCC4"
        anchorX="center"
        anchorY="middle"
      >
        {String(month.dreams.length)}
      </Text>

      <Text
        position={[size + 1, 0, 0]}
        fontSize={0.62}
        color={selected ? "#E8DCC4" : "#9A9483"}
        anchorX="left"
        anchorY="middle"
      >
        {month.short}
      </Text>
    </group>
  );
}

function CameraRig({
  targetIndex,
  count,
}: {
  targetIndex: number | null;
  count: number;
}) {
  const scrollRef = useRef(0);

  useEffect(() => {
    function onWheel(e: WheelEvent) {
      scrollRef.current = Math.max(
        0,
        Math.min(count - 1, scrollRef.current + e.deltaY * 0.004)
      );
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [count]);

  useFrame((state) => {
    const isMobile = state.size.width < 640;
    const index = targetIndex ?? scrollRef.current;
    const ty = -index * SPACING;
    const baseZ = isMobile ? 24 : 18;
    const zoomZ = isMobile ? 16 : 12;
    const desired = new THREE.Vector3(0, ty, targetIndex !== null ? zoomZ : baseZ);
    state.camera.position.lerp(desired, 0.06);
    state.camera.lookAt(0, ty, 0);
  });

  return null;
}

export default function Timeline() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/dreams")
      .then((res) => res.json())
      .then((data) => setDreams(data));
  }, []);

  const grouped = dreams.reduce((acc, dream) => {
    const key = dream.date.slice(0, 7);
    if (!acc[key]) acc[key] = [];
    acc[key].push(dream);
    return acc;
  }, {} as Record<string, Dream[]>);

  const months: Month[] = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, ds]) => ({
      key,
      label: new Date(key + "-01").toLocaleString("en", {
        month: "long",
        year: "numeric",
      }),
      short: new Date(key + "-01").toLocaleString("en", { month: "short" }),
      dreams: ds,
    }));

  const maxCount = Math.max(...months.map((m) => m.dreams.length), 1);
  const selectedMonth = selected !== null ? months[selected] : null;

  const totals = dreams.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthCounts = selectedMonth
    ? selectedMonth.dreams.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};

  return (
    <div className="h-screen bg-bg relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
        <color attach="background" args={["#12161C"]} />
        <Stars radius={90} depth={50} count={2500} factor={3} fade speed={0.2} />

        <PathDots count={months.length} />

        {months.map((month, i) => (
          <MonthSphere
            key={month.key}
            month={month}
            index={i}
            size={0.8 + (month.dreams.length / maxCount) * 1.1}
            selected={selected === i}
            onSelect={() => setSelected(selected === i ? null : i)}
          />
        ))}

        <CameraRig targetIndex={selected} count={months.length} />

        <EffectComposer>
          <Bloom intensity={1.3} luminanceThreshold={0.4} radius={0.8} />
        </EffectComposer>
      </Canvas>

      <div className="absolute top-5 left-5 bg-surface/70 border border-line rounded-xl px-4 py-3 backdrop-blur">
        <p className="text-ink-faint text-[10px] uppercase tracking-wide mb-2.5">
          All time
        </p>
        <div className="flex flex-col gap-2">
          {Object.keys(TYPE_COLORS).map((type) => (
            <div key={type} className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: TYPE_COLORS[type] }}
              />
              <span className="text-ink text-sm w-5">{totals[type] || 0}</span>
              <span className="text-ink-faint text-xs capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedMonth && (
        <div className="absolute top-5 right-5 w-56 bg-surface/90 border border-line rounded-xl p-4 backdrop-blur">
          <div className="flex items-start justify-between mb-3">
            <p className="text-ink text-[15px]">{selectedMonth.label}</p>
            <button
              onClick={() => setSelected(null)}
              className="text-ink-faint text-xs"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {Object.keys(TYPE_COLORS).map((type) => (
              <div key={type} className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: TYPE_COLORS[type] }}
                />
                <span className="text-ink text-sm w-5">
                  {monthCounts[type] || 0}
                </span>
                <span className="text-ink-faint text-xs capitalize">{type}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-line pt-3 flex flex-col gap-2">
            {selectedMonth.dreams.slice(0, 5).map((d) => (
              <button
                key={d._id}
                onClick={() => window.location.assign("/dream/" + d._id)}
                className="text-ink-soft text-xs leading-snug line-clamp-1 text-left"
              >
                {d.date.slice(8)} · {d.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
