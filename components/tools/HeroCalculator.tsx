"use client";

import { useMemo, useState } from "react";
import { calculateGstExclusive, formatINR } from "@/lib/calculations";
import Button from "@/components/ui/Button";

export default function HeroCalculator() {
  const [amount, setAmount] = useState("50000");
  const [rate, setRate] = useState(18);

  const result = useMemo(() => {
    const numeric = parseFloat(amount) || 0;
    return calculateGstExclusive(numeric, rate, false);
  }, [amount, rate]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04),0_16px_40px_-16px_rgba(11,18,32,0.18)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium uppercase tracking-wide text-slate">
          Try it — GST on an invoice
        </span>
        <span className="rounded-full bg-green-tint px-2.5 py-1 text-[11px] font-medium text-green-dark">
          Live
        </span>
      </div>

      <label className="mt-5 block text-sm font-medium text-ink-soft">
        Invoice amount
      </label>
      <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-3.5 focus-within:border-blue">
        <span className="font-tabular text-ink-soft">₹</span>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent py-2.5 pl-1.5 font-tabular text-[16px] text-ink outline-none"
          placeholder="50000"
        />
      </div>

      <label className="mt-4 block text-sm font-medium text-ink-soft">
        GST rate
      </label>
      <div className="mt-1.5 grid grid-cols-4 gap-2">
        {[5, 12, 18, 28].map((r) => (
          <button
            key={r}
            onClick={() => setRate(r)}
            className={`rounded-lg border py-2 text-sm font-medium font-tabular transition-colors ${
              rate === r
                ? "border-ink bg-ink text-white"
                : "border-border bg-white text-ink-soft hover:border-ink"
            }`}
          >
            {r}%
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-2 rounded-xl bg-surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate">GST amount</span>
          <span className="font-tabular font-medium text-ink">
            {formatINR(result.gstAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2 text-[15px]">
          <span className="font-medium text-ink">Total payable</span>
          <span className="font-tabular text-lg font-semibold text-green-dark">
            {formatINR(result.totalAmount)}
          </span>
        </div>
      </div>

      <Button
        href="/tools/gst-calculator"
        variant="blue"
        className="mt-4 w-full"
      >
        Open full GST calculator
      </Button>
    </div>
  );
}
