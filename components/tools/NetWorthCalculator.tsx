"use client";

import { useMemo, useState } from "react";
import { calculateNetWorth, formatINRPrecise } from "@/lib/calculations";

export default function NetWorthCalculator() {
  const [cash, setCash] = useState("100000");
  const [investments, setInvestments] = useState("300000");
  const [property, setProperty] = useState("0");
  const [otherAssets, setOtherAssets] = useState("0");

  const [loans, setLoans] = useState("0");
  const [creditCard, setCreditCard] = useState("0");
  const [otherLiabilities, setOtherLiabilities] = useState("0");

  const result = useMemo(
    () =>
      calculateNetWorth(
        [parseFloat(cash) || 0, parseFloat(investments) || 0, parseFloat(property) || 0, parseFloat(otherAssets) || 0],
        [parseFloat(loans) || 0, parseFloat(creditCard) || 0, parseFloat(otherLiabilities) || 0]
      ),
    [cash, investments, property, otherAssets, loans, creditCard, otherLiabilities]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">Assets</h3>
          <div className="mt-4 space-y-4">
            <NumField label="Cash & bank balance" value={cash} onChange={setCash} />
            <NumField label="Investments (stocks, MF, FD, PPF etc.)" value={investments} onChange={setInvestments} />
            <NumField label="Property value" value={property} onChange={setProperty} />
            <NumField label="Other assets" value={otherAssets} onChange={setOtherAssets} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">Liabilities</h3>
          <div className="mt-4 space-y-4">
            <NumField label="Loans (home, car, personal)" value={loans} onChange={setLoans} />
            <NumField label="Credit card debt" value={creditCard} onChange={setCreditCard} />
            <NumField label="Other liabilities" value={otherLiabilities} onChange={setOtherLiabilities} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-ink p-6 text-white md:p-8 lg:sticky lg:top-24 lg:self-start">
        <span className="text-[13px] font-medium uppercase tracking-wide text-white/50">Net worth</span>
        <div className="mt-4 font-tabular text-3xl font-semibold text-green">
          {formatINRPrecise(result.netWorth)}
        </div>
        <div className="mt-6 space-y-2.5 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Total assets</span>
            <span className="font-tabular">{formatINRPrecise(result.totalAssets)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Total liabilities</span>
            <span className="font-tabular">{formatINRPrecise(result.totalLiabilities)}</span>
          </div>
        </div>
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
