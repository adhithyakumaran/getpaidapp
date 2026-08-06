"use client";

import { useMemo, useState } from "react";
import {
  calculateGstExclusive,
  calculateGstInclusive,
  formatINRPrecise,
} from "@/lib/calculations";

const RATES = [5, 12, 18, 28];

export default function GstCalculator() {
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState(18);
  const [interState, setInterState] = useState(false);

  const result = useMemo(() => {
    const numeric = parseFloat(amount) || 0;
    return mode === "exclusive"
      ? calculateGstExclusive(numeric, rate, interState)
      : calculateGstInclusive(numeric, rate, interState);
  }, [amount, rate, mode, interState]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Inputs */}
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        <div className="flex rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setMode("exclusive")}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
              mode === "exclusive"
                ? "bg-ink text-white"
                : "text-slate hover:text-ink"
            }`}
          >
            Add GST
          </button>
          <button
            onClick={() => setMode("inclusive")}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
              mode === "inclusive"
                ? "bg-ink text-white"
                : "text-slate hover:text-ink"
            }`}
          >
            Remove GST
          </button>
        </div>

        <label className="mt-6 block text-sm font-medium text-ink-soft">
          {mode === "exclusive" ? "Amount before GST" : "Amount including GST"}
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
          GST rate
        </label>
        <div className="mt-1.5 grid grid-cols-4 gap-2.5">
          {RATES.map((r) => (
            <button
              key={r}
              onClick={() => setRate(r)}
              className={`rounded-lg border py-3 font-tabular text-[15px] font-medium transition-colors ${
                rate === r
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-white text-ink-soft hover:border-ink"
              }`}
            >
              {r}%
            </button>
          ))}
        </div>

        <label className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3.5">
          <input
            type="checkbox"
            checked={interState}
            onChange={(e) => setInterState(e.target.checked)}
            className="h-4 w-4 accent-blue"
          />
          <span className="text-sm text-ink-soft">
            Inter-state transaction (charge IGST instead of CGST + SGST)
          </span>
        </label>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">
          Result
        </span>

        <div className="mt-4 space-y-4">
          <ResultRow label="Base amount" value={result.baseAmount} muted />
          <ResultRow label="GST amount" value={result.gstAmount} muted />

          {interState ? (
            <ResultRow label="IGST" value={result.igst} muted />
          ) : (
            <>
              <ResultRow label="CGST" value={result.cgst} muted />
              <ResultRow label="SGST" value={result.sgst} muted />
            </>
          )}

          <div className="border-t border-white/15 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-medium text-white">
                Total amount
              </span>
              <span className="font-tabular text-2xl font-semibold text-green">
                {formatINRPrecise(result.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${muted ? "text-white/60" : "text-white"}`}>
        {label}
      </span>
      <span className="font-tabular text-[15px] text-white">
        {formatINRPrecise(value)}
      </span>
    </div>
  );
}
