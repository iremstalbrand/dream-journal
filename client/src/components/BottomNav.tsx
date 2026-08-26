import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  const items = [
    { path: "/new", label: "write" },
    { path: "/", label: "dreams" },
    { path: "/timeline", label: "timeline" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-line">
      <div className="max-w-md mx-auto flex justify-around py-3">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={
              location.pathname === item.path
                ? "text-gold text-xs"
                : "text-ink-faint text-xs"
            }
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}