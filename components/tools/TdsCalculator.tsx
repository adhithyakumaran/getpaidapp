"use client";

import { useMemo, useState } from "react";
import { calculateTds, formatINRPrecise } from "@/lib/calculations";

export default function TdsCalculator() {
  const [amount, setAmount] = useState("50000");
  const [rate, setRate] = useState(10);

  const result = useMemo(() => {
    const numeric = parseFloat(amount) || 0;
    return calculateTds(numeric, rate);
  }, [amount, rate]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        <label className="block text-sm font-medium text-ink-soft">
          Invoice amount
        </label>
        <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-4 focus-within:border-blue">
          <span className="font-tabular text-slate">₹</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent py-3.5 pl-2 font-tabular text-lg text-ink outline-none"
          />
        </div>

        <label className="mt-6 block text-sm font-medium text-ink-soft">
          TDS section &amp; rate
        </label>
        <div className="mt-1.5 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setRate(10)}
            className={`rounded-lg border py-3 text-sm font-medium transition-colors ${
              rate === 10 ? "border-ink bg-ink text-white" : "border-border bg-white text-ink-soft hover:border-ink"
            }`}
          >
            194J — 10% (professional fees)
          </button>
          <button
            onClick={() => setRate(2)}
            className={`rounded-lg border py-3 text-sm font-medium transition-colors ${
              rate === 2 ? "border-ink bg-ink text-white" : "border-border bg-white text-ink-soft hover:border-ink"
            }`}
          >
            194C — 2% (contractors)
          </button>
        </div>

        {!result.thresholdApplies && (
          <div className="mt-6 rounded-lg border border-amber/20 bg-amber-tint px-4 py-3 text-[13px] leading-relaxed text-amber">
            Below ₹30,000, TDS under Section 194J typically doesn&apos;t apply for a single payment (thresholds vary by section and aggregate annual payments).
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">
          Net receivable
        </span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.netReceivable)}
        </div>
        <div className="mt-6 space-y-2.5 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Invoice amount</span>
            <span className="font-tabular">{formatINRPrecise(result.invoiceAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">TDS deducted ({result.tdsRate}%)</span>
            <span className="font-tabular">{formatINRPrecise(result.tdsAmount)}</span>
          </div>
        </div>
        <p className="mt-6 text-[12px] leading-relaxed text-white/40">
          TDS deducted by your client is available as credit against your final tax liability (Form 26AS) — it&apos;s not an extra tax, just tax collected upfront.
        </p>
      </div>
    </div>
  );
}
