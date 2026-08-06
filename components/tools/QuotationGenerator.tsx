"use client";

import { useMemo, useState } from "react";
import { formatINRPrecise } from "@/lib/calculations";
import Button from "@/components/ui/Button";

interface LineItem {
  id: string;
  description: string;
  amount: number;
}

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `qitem-${idCounter}`;
}

export default function QuotationGenerator() {
  const [businessName, setBusinessName] = useState("Your Business Name");
  const [clientName, setClientName] = useState("Client Name");
  const [quoteNumber, setQuoteNumber] = useState("QUO-001");
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [terms, setTerms] = useState("50% advance to begin work, balance on delivery.");

  const [items, setItems] = useState<LineItem[]>([
    { id: newId(), description: "Project scope item", amount: 25000 },
  ]);

  function addItem() {
    setItems((prev) => [...prev, { id: newId(), description: "", amount: 0 }]);
  }
  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const total = useMemo(() => items.reduce((s, it) => s + it.amount, 0), [items]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6 print:hidden">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">Details</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Your business name" value={businessName} onChange={setBusinessName} />
            <Field label="Client name" value={clientName} onChange={setClientName} />
            <Field label="Quote number" value={quoteNumber} onChange={setQuoteNumber} />
            <div>
              <label className="block text-[13px] font-medium text-ink-soft">Valid until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] text-ink outline-none focus:border-blue"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[16px] font-semibold text-ink">Scope items</h3>
            <button onClick={addItem} className="text-[13px] font-medium text-blue hover:underline">
              + Add item
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Description"
                  className="col-span-8 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-blue"
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updateItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Amount"
                  className="col-span-3 rounded-lg border border-border bg-surface px-2 py-2 text-[13px] font-tabular text-ink outline-none focus:border-blue"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="col-span-1 flex items-center justify-center text-slate-light hover:text-amber"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <Field label="Terms" value={terms} onChange={setTerms} textarea />
        </div>

        <Button onClick={() => window.print()} variant="green" size="lg" className="w-full">
          Download as PDF
        </Button>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-white p-8 print:rounded-none print:border-none print:p-0 shadow-[0_1px_2px_rgba(11,18,32,0.04),0_16px_40px_-16px_rgba(11,18,32,0.18)] print:shadow-none">
          <div className="flex items-start justify-between">
            <h2 className="font-display text-[20px] font-semibold text-ink">
              {businessName || "Your Business Name"}
            </h2>
            <div className="text-right">
              <h3 className="font-display text-[22px] font-semibold text-blue">QUOTATION</h3>
              <p className="mt-1 font-tabular text-[13px] text-slate">{quoteNumber}</p>
              <p className="font-tabular text-[13px] text-slate">Valid until {validUntil}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <span className="text-[12px] font-medium uppercase tracking-wide text-slate-light">Prepared for</span>
            <p className="mt-1.5 text-[15px] font-medium text-ink">{clientName || "Client Name"}</p>
          </div>

          <table className="mt-8 w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-slate-light">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="py-2.5 text-ink">{item.description || "—"}</td>
                  <td className="py-2.5 text-right font-tabular text-ink">{formatINRPrecise(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="flex w-56 justify-between border-t border-border pt-2 text-[15px] font-semibold text-ink">
              <span>Total estimate</span>
              <span className="font-tabular text-green-dark">{formatINRPrecise(total)}</span>
            </div>
          </div>

          {terms && (
            <div className="mt-8 border-t border-border pt-4">
              <p className="text-[12px] text-slate">{terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink-soft">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] text-ink outline-none focus:border-blue resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] text-ink outline-none focus:border-blue"
        />
      )}
    </div>
  );
}
