import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { DreamType } from "../../../shared/types";
import { motion } from "motion/react";
import { createDream } from "../api";


const TYPES = ["ordinary", "vivid", "nightmare", "lucid"] as const;

export default function NewDream() {
  const [type, setType] = useState<DreamType>("ordinary");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // Both buttons save the dream; analysing then opens it with ?analyse=true.
  async function save(analyse: boolean) {
    setSaving(true);
    setError(false);
    try {
      const dream = await createDream({ date, type, text });
      navigate(analyse ? `/dream/${dream._id}?analyse=true` : "/dreams");
    } catch {
      setError(true);
      setSaving(false);
    }
  }

  return (
    
    <div className="min-h-screen bg-bg text-ink font-body relative">
      <img
        src="/bg.jpg"
        alt=""
        className="fixed inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
      />

      <div className="relative max-w-md mx-auto px-5 pt-3 pb-24">

     <div className="relative h-60 mt-0 mb-2">
      <motion.img
        src="/dreams/glow.png"
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

  {(["ordinary", "vivid", "nightmare", "lucid"] as const).map((t) => (
    <img
      key={t}
      src={`/dreams/${t}.png`}
      alt=""
      className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
      style={{ opacity: type === t ? 1 : 0 }}
    />
  ))}
</div>

<div className="text-center mt-6 mb-5">
  <h1 className="font-display not-italic text-[26px] leading-tight text-ink">
    What did you dream last night?
  </h1>
  <p className="text-[15px] text-ink-soft mt-2">
    Write it down before it fades.
  </p>
</div>

      <div
        role="radiogroup"
        aria-label="Dream type"
        className="grid grid-cols-4 gap-1.5 mt-4"
      >
  {TYPES.map((t) => (
    <button
      key={t}
      type="button"
      role="radio"
      aria-checked={type === t}
      onClick={() => setType(t)}
      className={
        type === t
          ? "h-9 rounded-full bg-gold text-on-gold text-[12px] capitalize"
          : "h-9 rounded-full border border-line text-ink-soft text-[12px] capitalize"
      }
    >
      {t}
    </button>
  ))}
</div>

        <label htmlFor="dream-date" className="sr-only">
          Date of the dream
        </label>
        <input
          id="dream-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-4 w-full bg-surface/70 border border-line rounded-lg px-4 py-3 text-[15px] text-ink [color-scheme:dark] backdrop-blur-sm"
        />

    
      <div className="relative mt-4">
        <label htmlFor="dream-text" className="sr-only">
          Describe your dream
        </label>
        <textarea
          id="dream-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I was standing at the edge of water that didn't move…"
          maxLength={3000}
          className="w-full min-h-[200px] bg-surface/70 border border-line rounded-lg p-4 pb-8 text-base text-ink placeholder:text-ink-faint backdrop-blur-sm block"
        />

        <span className="absolute bottom-3 right-4 text-xs text-ink-soft pointer-events-none">
          {text.length}/3000
        </span>
      </div>

        {error && (
          <p role="alert" className="mt-4 text-[14px] text-ink-soft text-center">
            Your dream couldn't be saved. Your text is still here, try again.
          </p>
        )}

        <button
          onClick={() => save(true)}
          disabled={!text.trim() || saving}
          className="w-full h-12 mt-4 rounded-lg bg-gold text-on-gold text-[15px] font-medium disabled:opacity-40"
        >
          Analyse through Jung
        </button>

        <button
          onClick={() => save(false)}
          disabled={!text.trim() || saving}
          className="w-full mt-3 text-[13px] text-ink-soft disabled:opacity-40"
        >
          Save without analysing
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
