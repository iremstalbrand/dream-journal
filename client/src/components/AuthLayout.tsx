import type { ReactNode } from "react";
import MoonIcon from "../assets/icons/moon.svg?react";

// Clerk's own palette, mapped to the theme tokens in index.css.
const variables = {
  colorPrimary: "#C89B4A",
  colorBackground: "#152034",
  colorText: "#E8DCC4",
  colorTextSecondary: "#9AA3B8",
  colorInputBackground: "#0B1220",
  colorInputText: "#E8DCC4",
  colorNeutral: "#E8DCC4",
  colorDanger: "#E07A6B",
  fontFamily: '"Spectral", serif',
  borderRadius: "0.5rem",
};

// Tailwind classes for Clerk's elements. Clerk's styles live in the "clerk"
// CSS layer (set in main.tsx, ordered in index.css), so these utilities win.
const elements = {
  rootBox: "w-full",
  cardBox: "w-full shadow-none rounded-2xl border border-line bg-surface/60 backdrop-blur-md",
  card: "bg-transparent shadow-none px-6 py-7",
  header: "hidden",
  socialButtonsBlockButton:
    "h-11 rounded-full border border-line bg-bg/60 text-ink hover:bg-bg hover:border-ink-faint transition-colors",
  socialButtonsBlockButtonText: "font-body text-[14px] text-ink",
  dividerLine: "bg-line",
  dividerText: "text-ink-faint text-xs uppercase tracking-[0.2em]",
  formFieldLabel: "font-body text-[13px] text-ink-soft font-normal",
  formFieldInput:
    "h-11 rounded-lg border border-line bg-bg/70 text-ink text-[15px] placeholder:text-ink-faint shadow-none focus:border-gold focus:ring-1 focus:ring-gold/40",
  formFieldAction: "text-gold hover:text-ink text-[13px]",
  formButtonPrimary:
    "h-11 rounded-full bg-gold text-on-gold font-body text-[15px] normal-case shadow-none hover:bg-gold/90 transition-colors",
  footer: "bg-transparent bg-none",
  footerActionText: "text-ink-soft",
  footerActionLink: "text-gold hover:text-ink font-medium",
  identityPreview: "border border-line bg-bg/60",
  identityPreviewText: "text-ink",
  identityPreviewEditButton: "text-gold",
  otpCodeFieldInput: "border border-line bg-bg/70 text-ink",
  formResendCodeLink: "text-gold",
  alternativeMethodsBlockButton: "border border-line bg-bg/60 text-ink hover:bg-bg",
  backLink: "text-gold",
};

export const authAppearance = { variables, elements };

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-bg text-ink font-body relative overflow-hidden">
      <img
        src="/bg.jpg"
        alt=""
        className="fixed inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-bg/30 via-bg/60 to-bg pointer-events-none" />

      <main className="relative max-w-md mx-auto px-5 pt-16 pb-12 flex flex-col items-center min-h-screen">
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-2 text-gold">
            <MoonIcon className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.3em]">Dream Journal</span>
          </div>
          <h1 className="font-display text-[28px] leading-tight text-ink mt-3">
            {title}
          </h1>
          <p className="text-[15px] text-ink-soft mt-2">{subtitle}</p>
        </div>

        {children}

        <p className="mt-auto pt-10 text-xs text-ink-faint italic">
          Write it down before it fades.
        </p>
      </main>
    </div>
  );
}
