import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import {useState} from 'react';
import {useEffect} from 'react';
import type { Dream } from "../../../shared/types";
import { motion } from "motion/react";

const TYPE_COLORS: Record<string, string> = {
  ordinary: "#6A6659",
  vivid: "#C89B4A",
  nightmare: "#8A6535",
  lucid: "#E8DCC4",
};

export default function Dreams() {

const [dreams, setDreams] = useState<Dream[]>([]);



const [loading, setLoading] = useState(true);

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

return (
  
  <div className="min-h-screen bg-bg text-ink font-body p-5 pb-24">
    <h1 className="text-2xl mb-1">Dreams</h1>
    <p className="text-ink-faint text-sm mb-6">{dreams.length} recorded</p>


    {dreams.length === 0 ? (
      <div className="flex flex-col items-center text-center pt-16">
        <p className="text-lg mb-2">Nothing recorded yet</p>
        <p className="text-ink-soft text-[15px] leading-relaxed max-w-[240px] mb-7">
          Dreams fade within minutes of waking. Write yours down while it's still there.
        </p>
        <Link
          to="/"
          className="h-12 px-8 flex items-center rounded-lg bg-gold text-on-gold text-[15px] font-medium"
        >
          Write a dream
        </Link>
      </div>
    ) : (
    <div className="flex flex-col gap-3">
      {dreams.map((dream, i) => {
  const firstStop = dream.text.search(/[.!?]/);
  const title =
    firstStop > 0 && firstStop < 60
      ? dream.text.slice(0, firstStop)
      : dream.text.slice(0, 42).trim() + "…";
  const rest = dream.text.slice(title.length).trim();

  return (
    <motion.div
      key={dream._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, delay: i * 0.07 }}
    >
      <Link
        to={`/dream/${dream._id}`}
        className="block bg-surface/60 border border-line rounded-2xl p-5 backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-[17px] text-ink leading-snug">{title}</h2>
          <div className="flex items-center gap-1.5 shrink-0 mt-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: TYPE_COLORS[dream.type] }}
            />
            <span className="text-xs text-ink-soft">{dream.type}</span>
          </div>
        </div>

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
})}    </div>
     )}
    <BottomNav />
  </div>
)};