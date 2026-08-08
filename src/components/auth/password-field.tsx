"use client";

import { useState } from "react";

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: string;
  error?: string;
}

/**
 * Password input with a "Show"/"Hide" toggle so people can double-check
 * what they typed before submitting, plus room for a format hint (e.g.
 * minimum length) shown until there's an error to report instead.
 */
export function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-sm font-normal text-off-white/80">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="text-xs font-normal text-off-white/50 underline underline-offset-4 hover:text-off-white"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white"
      />
      {error ? (
        <p className="text-sm text-off-white/70">{error}</p>
      ) : hint ? (
        <p className="text-sm font-normal text-off-white/50">{hint}</p>
      ) : null}
    </div>
  );
}
