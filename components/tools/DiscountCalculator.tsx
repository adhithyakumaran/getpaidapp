"use client";

import { useMemo, useState } from "react";
import { calculateDiscount, formatINRPrecise } from "@/lib/calculations";

export default function DiscountCalculator() {
  const [price, setPrice] = useState("2000");
  const [discount, setDiscount] = useState("25");

  const result = useMemo(
    () => calculateDiscount(parseFloat(price) || 0, parseFloat(discount) || 0),
    [price, discount]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Original price" value={price} onChange={setPrice} prefix="₹" />
        <div>
          <label className="block text-sm font-medium text-ink-soft">Discount</label>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {[10, 25, 50, 75].map((d) => (
              <button
                key={d}
                onClick={() => setDiscount(String(d))}
                className={`rounded-lg border py-2.5 font-tabular text-sm font-medium transition-colors ${
                  discount === String(d) ? "border-ink bg-ink text-white" : "border-border bg-white text-ink-soft hover:border-ink"
                }`}
              >
                {d}%
              </button>
            ))}
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="mt-3 w-full rounded-lg border border-border bg-surface px-4 py-3 font-tabular text-[16px] text-ink outline-none focus:border-blue"
            placeholder="Custom % discount"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">You pay</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.finalPrice)}
        </div>
        <div className="mt-6 flex justify-between border-t border-white/15 pt-4 text-sm">
          <span className="text-white/60">You save</span>
          <span className="font-tabular">{formatINRPrecise(result.discountAmount)}</span>
        </div>
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
