"use client";

import { useMemo, useState } from "react";
import { calculateLatePaymentInterest, formatINRPrecise } from "@/lib/calculations";

export default function LatePaymentCalculator() {
  const [amount, setAmount] = useState("50000");
  const [days, setDays] = useState("30");
  const [rate, setRate] = useState("18");

  const result = useMemo(
    () =>
      calculateLatePaymentInterest(
        parseFloat(amount) || 0,
        parseFloat(days) || 0,
        parseFloat(rate) || 0
      ),
    [amount, days, rate]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Overdue invoice amount" value={amount} onChange={setAmount} prefix="₹" />
        <NumField label="Days overdue" value={days} onChange={setDays} suffix="days" />
        <NumField label="Annual interest rate" value={rate} onChange={setRate} suffix="%" />
        <p className="text-[12px] leading-relaxed text-slate-light">
          Under the MSME Act, if you&apos;re Udyam-registered and the client agreed to (or exceeded) a 45-day payment term, you may be entitled to compound interest at 3× the RBI bank rate — check current rules for your exact entitlement.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Total now owed</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.totalOwed)}
        </div>
        <div className="mt-6 flex justify-between border-t border-white/15 pt-4 text-sm">
          <span className="text-white/60">Interest accrued</span>
          <span className="font-tabular">{formatINRPrecise(result.interestOwed)}</span>
        </div>
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
