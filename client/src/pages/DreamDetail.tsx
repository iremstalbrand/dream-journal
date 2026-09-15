import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { Dream } from "../../../shared/types";
import { motion } from "motion/react";

export default function DreamDetail() {
  const { id } = useParams();
  const [dream, setDream] = useState<Dream | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [expanded, setExpanded] = useState(false);
  const [searchParams] = useSearchParams();
  const shouldAnalyse = searchParams.get("analyse") === "true";

  async function handleRead() {
    setStatus("loading");
    try {
      const res = await fetch(`http://localhost:3000/dreams/${id}/reading`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setDream(updated);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (dream && !dream.reading && shouldAnalyse && status === "idle") {
      handleRead();
    }
  }, [dream, shouldAnalyse]);

  useEffect(() => {
    fetch(`http://localhost:3000/dreams/${id}`)
      .then((res) => res.json())
      .then((data) => setDream(data));
  }, [id]);

  if (!dream) {
    return <div className="min-h-screen bg-bg" />;
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-body p-5">
      <p className="text-sm text-ink-soft mb-4">
        {dream.date} · {dream.type}
      </p>

      <p
        className={
          expanded
            ? "text-base leading-relaxed"
            : "text-base leading-relaxed line-clamp-4"
        }
      >
        {dream.text}
      </p>

      {dream.text.length > 280 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[13px] text-gold mt-2"
        >
          {expanded ? "Show less" : "Show all"}
        </button>
      )}

      {!dream.reading && status === "idle" && (
        <button
          onClick={handleRead}
          className="w-full h-12 mt-6 rounded-lg bg-gold text-on-gold text-[15px] font-medium"
        >
          Read through Jung
        </button>
      )}

      {status === "loading" && (
        <div className="mt-8 flex flex-col items-center">
          <p className="text-lg mb-3">Reading through Jung</p>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <div className="w-1.5 h-1.5 rounded-full bg-ink-faint" />
            <div className="w-1.5 h-1.5 rounded-full bg-ink-faint" />
          </div>
          <p className="text-xs text-ink-faint mt-3">This takes a few seconds.</p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-8">
          <p className="text-lg mb-2">The reading didn't come through</p>
          <p className="text-[15px] text-ink-soft leading-relaxed mb-6">
            Your dream is safe, nothing was lost. You can try again now, or read
            it later.
          </p>
          <button
            onClick={handleRead}
            className="w-full h-12 rounded-lg bg-gold text-on-gold text-[15px] font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {dream.reading && (
        <div className="mt-8">
          <div className="h-px bg-line mb-6" />

          <p className="text-lg mb-1">Through Jung's lens</p>
          <p className="text-xs text-ink-faint leading-relaxed mb-5">
            One reading among many. Not what your dream means.
          </p>

          <div className="flex flex-col gap-3">
            {dream.reading.archetypes.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="bg-surface/60 border border-line rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <h3 className="text-[16px] text-ink capitalize leading-snug">
                    {a.name}
                  </h3>
                  <span className="shrink-0 px-2 py-0.5 rounded bg-gold text-on-gold text-[10px] tracking-wide uppercase">
                    Archetype
                  </span>
                </div>

                <p className="text-[14px] text-ink-soft leading-relaxed">
                  {a.reading}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
