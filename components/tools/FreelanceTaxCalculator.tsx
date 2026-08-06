"use client";

import { useMemo, useState } from "react";
import {
  calculateFreelanceTax,
  formatINR,
  formatINRPrecise,
} from "@/lib/calculations";

export default function FreelanceTaxCalculator() {
  const [receipts, setReceipts] = useState("1500000");

  const result = useMemo(() => {
    const numeric = parseFloat(receipts) || 0;
    return calculateFreelanceTax(numeric);
  }, [receipts]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        <label className="block text-sm font-medium text-ink-soft">
          Gross annual receipts (total billed to clients)
        </label>
        <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-4 focus-within:border-blue">
          <span className="font-tabular text-slate">₹</span>
          <input
            type="number"
            inputMode="decimal"
            value={receipts}
            onChange={(e) => setReceipts(e.target.value)}
            className="w-full bg-transparent py-3.5 pl-2 font-tabular text-lg text-ink outline-none"
          />
          <span className="shrink-0 text-sm text-slate">/ year</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {[600000, 1500000, 3000000, 5000000].map((val) => (
            <button
              key={val}
              onClick={() => setReceipts(String(val))}
              className={`rounded-lg border py-2.5 font-tabular text-sm font-medium transition-colors ${
                receipts === String(val)
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-white text-ink-soft hover:border-ink"
              }`}
            >
              {formatINR(val)}
            </button>
          ))}
        </div>

        {!result.eligibleFor44ADA && (
          <div className="mt-6 rounded-lg border border-amber/20 bg-amber-tint px-4 py-3 text-[13px] leading-relaxed text-amber">
            Your receipts exceed the ₹75L presumptive taxation limit (with
            95%+ digital receipts). Section 44ADA may not apply — regular
            books of account and audit rules could apply instead. Consult a
            CA.
          </div>
        )}

        <div className="mt-8 space-y-3 border-t border-border pt-6">
          <h3 className="text-[13px] font-medium uppercase tracking-wide text-slate">
            How this is calculated
          </h3>
          <BreakdownRow label="Gross receipts" value={result.grossReceipts} />
          <BreakdownRow
            label="Presumptive income (50% of receipts)"
            value={result.presumptiveIncome}
          />
          <BreakdownRow
            label="Standard deduction"
            value={result.standardDeduction}
            negative
          />
          <BreakdownRow
            label="Taxable income"
            value={result.taxableIncome}
          />
          <BreakdownRow
            label="Income tax + cess"
            value={result.totalTax}
            negative
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">
          Estimated net income
        </span>

        <div className="mt-4">
          <span className="text-sm text-white/60">
            After tax (annual)
          </span>
          <div className="font-tabular text-3xl font-semibold text-green">
            {formatINRPrecise(result.netIncome)}
          </div>
        </div>

        <div className="mt-6 border-t border-white/15 pt-4 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Effective tax rate</span>
            <span className="font-tabular text-white">
              {result.grossReceipts > 0
                ? ((result.totalTax / result.grossReceipts) * 100).toFixed(1)
                : "0"}
              %
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Total tax + cess</span>
            <span className="font-tabular text-white">
              {formatINR(result.totalTax)}
            </span>
          </div>
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-white/40">
          Estimate under Section 44ADA presumptive taxation (50% of receipts
          as income) and the new tax regime, FY 2025-26. Doesn&apos;t account
          for other income, deductions like 80C, or GST. Confirm with a CA
          before filing.
        </p>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate">{label}</span>
      <span
        className={`font-tabular font-medium ${
          negative ? "text-amber" : "text-ink"
        }`}
      >
        {negative ? "−" : ""}
        {formatINR(value)}
      </span>
    </div>
  );
}
