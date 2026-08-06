"use client";

import { useMemo, useState } from "react";
import { calculateHraExemption, formatINR, formatINRPrecise } from "@/lib/calculations";

export default function HraCalculator() {
  const [basic, setBasic] = useState("40000");
  const [hra, setHra] = useState("20000");
  const [rent, setRent] = useState("18000");
  const [isMetro, setIsMetro] = useState(true);

  const result = useMemo(() => {
    const b = (parseFloat(basic) || 0) * 12;
    const h = (parseFloat(hra) || 0) * 12;
    const r = (parseFloat(rent) || 0) * 12;
    return calculateHraExemption(b, h, r, isMetro);
  }, [basic, hra, rent, isMetro]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 space-y-5">
        <NumField label="Monthly basic salary" value={basic} onChange={setBasic} />
        <NumField label="Monthly HRA received" value={hra} onChange={setHra} />
        <NumField label="Monthly rent paid" value={rent} onChange={setRent} />

        <div className="flex rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setIsMetro(true)}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
              isMetro ? "bg-ink text-white" : "text-slate hover:text-ink"
            }`}
          >
            Metro city
          </button>
          <button
            onClick={() => setIsMetro(false)}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
              !isMetro ? "bg-ink text-white" : "text-slate hover:text-ink"
            }`}
          >
            Non-metro city
          </button>
        </div>
        <p className="text-[12px] text-slate-light">
          Metro: Delhi, Mumbai, Kolkata, Chennai. All other cities are non-metro for this calculation.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">
          Annual HRA exemption
        </span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.exemptAmount)}
        </div>
        <div className="mt-6 space-y-2.5 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">HRA received (annual)</span>
            <span className="font-tabular">{formatINR(result.hraReceived)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Taxable HRA</span>
            <span className="font-tabular">{formatINR(result.taxableHra)}</span>
          </div>
        </div>
        <p className="mt-6 text-[12px] leading-relaxed text-white/40">
          Exemption is the least of: HRA received, rent minus 10% of basic, or 50%/40% of basic (metro/non-metro). Applies under the old tax regime only.
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
