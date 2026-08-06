"use client";

import { useMemo, useState } from "react";
import { calculateProfitMargin, formatINRPrecise } from "@/lib/calculations";

export default function ProfitMarginCalculator() {
  const [cost, setCost] = useState("600");
  const [selling, setSelling] = useState("1000");

  const result = useMemo(
    () => calculateProfitMargin(parseFloat(cost) || 0, parseFloat(selling) || 0),
    [cost, selling]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Cost price" value={cost} onChange={setCost} />
        <NumField label="Selling price" value={selling} onChange={setSelling} />
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Profit margin</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {result.marginPercent.toFixed(1)}%
        </div>
        <div className="mt-6 space-y-2.5 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Profit</span>
            <span className="font-tabular">{formatINRPrecise(result.profit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Markup</span>
            <span className="font-tabular">{result.markupPercent.toFixed(1)}%</span>
          </div>
        </div>
        <p className="mt-6 text-[12px] leading-relaxed text-white/40">
          Margin is profit as % of selling price. Markup is profit as % of cost price — the two are commonly confused but answer different questions.
        </p>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-soft">{label}</label>
      <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-4 focus-within:border-blue">
        <span className="font-tabular text-slate">₹</span>
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
