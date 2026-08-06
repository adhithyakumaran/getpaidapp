"use client";

import { useMemo, useState } from "react";
import { calculateEmi, formatINR, formatINRPrecise } from "@/lib/calculations";

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate] = useState("10.5");
  const [tenure, setTenure] = useState("60");

  const result = useMemo(() => {
    return calculateEmi(
      parseFloat(principal) || 0,
      parseFloat(rate) || 0,
      parseFloat(tenure) || 1
    );
  }, [principal, rate, tenure]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Loan amount" value={principal} onChange={setPrincipal} prefix="₹" />
        <NumField label="Interest rate (annual %)" value={rate} onChange={setRate} suffix="%" />
        <NumField label="Tenure (months)" value={tenure} onChange={setTenure} suffix="mo" />
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">
          Monthly EMI
        </span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.emi)}
        </div>
        <div className="mt-6 space-y-2.5 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Total payment</span>
            <span className="font-tabular">{formatINR(result.totalPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Total interest</span>
            <span className="font-tabular">{formatINR(result.totalInterest)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) {
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
