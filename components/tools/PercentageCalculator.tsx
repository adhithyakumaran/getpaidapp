"use client";

import { useMemo, useState } from "react";
import { percentOf, whatPercent, percentChange, formatINRPrecise } from "@/lib/calculations";

type Mode = "of" | "what-percent" | "change";

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("20");
  const [b, setB] = useState("500");

  const result = useMemo(() => {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    if (mode === "of") return { label: "Result", value: percentOf(numB, numA), suffix: "" };
    if (mode === "what-percent") return { label: "Percentage", value: whatPercent(numA, numB), suffix: "%" };
    return { label: "Change", value: percentChange(numA, numB), suffix: "%" };
  }, [mode, a, b]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-surface p-1 sm:grid-cols-3">
          {[
            { key: "of" as Mode, label: "X% of Y" },
            { key: "what-percent" as Mode, label: "X is what % of Y" },
            { key: "change" as Mode, label: "% change" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`rounded-md py-2.5 text-sm font-medium transition-colors ${
                mode === m.key ? "bg-ink text-white" : "text-slate hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <NumField label={mode === "of" ? "Percentage" : mode === "what-percent" ? "Value (X)" : "From"} value={a} onChange={setA} />
          <NumField label={mode === "of" ? "Of value" : mode === "what-percent" ? "Total (Y)" : "To"} value={b} onChange={setB} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">{result.label}</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {result.suffix ? `${result.value.toFixed(2)}%` : formatINRPrecise(result.value)}
        </div>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-soft">{label}</label>
      <div className="mt-1.5 rounded-lg border border-border bg-surface px-4 focus-within:border-blue">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-3 font-tabular text-[16px] text-ink outline-none"
        />
      </div>
    </div>
  );
}
