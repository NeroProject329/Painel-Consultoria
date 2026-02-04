"use client";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
};

export default function Switch({ checked, onChange, disabled }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition
      ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      ${checked ? "bg-emerald-500/20 border-emerald-400/30" : "bg-white/5 border-white/10"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition
        ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
