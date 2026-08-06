"use client";

import { useMemo, useState } from "react";
import { convertCurrency } from "@/lib/calculations";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SGD", "AUD"];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("83.5");
  const [currency, setCurrency] = useState("USD");
  const [direction, setDirection] = useState<"to-inr" | "from-inr">("to-inr");

  const result = useMemo(
    () => convertCurrency(parseFloat(amount) || 0, parseFloat(rate) || 0),
    [amount, rate]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        <div className="flex rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setDirection("to-inr")}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
              direction === "to-inr" ? "bg-ink text-white" : "text-slate hover:text-ink"
            }`}
          >
            {currency} → INR
          </button>
          <button
            onClick={() => setDirection("from-inr")}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
              direction === "from-inr" ? "bg-ink text-white" : "text-slate hover:text-ink"
            }`}
          >
            INR → {currency}
          </button>
        </div>

        <label className="mt-6 block text-sm font-medium text-ink-soft">Currency</label>
        <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                currency === c ? "border-ink bg-ink text-white" : "border-border bg-white text-ink-soft hover:border-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="mt-6 block text-sm font-medium text-ink-soft">Amount</label>
        <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-4 focus-within:border-blue">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent py-3 font-tabular text-[16px] text-ink outline-none"
          />
          <span className="shrink-0 text-sm text-slate">
            {direction === "to-inr" ? currency : "INR"}
          </span>
        </div>

        <label className="mt-6 block text-sm font-medium text-ink-soft">
          Exchange rate (1 {currency} = ? INR)
        </label>
        <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-4 focus-within:border-blue">
          <input
            type="number"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full bg-transparent py-3 font-tabular text-[16px] text-ink outline-none"
          />
        </div>
        <p className="mt-2 text-[12px] text-slate-light">
          Enter today&apos;s rate manually — check your bank or Google for the current mid-market rate.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Converted amount</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {direction === "to-inr"
            ? `₹${result.converted.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
            : `${(result.amount / (result.rate || 1)).toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${currency}`}
        </div>
        <p className="mt-6 text-[12px] leading-relaxed text-white/40">
          Actual rates from banks and payment platforms include a margin over the mid-market rate — your final received amount is usually a little lower than this.
        </p>
      </div>
    </div>
  );
}
