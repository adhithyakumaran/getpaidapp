"use client";

import { useMemo, useState } from "react";
import { calculateBreakEven, formatINR, formatINRPrecise } from "@/lib/calculations";

export default function BreakEvenCalculator() {
  const [fixed, setFixed] = useState("200000");
  const [price, setPrice] = useState("500");
  const [variableCost, setVariableCost] = useState("300");

  const result = useMemo(
    () =>
      calculateBreakEven(
        parseFloat(fixed) || 0,
        parseFloat(price) || 0,
        parseFloat(variableCost) || 0
      ),
    [fixed, price, variableCost]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Fixed costs (monthly)" value={fixed} onChange={setFixed} prefix="₹" />
        <NumField label="Price per unit" value={price} onChange={setPrice} prefix="₹" />
        <NumField label="Variable cost per unit" value={variableCost} onChange={setVariableCost} prefix="₹" />
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Break-even point</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {Math.ceil(result.breakEvenUnits)} <span className="text-base text-white/50">units</span>
        </div>
        <div className="mt-6 space-y-2.5 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Break-even revenue</span>
            <span className="font-tabular">{formatINR(result.breakEvenRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Contribution margin/unit</span>
            <span className="font-tabular">{formatINRPrecise(result.contributionMargin)}</span>
          </div>
        </div>
        {result.contributionMargin <= 0 && (
          <p className="mt-4 text-[12px] text-amber">
            Your price doesn&apos;t cover variable costs — you&apos;ll never break even at this pricing.
          </p>
        )}
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, prefix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string }) {
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
      </div>
    </div>
  );
}
