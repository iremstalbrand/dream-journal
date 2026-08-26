import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Dream } from "../../../shared/types";

export default function DreamDetail() {
  const { id } = useParams();
  const [dream, setDream] = useState<Dream | null>(null);

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
      <p className="text-base leading-relaxed">{dream.text}</p>
    </div>
  );
}