"use client";

import { useMemo, useState } from "react";
import { calculateGratuity, formatINRPrecise } from "@/lib/calculations";

export default function GratuityCalculator() {
  const [salary, setSalary] = useState("60000");
  const [years, setYears] = useState("7");

  const result = useMemo(
    () => calculateGratuity(parseFloat(salary) || 0, parseFloat(years) || 0),
    [salary, years]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Last drawn monthly salary (basic + DA)" value={salary} onChange={setSalary} prefix="₹" />
        <NumField label="Years of service" value={years} onChange={setYears} suffix="yrs" />
        {parseFloat(years) < 5 && (
          <div className="rounded-lg border border-amber/20 bg-amber-tint px-4 py-3 text-[13px] leading-relaxed text-amber">
            Gratuity is generally only payable after 5 years of continuous service (with some exceptions, like death or disability).
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Gratuity amount</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.gratuityAmount)}
        </div>
        {result.cappedAt && (
          <p className="mt-3 text-[12px] text-amber">
            Capped at the statutory maximum of ₹20 lakh.
          </p>
        )}
        <p className="mt-6 text-[12px] leading-relaxed text-white/40">
          Formula: (15 × last drawn salary × years of service) / 26. Applies to employees under the Payment of Gratuity Act — some private employers offer more generous terms.
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
