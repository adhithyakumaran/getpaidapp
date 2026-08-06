"use client";

import { useMemo, useState } from "react";
import { calculateInHandSalary, formatINR, formatINRPrecise } from "@/lib/calculations";

export default function SalaryCalculator() {
  const [ctc, setCtc] = useState("1200000");

  const result = useMemo(() => {
    const numeric = parseFloat(ctc) || 0;
    return calculateInHandSalary(numeric);
  }, [ctc]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      {/* Inputs */}
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        <label className="block text-sm font-medium text-ink-soft">
          Annual CTC (Cost to Company)
        </label>
        <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-4 focus-within:border-blue">
          <span className="font-tabular text-slate">₹</span>
          <input
            type="number"
            inputMode="decimal"
            value={ctc}
            onChange={(e) => setCtc(e.target.value)}
            className="w-full bg-transparent py-3.5 pl-2 font-tabular text-lg text-ink outline-none"
          />
          <span className="shrink-0 text-sm text-slate">/ year</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {[600000, 1200000, 2400000, 3600000].map((val) => (
            <button
              key={val}
              onClick={() => setCtc(String(val))}
              className={`rounded-lg border py-2.5 font-tabular text-sm font-medium transition-colors ${
                ctc === String(val)
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-white text-ink-soft hover:border-ink"
              }`}
            >
              {formatINR(val)}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-3 border-t border-border pt-6">
          <h3 className="text-[13px] font-medium uppercase tracking-wide text-slate">
            Breakdown (annual)
          </h3>
          <BreakdownRow label="Basic salary" value={result.basic} />
          <BreakdownRow label="HRA" value={result.hra} />
          <BreakdownRow
            label="Special allowance"
            value={result.specialAllowance}
          />
          <BreakdownRow
            label="Employer PF contribution"
            value={result.employerPf}
            negative
          />
          <BreakdownRow
            label="Employee PF contribution"
            value={result.employeePf}
            negative
          />
          <BreakdownRow
            label="Professional tax"
            value={result.professionalTax}
            negative
          />
          <BreakdownRow
            label="Income tax + cess"
            value={result.totalTax}
            negative
          />
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">
          Take-home
        </span>

        <div className="mt-4">
          <span className="text-sm text-white/60">Monthly in-hand</span>
          <div className="font-tabular text-3xl font-semibold text-green">
            {formatINRPrecise(result.monthlyInHand)}
          </div>
        </div>

        <div className="mt-6 border-t border-white/15 pt-4">
          <span className="text-sm text-white/60">Annual in-hand</span>
          <div className="font-tabular text-xl font-semibold text-white">
            {formatINRPrecise(result.annualInHand)}
          </div>
        </div>

        <div className="mt-6 border-t border-white/15 pt-4 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Taxable income</span>
            <span className="font-tabular text-white">
              {formatINR(result.taxableIncome)}
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
          Estimate based on new tax regime (FY 2025-26), standard 40% basic
          salary structure. Actual in-hand pay depends on your company&apos;s
          specific salary structure, deductions, and state PT rules.
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
