import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import type { Dream } from "../../../shared/types";
import BottomNav from "../components/BottomNav";
import { getDream, requestReading } from "../api";

export default function DreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dream, setDream] = useState<Dream | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [loadFailed, setLoadFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [searchParams] = useSearchParams();
  const shouldAnalyse = searchParams.get("analyse") === "true";

  async function handleRead() {
    setStatus("loading");
    try {
      const updated = await requestReading(id!);
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
    getDream(id!)
      .then(setDream)
      .catch(() => setLoadFailed(true));
  }, [id]);

  if (loadFailed) {
    return (
      <div className="min-h-screen bg-bg text-ink font-body flex flex-col items-center justify-center text-center px-5">
        <h1 className="text-lg mb-2">This dream didn't load</h1>
        <p className="text-ink-soft text-[15px] leading-relaxed max-w-[260px] mb-7">
          It may have been removed, or the connection dropped.
        </p>
        <button
          onClick={() => navigate("/dreams")}
          className="h-12 px-8 rounded-lg bg-gold text-on-gold text-[15px] font-medium"
        >
          Back to dreams
        </button>
      </div>
    );
  }

  if (!dream) {
    return <div className="min-h-screen bg-bg" />;
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-body relative">
      <img
        src="/bg.jpg"
        alt=""
        className="fixed inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
      />

      <div className="relative max-w-md mx-auto p-5 pb-24">
        <button
          onClick={() => navigate(-1)}
          className="text-ink-soft text-sm mb-5"
        >
          ← Back
        </button>

        <h1 className="sr-only">Dream from {dream.date}</h1>

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
          <div className="mt-10 flex flex-col items-center">
            <p className="text-lg mb-4">Reading through Jung</p>

            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gold"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.22,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <p className="text-xs text-ink-soft mt-4">
              This takes a few seconds.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-8">
            <p className="text-lg mb-2">The reading didn't come through</p>
            <p className="text-[15px] text-ink-soft leading-relaxed mb-6">
              Your dream is safe, nothing was lost. You can try again now, or
              read it later.
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

            <h2 className="text-lg mb-1">Through Jung's lens</h2>
            <p className="text-xs text-ink-soft leading-relaxed mb-5">
              One reading among many. Not what your dream means.
            </p>

            <div className="flex flex-col gap-3">
              {dream.reading.archetypes.map((a, i) => (
                <motion.div
                  key={a.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="bg-surface/70 border border-line rounded-2xl p-5 backdrop-blur-sm"
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

      <BottomNav />
    </div>
  );
}
