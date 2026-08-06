"use client";

import { useMemo, useState } from "react";
import { compareRegimes, formatINR, formatINRPrecise } from "@/lib/calculations";

export default function TaxRegimeComparison() {
  const [income, setIncome] = useState("1200000");
  const [deductions80c, setDeductions80c] = useState("150000");
  const [hraExemption, setHraExemption] = useState("0");

  const result = useMemo(() => {
    return compareRegimes(
      parseFloat(income) || 0,
      parseFloat(deductions80c) || 0,
      parseFloat(hraExemption) || 0
    );
  }, [income, deductions80c, hraExemption]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Gross annual income" value={income} onChange={setIncome} />
        <NumField
          label="Section 80C deductions (PF, ELSS, insurance etc.)"
          value={deductions80c}
          onChange={setDeductions80c}
        />
        <NumField
          label="HRA exemption (if any)"
          value={hraExemption}
          onChange={setHraExemption}
        />
        <p className="text-[12px] leading-relaxed text-slate-light">
          80C and HRA exemptions only reduce tax under the old regime — the new regime doesn&apos;t allow most deductions but has lower rates and a higher standard deduction.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">
          Recommended regime
        </span>
        <div className="mt-4 font-display text-2xl font-semibold text-green">
          {result.betterRegime === "new" ? "New Regime" : "Old Regime"}
        </div>
        <p className="mt-1 text-sm text-white/60">
          Saves you {formatINRPrecise(result.savings)} per year
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
          <div>
            <span className="text-[12px] text-white/50">Old regime tax</span>
            <div className="font-tabular text-lg font-semibold text-white">
              {formatINR(result.oldRegime.total)}
            </div>
          </div>
          <div>
            <span className="text-[12px] text-white/50">New regime tax</span>
            <div className="font-tabular text-lg font-semibold text-white">
              {formatINR(result.newRegime.total)}
            </div>
          </div>
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-white/40">
          Simplified comparison — doesn&apos;t include every deduction (NPS, home loan interest, etc). Confirm with a CA for a decision that affects your filing.
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
