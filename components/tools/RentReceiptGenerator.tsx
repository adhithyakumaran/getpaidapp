"use client";

import { useMemo, useState } from "react";
import { formatINRPrecise } from "@/lib/calculations";
import Button from "@/components/ui/Button";

export default function RentReceiptGenerator() {
  const [tenantName, setTenantName] = useState("Tenant Name");
  const [landlordName, setLandlordName] = useState("Landlord Name");
  const [landlordPan, setLandlordPan] = useState("");
  const [address, setAddress] = useState("");
  const [rentAmount, setRentAmount] = useState("18000");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
  });
  const [paymentDate, setPaymentDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [paymentMode, setPaymentMode] = useState("Bank transfer / UPI");

  const rentNumeric = useMemo(() => parseFloat(rentAmount) || 0, [rentAmount]);
  const requiresPan = rentNumeric * 12 > 100000;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6 print:hidden">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">Tenant &amp; landlord</h3>
          <div className="mt-4 space-y-3">
            <Field label="Tenant name" value={tenantName} onChange={setTenantName} />
            <Field label="Landlord name" value={landlordName} onChange={setLandlordName} />
            <Field label="Landlord PAN (required if annual rent > ₹1,00,000)" value={landlordPan} onChange={setLandlordPan} />
            <Field label="Rented property address" value={address} onChange={setAddress} textarea />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">Payment details</h3>
          <div className="mt-4 space-y-3">
            <Field label="Rent amount (monthly)" value={rentAmount} onChange={setRentAmount} />
            <Field label="For the month of" value={month} onChange={setMonth} />
            <div>
              <label className="block text-[13px] font-medium text-ink-soft">Payment date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] text-ink outline-none focus:border-blue"
              />
            </div>
            <Field label="Payment mode" value={paymentMode} onChange={setPaymentMode} />
          </div>
          {requiresPan && !landlordPan && (
            <div className="mt-4 rounded-lg border border-amber/20 bg-amber-tint px-4 py-3 text-[13px] leading-relaxed text-amber">
              Annual rent exceeds ₹1,00,000 — landlord PAN is required on the receipt for your HRA claim to be accepted.
            </div>
          )}
        </div>

        <Button onClick={() => window.print()} variant="green" size="lg" className="w-full">
          Download as PDF
        </Button>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-white p-8 print:rounded-none print:border-none print:p-0 shadow-[0_1px_2px_rgba(11,18,32,0.04),0_16px_40px_-16px_rgba(11,18,32,0.18)] print:shadow-none">
          <h2 className="text-center font-display text-[20px] font-semibold text-ink">
            Rent Receipt
          </h2>

          <div className="mt-6 space-y-3 text-[14px] leading-relaxed text-ink-soft">
            <p>
              Received a sum of{" "}
              <span className="font-tabular font-semibold text-ink">
                {formatINRPrecise(rentNumeric)}
              </span>{" "}
              from <span className="font-medium text-ink">{tenantName || "Tenant Name"}</span> towards
              rent for the month of <span className="font-medium text-ink">{month}</span>, for the
              property located at:
            </p>
            <p className="whitespace-pre-line rounded-lg bg-surface px-4 py-3 text-ink">
              {address || "Property address"}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[12px] text-slate-light">Payment date</span>
                <p className="font-tabular text-ink">{paymentDate}</p>
              </div>
              <div>
                <span className="text-[12px] text-slate-light">Payment mode</span>
                <p className="text-ink">{paymentMode}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-end justify-between border-t border-border pt-6">
            <div>
              <span className="text-[12px] text-slate-light">Landlord</span>
              <p className="font-medium text-ink">{landlordName || "Landlord Name"}</p>
              {landlordPan && (
                <p className="font-tabular text-[13px] text-slate">PAN: {landlordPan}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[12px] text-slate-light">Signature</p>
              <div className="mt-6 w-28 border-b border-border" />
            </div>
          </div>
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
