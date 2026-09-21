import { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Text, Line, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion } from "motion/react";
import type { Dream } from "../../../shared/types";
import { getDreams } from "../api";
import BottomNav from "../components/BottomNav";

import OrdinaryIcon from "../assets/icons/ordinary.svg?react";
import VividIcon from "../assets/icons/vivid.svg?react";
import NightmareIcon from "../assets/icons/nightmare.svg?react";
import LucidIcon from "../assets/icons/lucid-eye.svg?react";

type DreamKind = "ordinary" | "vivid" | "nightmare" | "lucid";

const kindIcons: Record<DreamKind, React.FC<React.SVGProps<SVGSVGElement>>> = {
  ordinary: OrdinaryIcon,
  vivid: VividIcon,
  nightmare: NightmareIcon,
  lucid: LucidIcon,
};

const tint = (c: string) => `color-mix(in srgb, ${c} 18%, transparent)`;

const kindColors: Record<DreamKind, string> = {
  ordinary: "#6A6659",
  vivid: "#C89B4A",
  nightmare: "#8A6535",
  lucid: "#E8DCC4",
};

type MonthData = {
  key: string;
  label: string;
  short: string;
  dreams: Dream[];
  total: number;
  ordinary: number;
  vivid: number;
  nightmare: number;
  lucid: number;
  position: [number, number, number];
};

const SPACING = 9;
const AMPLITUDE = 3.4;
let glowTexture: THREE.CanvasTexture | null = null;
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(225,176,76,0.9)");
  g.addColorStop(0.35, "rgba(225,176,76,0.25)");
  g.addColorStop(1, "rgba(225,176,76,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(canvas);
  return glowTexture;
}

const LABEL_FONT = "/fonts/fraunces-400.woff";
const MOBILE_SPACING = 3.8;

// On mobile, months alternate sides and sit closer together. The x offset is
// fixed so the star line can follow the same positions as the nodes.
function monthSide(data: MonthData) {
  return Math.round(-data.position[1] / SPACING) % 2 === 0 ? 1 : -1;
}

function nodePosition(
  data: MonthData,
  isMobile: boolean
): [number, number, number] {
  if (!isMobile) return data.position;
  return [
    -monthSide(data) * 0.6,
    data.position[1] * (MOBILE_SPACING / SPACING),
    0,
  ];
}

// A faint line that joins the months in order.
function DashedPath({ months }: { months: MonthData[] }) {
  const isMobile = useThree((state) => state.size.width < 640);

  const points = useMemo(() => {
    if (months.length < 2) return [];
    const path = new THREE.CatmullRomCurve3(
      months.map((m) => new THREE.Vector3(...nodePosition(m, isMobile)))
    );
    return path.getPoints(months.length * 40);
  }, [months, isMobile]);

  if (points.length === 0) return null;

  return (
    <Line
      points={points}
      color="#E8DCC4"
      lineWidth={1}
      transparent
      opacity={0.2}
      depthWrite={false}
    />
  );
}

