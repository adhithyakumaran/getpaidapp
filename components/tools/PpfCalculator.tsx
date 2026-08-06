"use client";

import { useMemo, useState } from "react";
import { calculatePpf, formatINR, formatINRPrecise } from "@/lib/calculations";

export default function PpfCalculator() {
  const [yearly, setYearly] = useState("150000");
  const [rate, setRate] = useState("7.1");
  const [years, setYears] = useState("15");

  const result = useMemo(
    () => calculatePpf(parseFloat(yearly) || 0, parseFloat(rate) || 0, parseFloat(years) || 1),
    [yearly, rate, years]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Yearly investment" value={yearly} onChange={setYearly} prefix="₹" />
        <NumField label="Interest rate (annual %)" value={rate} onChange={setRate} suffix="%" />
        <NumField label="Tenure (years)" value={years} onChange={setYears} suffix="yr" />
        <p className="text-[12px] leading-relaxed text-slate-light">
          PPF has a minimum 15-year lock-in and a government-set interest rate revised quarterly — 7.1% is a recent typical rate, but check the current rate before relying on this for planning.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Maturity value</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.maturityValue)}
        </div>
        <div className="mt-6 space-y-2.5 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Total invested</span>
            <span className="font-tabular">{formatINR(result.totalInvested)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Interest earned</span>
            <span className="font-tabular">{formatINR(result.totalInterest)}</span>
          </div>
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
