import LogoIcon from "../assets/icons/moon.svg?react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-bg border-b border-line z-10">
      <div className="max-w-md mx-auto flex items-center gap-1 px-5 py-3">
        <LogoIcon className="w-7 h-7 text-ink" />
        <span className="font-display italic text-[18px] text-ink">
          Dream Journal
        </span>
      </div>
    </header>
  );
}