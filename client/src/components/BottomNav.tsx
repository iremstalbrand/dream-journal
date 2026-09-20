import { Link, useLocation } from "react-router-dom";
import AddIcon from "../assets/icons/add.svg?react";
import UnicornIcon from "../assets/icons/unicorn.svg?react";
import JourneyIcon from "../assets/icons/journey.svg?react";


export default function BottomNav() {
  const location = useLocation();

const items = [
  { path: "/", label: "write", Icon: AddIcon },
  { path: "/dreams", label: "dreams", Icon: UnicornIcon },
  { path: "/timeline", label: "timeline", Icon: JourneyIcon },
];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-line">
      <div className="max-w-md mx-auto flex justify-around py-3">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1.5 ${
                active ? "text-gold" : "text-ink-soft"
              }`}
            >
              <item.Icon className="w-7 h-7" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}