function OrbitNode({
  data,
  selected,
  onSelect,
  cardTopRef,
}: {
  data: MonthData;
  selected: boolean;
  onSelect: () => void;
  cardTopRef: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Group | null)[]>([]);
  const outerRefs = useRef<(THREE.Group | null)[]>([]);
  const lineRefs = useRef<any[]>([]);
  const tmp = useRef({
    q: new THREE.Quaternion(),
    down: new THREE.Vector3(),
    pos: new THREE.Vector3(),
  });
  const progress = useRef(0);
  const kinds = Object.keys(kindColors) as DreamKind[];
  const isMobile = useThree((state) => state.size.width < 640);
  const [nameWidth, setNameWidth] = useState(1.0);
  const scale = isMobile ? 1.1 : 1;
  // The core grows slightly with the month's dream count; the rings don't.
  const coreRadius = 0.12 + Math.min(data.total, 12) * 0.014;

  // On mobile, months alternate sides. The label sits right next to the
  // orbit, and the node + label pair is centered on screen.
  const side = monthSide(data);
  // One ring per dream, colored by its type.
  const ringKinds = kinds.flatMap((kind) =>
    Array.from({ length: data[kind] }, () => kind)
  );
  const ringX = () => 0.8;
  const ringRadius = ringX() * scale;
  const labelGap = 0.15;
  const labelBlock = nameWidth;
  const position = nodePosition(data, isMobile);
  const labelX = isMobile
    ? side === 1
      ? ringRadius + labelGap
      : -(ringRadius + labelGap + labelBlock)
    : -4;

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const current = group.current;
    if (!current) return;
    current.rotation.y += delta * (selected ? 0.34 : 0.2);
    current.rotation.z += delta * 0.08;
    const pulse = selected
      ? 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.025
      : 1;
    current.scale.lerp(
      new THREE.Vector3(scale * pulse, scale * pulse, scale * pulse),
      1 - Math.exp(-5 * delta)
    );

    // When selected, the rings leave the node one after another and fly down
    // toward the stats bars, leaving only the core behind.
    progress.current +=
      ((selected ? 1 : 0) - progress.current) * (1 - Math.exp(-1.6 * delta));
    const n = Math.max(ringKinds.length, 1);
    const { q, down, pos } = tmp.current;
    current.getWorldQuaternion(q).invert();
    down.set(0, -1, 0).applyQuaternion(q);

    // Distance (in world units) from the node down to just above the stats card.
    current.getWorldPosition(pos);
    const cameraDistance = state.camera.position.distanceTo(pos);
    const pxPerUnit = state.size.height / (2 * 0.4142 * cameraDistance);
    const nodeScreenY = ((1 - pos.clone().project(state.camera).y) / 2) * state.size.height;
    const cardTop = cardTopRef.current || state.size.height * 0.55;
    const gap = Math.max(cardTop - nodeScreenY - 10, 0) / pxPerUnit;

    ringRefs.current.forEach((ring, i) => {
      const outer = outerRefs.current[i];
      if (!ring || !outer) return;
      const p = THREE.MathUtils.clamp(progress.current * 1.7 - (i / n) * 0.7, 0, 1);
      const eased = p * p * (3 - 2 * p);
      ring.rotation.z += delta * (0.05 + eased * 1.2) * (i % 2 ? 1 : -1);

      // Each ring stops a little differently, by dream type.
      const row = kinds.indexOf(ringKinds[i]);
      const travel = gap * (0.85 + row * 0.05);
      outer.position.copy(down).multiplyScalar((travel / scale) * eased);
      const s = 1 - eased * 0.9;
      outer.scale.set(s, s, s);
      const line = lineRefs.current[i];
      if (line?.material) line.material.opacity = 0.6 * (1 - Math.max(0, (eased - 0.7) / 0.3));
    });
  });

  return (
    <group position={position}>
      <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.14}>
        <group
          ref={group}
          scale={scale}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          <mesh visible={false}>
            <sphereGeometry args={[1.6, 12, 12]} />
          </mesh>

          {ringKinds.map((kind, index) => {
            const points = Array.from({ length: 70 }, (_, pointIndex) => {
              const angle = (pointIndex / 69) * Math.PI * 2;
              const xRadius = ringX();
              const yRadius = (0.32 + (index % 4) * 0.08) * 0.8;
              return new THREE.Vector3(
                Math.cos(angle) * xRadius,
                Math.sin(angle) * yRadius,
                Math.sin(angle * 2 + index) * 0.12 * 0.8
              );
            });
            return (
              <group
                key={index}
                ref={(el) => (outerRefs.current[index] = el)}
                rotation={[0.55 + index * 0.48, index * 0.72, index * 0.46]}
              >
                <group ref={(el) => (ringRefs.current[index] = el)}>
                  <Line
                    ref={(el: any) => (lineRefs.current[index] = el)}
                    points={points}
                    color={kindColors[kind]}
                    lineWidth={selected ? 1.75 : 1.15}
                    transparent
                    opacity={0.6}
                  />
                </group>
              </group>
            );
          })}

          <sprite scale={[coreRadius * 4.5, coreRadius * 4.5, 1]} raycast={() => null}>
            <spriteMaterial
              map={getGlowTexture()}
              transparent
              opacity={selected ? 0.55 : 0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>

          <mesh>
            <sphereGeometry args={[coreRadius, 48, 48]} />
            <meshPhysicalMaterial
              color="#f1e6c9"
              emissive="#e1b04c"
              emissiveIntensity={selected ? 0.9 : 0.55}
              roughness={0.32}
              clearcoat={1}
              clearcoatRoughness={0.15}
            />
          </mesh>

          <pointLight
            color="#e1b04c"
            intensity={selected ? 5 : 3}
            distance={3.2}
          />
        </group>
      </Float>

      <Text
        position={[labelX, 0.2, 0]}
        fontSize={isMobile ? 0.3 : 0.62}
        color={selected ? "#E8DCC4" : "#C8C2B4"}
        anchorX={isMobile ? "left" : "right"}
        font={LABEL_FONT}
        anchorY="middle"
        onSync={(text: any) => {
          const b = text.textRenderInfo?.blockBounds;
          if (b && Math.abs(b[2] - b[0] - nameWidth) > 0.01) {
            setNameWidth(b[2] - b[0]);
          }
        }}
      >
        {data.short}
      </Text>
    </group>
  );
}

