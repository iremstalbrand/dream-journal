import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import {useState} from 'react';
import {useEffect} from 'react';
import type { Dream } from "../../../shared/types";

export default function Dreams() {

   const [dreams, setDreams] = useState<Dream[]>([]);

     useEffect(() => {
    fetch("http://localhost:3000/dreams")
      .then((res) => res.json())
      .then((data) => setDreams(data));
  }, []);

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
      {dreams.map((dream) => (
        <div
          key={dream._id}
          className="bg-surface border border-line rounded-lg p-4"
        >
          <div className="text-xs text-ink-soft mb-1.5">
            {dream.date} · {dream.type}
          </div>
          <p className="text-[15px] leading-relaxed line-clamp-1">
            {dream.text}
          </p>
        </div>
      ))}
    </div>
     )}
    <BottomNav />
  </div>
)};