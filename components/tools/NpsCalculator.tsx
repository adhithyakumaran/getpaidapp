"use client";

import { useMemo, useState } from "react";
import { calculateNps, formatINR, formatINRPrecise } from "@/lib/calculations";

export default function NpsCalculator() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("25");

  const result = useMemo(
    () => calculateNps(parseFloat(monthly) || 0, parseFloat(rate) || 0, parseFloat(years) || 1),
    [monthly, rate, years]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Monthly contribution" value={monthly} onChange={setMonthly} prefix="₹" />
        <NumField label="Expected annual return (%)" value={rate} onChange={setRate} suffix="%" />
        <NumField label="Years until retirement" value={years} onChange={setYears} suffix="yr" />
        <p className="text-[12px] leading-relaxed text-slate-light">
          NPS requires at least 40% of your corpus to go into an annuity at retirement, which pays you a monthly pension. The remaining 60% can be withdrawn as a lump sum, tax-free.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Corpus at retirement</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.corpusAtRetirement)}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
          <div>
            <span className="text-[12px] text-white/50">Lump sum (60%)</span>
            <div className="font-tabular text-lg font-semibold text-white">
              {formatINR(result.lumpSumWithdrawal)}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-white/50">Annuity (40%)</span>
            <div className="font-tabular text-lg font-semibold text-white">
              {formatINR(result.annuityInvestment)}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-white/15 pt-4">
          <span className="text-[12px] text-white/50">Estimated monthly pension</span>
          <div className="font-tabular text-xl font-semibold text-green">
            {formatINRPrecise(result.estimatedMonthlyPension)}
          </div>
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-white/40">
          Pension estimate assumes a 6% annuity rate — actual rates vary by annuity provider and change over time. This is a planning estimate, not a guarantee.
        </p>
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
