"use client";

import { useMemo, useState } from "react";
import {
  calculateSimpleInterest,
  calculateCompoundInterest,
  formatINR,
  formatINRPrecise,
} from "@/lib/calculations";

export default function InterestCalculator() {
  const [mode, setMode] = useState<"simple" | "compound">("compound");
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("5");

  const result = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const t = parseFloat(years) || 0;
    return mode === "simple"
      ? calculateSimpleInterest(p, r, t)
      : calculateCompoundInterest(p, r, t, 1);
  }, [mode, principal, rate, years]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        <div className="flex rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setMode("simple")}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
              mode === "simple" ? "bg-ink text-white" : "text-slate hover:text-ink"
            }`}
          >
            Simple interest
          </button>
          <button
            onClick={() => setMode("compound")}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
              mode === "compound" ? "bg-ink text-white" : "text-slate hover:text-ink"
            }`}
          >
            Compound interest
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <NumField label="Principal amount" value={principal} onChange={setPrincipal} prefix="₹" />
          <NumField label="Annual interest rate" value={rate} onChange={setRate} suffix="%" />
          <NumField label="Time period" value={years} onChange={setYears} suffix="years" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Total amount</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.totalAmount)}
        </div>
        <div className="mt-6 flex justify-between border-t border-white/15 pt-4 text-sm">
          <span className="text-white/60">Interest earned</span>
          <span className="font-tabular">{formatINR(result.interest)}</span>
        </div>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, prefix, suffix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-soft">{label}</label>
      <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-4 focus-within:border-blue">
        {prefix && <span className="font-tabular text-slate">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-3 pl-2 font-tabular text-[16px] text-ink outline-none"
        />
        {suffix && <span className="shrink-0 text-sm text-slate">{suffix}</span>}
      </div>
    </div>
  );
}
