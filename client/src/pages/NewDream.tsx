import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { DreamType } from "../../../shared/types";
import { motion } from "motion/react";


const TYPES = ["ordinary", "vivid", "nightmare", "lucid"] as const;

export default function NewDream() {
  const [type, setType] = useState<DreamType>("ordinary");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [text, setText] = useState("");
  const navigate = useNavigate();

  async function handleSave() {
    const res = await fetch("http://localhost:3000/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, type, text }),
    });

    if (!res.ok) {
      console.error("Save failed");
      return;
    }

    navigate("/dreams");
  }

  async function handleAnalyse() {
    const res = await fetch("http://localhost:3000/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, type, text }),
    });

    if (!res.ok) {
      console.error("Save failed");
      return;
    }

    const dream = await res.json();
    navigate(`/dream/${dream._id}?analyse=true`);
  }

  return (
    
    <div className="min-h-screen bg-bg text-ink font-body relative">
      <img
        src="/bg.jpg"
        alt=""
        className="fixed inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
      />

      <div className="relative max-w-md mx-auto p-5 pb-24">
        <Header />

     <div className="relative h-80 mt-6 mb-2">
  <motion.img
    src="/dreams/glow.png"
    alt=""
    className="absolute inset-0 w-full h-full object-contain"
    animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
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

      <div className="grid grid-cols-4 gap-1.5 mt-4">
  {TYPES.map((t) => (
    <button
      key={t}
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

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-4 w-full bg-surface/70 border border-line rounded-lg px-4 py-3 text-[15px] text-ink [color-scheme:dark] backdrop-blur-sm"
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I was standing at the edge of water that didn't move…"
          maxLength={3000}
          className="w-full min-h-[200px] bg-surface/70 border border-line rounded-lg p-4 text-base text-ink placeholder:text-ink-faint mt-4 backdrop-blur-sm"
        />

        <button
          onClick={handleAnalyse}
          disabled={!text.trim()}
          className="w-full h-12 mt-4 rounded-lg bg-gold text-on-gold text-[15px] font-medium disabled:opacity-40"
        >
          Analyse through Jung
        </button>

        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="w-full mt-3 text-[13px] text-ink-faint disabled:opacity-40"
        >
          Save without analysing
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
