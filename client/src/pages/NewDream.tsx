import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { DreamType } from "../../../shared/types";
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

  navigate("/");
}
  

  return (
    <div className="min-h-screen bg-bg text-ink font-body">
      <div className="max-w-md mx-auto p-5">
        <h1 className="text-2xl">New dream</h1>

        <div className="flex flex-wrap gap-2 mt-4">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={
                type === t
                  ? "h-9 px-4 rounded-full bg-gold text-on-gold text-sm capitalize"
                  : "h-9 px-4 rounded-full border border-line text-ink-soft text-sm capitalize" 
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
          className="mt-4 bg-surface border border-line rounded-lg p-2 text-sm text-ink"
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I was standing at the edge of water that didn't move…"
          maxLength={3000}
          className="w-full min-h-[200px] bg-surface border border-line rounded-lg p-4 text-base text-ink placeholder:text-ink-faint mt-4"
        />

        <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="w-full h-12 mt-4 rounded-lg bg-gold text-on-gold text-[15px] font-medium disabled:opacity-40">
            Save dream
        </button>
      </div>
      <BottomNav />
    </div>
  );
}