function CameraRig({
  targetIndex,
  months,
}: {
  targetIndex: number | null;
  months: MonthData[];
}) {
  const scrollRef = useRef(0);
  const count = months.length;

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

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const isMobile = state.size.width < 640;
    const aspect = state.size.width / state.size.height;
    const spacing = isMobile ? MOBILE_SPACING : SPACING;
    const selectedMonth = targetIndex !== null ? months[targetIndex] : null;

    let x = 0;
    let y = -scrollRef.current * spacing;
    let z = isMobile ? Math.max(9, 4.6 / (2 * 0.4142 * aspect)) : 11;

    if (selectedMonth) {
      // Close in on the node, and lift it into the space above the stats card.
      const [nx, ny] = nodePosition(selectedMonth, isMobile);
      z = isMobile ? 6.5 : 6;
      const halfHeight = z * 0.4142;
      x = nx;
      y = ny - halfHeight * (isMobile ? 0.45 : 0.3);
    }

    state.camera.position.lerp(
      new THREE.Vector3(x, y, z),
      1 - Math.exp(-6 * delta)
    );
    state.camera.lookAt(state.camera.position.x, state.camera.position.y, 0);
  });

  return null;
}

function StatRow({
  kind,
  count,
  max,
  delay,
}: {
  kind: DreamKind;
  count: number;
  max: number;
  delay: number;
}) {
  const Icon = kindIcons[kind];
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0"
        style={{
          borderColor: kindColors[kind],
          color: kindColors[kind],
          backgroundColor: tint(kindColors[kind]),
        }}
      >
        <Icon className="w-2.5 h-2.5" />
      </span>
      <span className="text-[13px] text-ink capitalize w-20 shrink-0">
        {kind}
      </span>
      <div className="flex-1 h-px bg-line relative">
        <motion.div
          className="absolute left-0 top-0 h-px"
          style={{ background: kindColors[kind] }}
          initial={{ width: 0 }}
          animate={{ width: `${(count / Math.max(max, 1)) * 100}%` }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }}
        />
      </div>
      <span className="text-[13px] text-ink w-4 text-right shrink-0">
        {count}
      </span>
    </div>
  );
}

