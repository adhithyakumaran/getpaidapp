"use client";

import { useMemo, useState } from "react";
import { calculateRetirementCorpus, formatINR, formatINRPrecise } from "@/lib/calculations";

export default function RetirementCorpusCalculator() {
  const [expense, setExpense] = useState("50000");
  const [years, setYears] = useState("25");
  const [inflation, setInflation] = useState("6");
  const [returns, setReturns] = useState("11");

  const result = useMemo(
    () =>
      calculateRetirementCorpus(
        parseFloat(expense) || 0,
        parseFloat(years) || 1,
        parseFloat(inflation) || 0,
        parseFloat(returns) || 0
      ),
    [expense, years, inflation, returns]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Current monthly expenses" value={expense} onChange={setExpense} prefix="₹" />
        <NumField label="Years until retirement" value={years} onChange={setYears} suffix="yr" />
        <NumField label="Expected inflation" value={inflation} onChange={setInflation} suffix="%" />
        <NumField label="Expected investment return" value={returns} onChange={setReturns} suffix="%" />
        <p className="text-[12px] leading-relaxed text-slate-light">
          Uses the common &ldquo;25×&rdquo; rule of thumb — a corpus of 25 times your annual expenses at retirement, based on a 4% safe withdrawal rate.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Corpus needed</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.requiredCorpus)}
        </div>

        <div className="mt-6 border-t border-white/15 pt-5">
          <span className="text-[12px] text-white/50">Monthly SIP needed to get there</span>
          <div className="font-tabular text-xl font-semibold text-white">
            {formatINRPrecise(result.requiredMonthlySip)}
          </div>
        </div>

        <div className="mt-5 flex justify-between border-t border-white/15 pt-4 text-sm">
          <span className="text-white/60">Monthly expense at retirement</span>
          <span className="font-tabular">{formatINR(result.futureMonthlyExpense)}</span>
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-white/40">
          A planning estimate, not a guarantee — actual returns and inflation vary. Revisit this calculation periodically as your income and goals change.
        </p>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, prefix, suffix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
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
        {suffix && <span className="shrink-0 text-sm text-slate">{suffix}</span>}
      </div>
    </div>
  );
}
