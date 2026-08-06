"use client";

import { useMemo, useState } from "react";
import { formatINRPrecise } from "@/lib/calculations";
import Button from "@/components/ui/Button";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `item-${idCounter}`;
}

export default function InvoiceGenerator() {
  const [businessName, setBusinessName] = useState("Your Business Name");
  const [businessGstin, setBusinessGstin] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [clientName, setClientName] = useState("Client Name");
  const [clientAddress, setClientAddress] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstRate, setGstRate] = useState(18);
  const [notes, setNotes] = useState("Payment due within 15 days.");

  const [items, setItems] = useState<LineItem[]>([
    { id: newId(), description: "Web design services", quantity: 1, rate: 25000 },
  ]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: newId(), description: "", quantity: 1, rate: 0 },
    ]);
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity * it.rate, 0),
    [items]
  );
  const gstAmount = gstEnabled ? (subtotal * gstRate) / 100 : 0;
  const total = subtotal + gstAmount;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-6 print:hidden">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">
            Your details
          </h3>
          <div className="mt-4 space-y-3">
            <Field label="Business / your name" value={businessName} onChange={setBusinessName} />
            <Field label="GSTIN (optional)" value={businessGstin} onChange={setBusinessGstin} />
            <Field label="Address" value={businessAddress} onChange={setBusinessAddress} textarea />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">
            Bill to
          </h3>
          <div className="mt-4 space-y-3">
            <Field label="Client name" value={clientName} onChange={setClientName} />
            <Field label="Client address" value={clientAddress} onChange={setClientAddress} textarea />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">
            Invoice details
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Invoice number" value={invoiceNumber} onChange={setInvoiceNumber} />
            <div>
              <label className="block text-[13px] font-medium text-ink-soft">
                Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] text-ink outline-none focus:border-blue"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[16px] font-semibold text-ink">
              Line items
            </h3>
            <button
              onClick={addItem}
              className="text-[13px] font-medium text-blue hover:underline"
            >
              + Add item
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2">
                <input
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, { description: e.target.value })
                  }
                  placeholder="Description"
                  className="col-span-6 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-blue"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, {
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Qty"
                  className="col-span-2 rounded-lg border border-border bg-surface px-2 py-2 text-[13px] font-tabular text-ink outline-none focus:border-blue"
                />
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) =>
                    updateItem(item.id, {
                      rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Rate"
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

          <label className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
            <input
              type="checkbox"
              checked={gstEnabled}
              onChange={(e) => setGstEnabled(e.target.checked)}
              className="h-4 w-4 accent-blue"
            />
            <span className="text-sm text-ink-soft">Apply GST</span>
            {gstEnabled && (
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="ml-auto rounded-md border border-border bg-white px-2 py-1 text-sm text-ink"
              >
                {[5, 12, 18, 28].map((r) => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </select>
            )}
          </label>

          <Field label="Notes" value={notes} onChange={setNotes} textarea />
        </div>

        <Button onClick={() => window.print()} variant="green" size="lg" className="w-full">
          Download as PDF
        </Button>
        <p className="text-center text-[12px] text-slate-light">
          Opens your browser&apos;s print dialog — choose &ldquo;Save as
          PDF&rdquo; as the destination.
        </p>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div
          id="invoice-preview"
          className="rounded-2xl border border-border bg-white p-8 print:rounded-none print:border-none print:p-0 shadow-[0_1px_2px_rgba(11,18,32,0.04),0_16px_40px_-16px_rgba(11,18,32,0.18)] print:shadow-none"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-[20px] font-semibold text-ink">
                {businessName || "Your Business Name"}
              </h2>
              {businessGstin && (
                <p className="mt-1 text-[13px] text-slate">GSTIN: {businessGstin}</p>
              )}
              {businessAddress && (
                <p className="mt-1 whitespace-pre-line text-[13px] text-slate">
                  {businessAddress}
                </p>
              )}
            </div>
            <div className="text-right">
              <h3 className="font-display text-[22px] font-semibold text-blue">
                INVOICE
              </h3>
              <p className="mt-1 font-tabular text-[13px] text-slate">
                {invoiceNumber}
              </p>
              <p className="font-tabular text-[13px] text-slate">
                {invoiceDate}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <span className="text-[12px] font-medium uppercase tracking-wide text-slate-light">
              Bill to
            </span>
            <p className="mt-1.5 text-[15px] font-medium text-ink">
              {clientName || "Client Name"}
            </p>
            {clientAddress && (
              <p className="mt-0.5 whitespace-pre-line text-[13px] text-slate">
                {clientAddress}
              </p>
            )}
          </div>

          <table className="mt-8 w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-slate-light">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 text-right font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Rate</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="py-2.5 text-ink">
                    {item.description || "—"}
                  </td>
                  <td className="py-2.5 text-right font-tabular text-ink">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 text-right font-tabular text-ink">
                    {formatINRPrecise(item.rate)}
                  </td>
                  <td className="py-2.5 text-right font-tabular text-ink">
                    {formatINRPrecise(item.quantity * item.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="w-56 space-y-2">
              <div className="flex justify-between text-[13px] text-slate">
                <span>Subtotal</span>
                <span className="font-tabular">
                  {formatINRPrecise(subtotal)}
                </span>
              </div>
              {gstEnabled && (
                <div className="flex justify-between text-[13px] text-slate">
                  <span>GST ({gstRate}%)</span>
                  <span className="font-tabular">
                    {formatINRPrecise(gstAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-[15px] font-semibold text-ink">
                <span>Total</span>
                <span className="font-tabular text-green-dark">
                  {formatINRPrecise(total)}
                </span>
              </div>
            </div>
          </div>

          {notes && (
            <div className="mt-8 border-t border-border pt-4">
              <p className="text-[12px] text-slate">{notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
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
