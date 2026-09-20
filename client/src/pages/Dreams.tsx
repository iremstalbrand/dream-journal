import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import type { Dream } from "../../../shared/types";
import BottomNav from "../components/BottomNav";

import OrdinaryIcon from "../assets/icons/ordinary.svg?react";
import VividIcon from "../assets/icons/vivid.svg?react";
import NightmareIcon from "../assets/icons/nightmare.svg?react";
import LucidIcon from "../assets/icons/lucid-eye.svg?react";
import InterpretedIcon from "../assets/icons/interpreted.svg?react";
import NotInterpretedIcon from "../assets/icons/notinterpreted.svg?react";

const TYPE_COLORS: Record<string, string> = {
  ordinary: "#7F93B5",
  vivid: "#C89B4A",
  nightmare: "#D98A5C",
  lucid: "#E8DCC4",
};

const READ_COLOR = "#82c2a7";
const UNREAD_COLOR = "#A9A392";

const tint = (c: string) => `color-mix(in srgb, ${c} 18%, transparent)`;

const TYPE_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  ordinary: OrdinaryIcon,
  vivid: VividIcon,
  nightmare: NightmareIcon,
  lucid: LucidIcon,
};

const TYPE_OPTIONS = ["all", "ordinary", "vivid", "nightmare", "lucid"] as const;
const STATUS_OPTIONS = [
  { value: "all", label: "all" },
  { value: "interpreted", label: "interpreted" },
  { value: "unread", label: "not read" },
] as const;

export default function Dreams() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetch("http://localhost:3000/dreams")
      .then((res) => res.json())
      .then((data) => {
        setDreams(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-bg" />;
  }

  const visibleDreams = dreams.filter(
    (d) =>
      (typeFilter === "all" || d.type === typeFilter) &&
      (statusFilter === "all" ||
        (statusFilter === "interpreted" ? !!d.reading : !d.reading)),
  );
  const activeFilters =
    (typeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  const chip = (active: boolean) =>
    `h-6 px-2.5 rounded-full border text-[9px] tracking-[0.12em] uppercase ${
      active
        ? "border-gold bg-gold text-on-gold"
        : "border-line text-ink-soft"
    }`;

  return (
    <div className="min-h-screen bg-bg text-ink font-body relative">
      <img
        src="/bg.jpg"
        alt=""
        className="fixed inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
      />

      <div className="relative max-w-md mx-auto px-5 pt-3 pb-24">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl mb-1">Dreams</h1>
            <p className="text-ink-faint text-sm">
              {activeFilters > 0
                ? `${visibleDreams.length} of ${dreams.length}`
                : `${dreams.length} recorded`}
            </p>
          </div>
          {dreams.length > 0 && (
            <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              aria-expanded={filterOpen}
              className="relative h-9 px-3 flex items-center gap-2 rounded-full border border-line bg-surface/70 backdrop-blur-sm text-[10px] tracking-[0.14em] uppercase text-ink-soft"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filter
              {activeFilters > 0 && (
                <span className="w-4 h-4 rounded-full bg-gold text-on-gold flex items-center justify-center text-[9px]">
                  {activeFilters}
                </span>
              )}
            </button>

        {filterOpen && (
          <div className="absolute right-0 top-full mt-2 z-20 w-56 p-3 rounded-xl border border-line bg-surface/95 backdrop-blur-sm shadow-lg flex flex-col gap-3">
            <div>
              <p className="text-[8px] tracking-[0.18em] uppercase text-ink-faint mb-1.5">
                Type
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={chip(typeFilter === t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[8px] tracking-[0.18em] uppercase text-ink-faint mb-1.5">
                Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setStatusFilter(o.value)}
                    className={chip(statusFilter === o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="self-start text-[9px] tracking-[0.14em] uppercase text-ink-faint underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
            </div>
          )}
        </div>

        {dreams.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-16">
            <p className="text-lg mb-2">Nothing recorded yet</p>
            <p className="text-ink-soft text-[15px] leading-relaxed max-w-[240px] mb-7">
              Dreams fade within minutes of waking. Write yours down while it's
              still there.
            </p>
            <Link
              to="/"
              className="h-12 px-8 flex items-center rounded-lg bg-gold text-on-gold text-[15px] font-medium"
            >
              Write a dream
            </Link>
          </div>
        ) : visibleDreams.length === 0 ? (
          <p className="text-ink-soft text-[15px] text-center pt-16">
            No dreams match these filters.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleDreams.map((dream, i) => {
              const firstStop = dream.text.search(/[.!?]/);
              const hasTitle = firstStop > 0 && firstStop < 60;
              const title = hasTitle
                ? dream.text.slice(0, firstStop)
                : dream.text.slice(0, 42).trim() + "…";
              const rest = hasTitle
                ? dream.text.slice(firstStop + 1).trim()
                : dream.text;
              const color = TYPE_COLORS[dream.type];
              const TypeIcon = TYPE_ICONS[dream.type];
              const statusColor = dream.reading ? READ_COLOR : UNREAD_COLOR;
              const StatusIcon = dream.reading
                ? InterpretedIcon
                : NotInterpretedIcon;

              return (
                <motion.div
                  key={dream._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                >
                  <Link
                    to={`/dream/${dream._id}`}
                    className="block bg-surface/70 border border-line rounded-2xl p-5 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-[25px] h-[25px] rounded-full border flex items-center justify-center shrink-0"
                        style={{ borderColor: color, color, backgroundColor: tint(color) }}
                      >
                        <TypeIcon className="w-3 h-3" />
                      </span>
                        <span
                          className="text-[8px] tracking-[0.18em] uppercase truncate"
                          style={{ color }}
                        >
                          {dream.type}
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-2 shrink-0"
                        style={{ color: statusColor }}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-current flex items-center justify-center"
                          style={{ backgroundColor: tint(statusColor) }}
                        >
                          <StatusIcon className="w-2.5 h-2.5" />
                        </span>
                        <span className="text-[7px] tracking-[0.18em] uppercase">
                          {dream.reading ? "Interpreted" : "Not read"}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-[17px] text-ink leading-snug mb-1">
                      {title}
                    </h2>

                    <p className="text-xs text-ink-faint mb-3">
                      {new Date(dream.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>

                    <p className="text-[14px] text-ink-soft leading-relaxed line-clamp-3">
                      {rest || dream.text}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