export default function Timeline() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const cardTopRef = useRef(0);

  useEffect(() => {
    getDreams()
      .then(setDreams)
      .catch(() => setError(true));
  }, []);

  const grouped = dreams.reduce((acc, dream) => {
    const key = dream.date.slice(0, 7);
    if (!acc[key]) acc[key] = [];
    acc[key].push(dream);
    return acc;
  }, {} as Record<string, Dream[]>);

  // Every month between the newest and oldest dream gets a node, even when
  // it has no dreams (it then shows just the core, with no rings).
  const dataKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const monthKeys: string[] = [];
  if (dataKeys.length > 0) {
    const [newestY, newestM] = dataKeys[0].split("-").map(Number);
    const oldest = dataKeys[dataKeys.length - 1];
    let y = newestY;
    let m = newestM;
    for (;;) {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      monthKeys.push(key);
      if (key <= oldest) break;
      m -= 1;
      if (m === 0) {
        m = 12;
        y -= 1;
      }
    }
  }

  const months: MonthData[] = monthKeys
    .map((key) => [key, grouped[key] ?? []] as [string, Dream[]])
    .map(([key, ds], i) => ({
      key,
      label: new Date(key + "-01").toLocaleString("en", { month: "long" }),
      short: new Date(key + "-01").toLocaleString("en", { month: "short" }),
      dreams: ds,
      total: ds.length,
      ordinary: ds.filter((d) => d.type === "ordinary").length,
      vivid: ds.filter((d) => d.type === "vivid").length,
      nightmare: ds.filter((d) => d.type === "nightmare").length,
      lucid: ds.filter((d) => d.type === "lucid").length,
      position: [Math.sin(i * 0.9) * AMPLITUDE, -i * SPACING, 0] as [
        number,
        number,
        number
      ],
    }));

  const selectedMonth = selected !== null ? months[selected] : null;

  const totals = dreams.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const kinds = Object.keys(kindColors) as DreamKind[];

  return (
    <div className="h-screen bg-bg relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, 11], fov: 45 }}>
        <color attach="background" args={["#0B1220"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff1d6" />
        <Stars radius={90} depth={50} count={2200} factor={3} fade speed={0.2} />

        {months.map((month, i) => (
          <OrbitNode
            key={month.key}
            data={month}
            selected={selected === i}
            onSelect={() => setSelected(selected === i ? null : i)}
            cardTopRef={cardTopRef}
          />
        ))}

        <DashedPath months={months} />

        <CameraRig targetIndex={selected} months={months} />

        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.4} radius={0.8} />
        </EffectComposer>
      </Canvas>

      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        <div className="max-w-md mx-auto px-5 pt-5 flex items-start gap-5">
          <div className="shrink-0">
            <h1 className="font-display text-[28px] text-ink leading-none">
              All time
            </h1>
            <p className="text-ink-soft text-sm mt-1.5">
              {error ? "Couldn't load dreams" : `${dreams.length} dreams`}
            </p>
          </div>

          <div className="border-l border-line pl-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {kinds.map((kind) => (
              <div key={kind} className="flex items-center gap-2">
                <span
                  className="w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0"
                  style={{
                    borderColor: kindColors[kind],
                    color: kindColors[kind],
                    backgroundColor: tint(kindColors[kind]),
                  }}
                >
                  {(() => {
                    const Icon = kindIcons[kind];
                    return <Icon className="w-2.5 h-2.5" />;
                  })()}
                </span>
                <span className="text-ink text-[13px] w-3">
                  {totals[kind] || 0}
                </span>
                <span className="text-ink-soft text-[11px] capitalize">
                  {kind}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedMonth ? (
        <div className="absolute bottom-20 left-0 right-0 px-5">
          <div
            ref={(el) => {
              if (el) cardTopRef.current = el.getBoundingClientRect().top;
            }}
            className="max-w-md mx-auto bg-surface/85 border border-line rounded-2xl p-5 backdrop-blur"
          >
            <div className="flex items-start justify-between mb-1">
              <p className="text-[11px] tracking-[0.18em] uppercase text-gold">
                Selected orbit
              </p>
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-full border border-line text-ink-soft text-xs shrink-0"
              >
                ✕
              </button>
            </div>

            <h2 className="font-display text-[26px] text-ink leading-tight">
              {selectedMonth.label}
            </h2>

            <p className="text-ink-soft text-sm mb-4">
              <span className="text-gold text-lg">{selectedMonth.total}</span>{" "}
              dreams recorded
            </p>

            <div className="flex flex-col gap-2.5">
              {kinds.map((kind, i) => (
                <StatRow
                  key={`${selectedMonth.key}-${kind}`}
                  kind={kind}
                  count={selectedMonth[kind]}
                  max={selectedMonth.total}
                  delay={1.0 + i * 0.12}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="absolute bottom-24 left-0 right-0 text-center text-[11px] tracking-[0.18em] uppercase text-ink-soft">
          Tap an orbit to explore
        </p>
      )}

      <BottomNav />
    </div>
  );
}
