"use client";

import { useMemo, useState } from "react";
import { calculateHourlyRate, formatINR, formatINRPrecise } from "@/lib/calculations";

export default function FreelanceRateCalculator() {
  const [income, setIncome] = useState("1200000");
  const [days, setDays] = useState("240");
  const [hours, setHours] = useState("8");
  const [billable, setBillable] = useState("70");

  const result = useMemo(() => {
    return calculateHourlyRate(
      parseFloat(income) || 0,
      parseFloat(days) || 1,
      parseFloat(hours) || 1,
      parseFloat(billable) || 1
    );
  }, [income, days, hours, billable]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Desired annual income" value={income} onChange={setIncome} prefix="₹" />
        <NumField label="Working days per year" value={days} onChange={setDays} suffix="days" />
        <NumField label="Working hours per day" value={hours} onChange={setHours} suffix="hrs" />
        <NumField label="% of time actually billable" value={billable} onChange={setBillable} suffix="%" />
        <p className="text-[12px] leading-relaxed text-slate-light">
          Billable percentage accounts for time spent on admin, marketing, and finding clients — most freelancers bill 60-80% of their working hours, not 100%.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">
          Rate you need to charge
        </span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.hourlyRate)}
          <span className="text-base text-white/50"> /hour</span>
        </div>
        <div className="mt-6 space-y-2.5 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Equivalent daily rate</span>
            <span className="font-tabular">{formatINR(result.dailyRate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Billable hours/year</span>
            <span className="font-tabular">{Math.round(result.billableHoursPerYear)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) {
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
