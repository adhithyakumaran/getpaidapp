import type { Metadata } from "next";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Payment Gateway Comparison — Razorpay vs Cashfree vs PayPal & More",
  description:
    "Compare payment gateways for Indian freelancers and businesses: domestic options like Razorpay and Cashfree, and international options like PayPal, Wise, and Payoneer.",
  alternates: { canonical: "/tools/payment-gateway-comparison" },
};

interface Gateway {
  name: string;
  bestFor: string;
  typicalFees: string;
  settlement: string;
  notes: string;
}

const domestic: Gateway[] = [
  {
    name: "Razorpay",
    bestFor: "Full-featured domestic payments & subscriptions",
    typicalFees: "~2% per domestic transaction (varies by method)",
    settlement: "T+2 days typically, faster plans available",
    notes: "Broadest payment method support: cards, UPI, netbanking, wallets, EMI.",
  },
  {
    name: "Cashfree",
    bestFor: "Payouts, split payments, marketplaces",
    typicalFees: "~1.75–2% per domestic transaction (varies by method)",
    settlement: "T+2 days typically, faster plans available",
    notes: "Strong payout/vendor-payment API alongside collections.",
  },
  {
    name: "Instamojo",
    bestFor: "Simple payment links, small sellers",
    typicalFees: "~2–3% per transaction",
    settlement: "T+3 to T+5 days typically",
    notes: "Fastest to set up for a single payment link, less suited to deep API integration.",
  },
  {
    name: "PayU",
    bestFor: "Larger e-commerce, broad method coverage",
    typicalFees: "~2% per domestic transaction (varies by volume)",
    settlement: "T+2 to T+3 days typically",
    notes: "Established player, often negotiates custom rates at higher volume.",
  },
];

const international: Gateway[] = [
  {
    name: "PayPal",
    bestFor: "One-off or infrequent international client payments",
    typicalFees: "Percentage + fixed fee, plus currency conversion margin",
    settlement: "Withdraw to Indian bank account, few business days",
    notes: "Highest client familiarity and trust; costliest for larger/frequent payments.",
  },
  {
    name: "Wise",
    bestFor: "Recurring international client relationships",
    typicalFees: "Low, transparent fee close to the real exchange rate",
    settlement: "Usually 1–2 business days",
    notes: "Best value once payment volume or frequency is meaningful.",
  },
  {
    name: "Payoneer",
    bestFor: "Freelancers on Upwork, Fiverr, and similar platforms",
    typicalFees: "Withdrawal and conversion fees apply, tiered by volume",
    settlement: "Usually 2–4 business days",
    notes: "Gives you local receiving accounts (USD/EUR/GBP) that feel domestic to your client.",
  },
];

export default function PaymentGatewayComparisonPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">
            Payments
          </span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">
            Payment Gateway Comparison
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Fees and settlement times for the payment gateways Indian
            freelancers and businesses actually use — split by domestic and
            international clients.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-amber/20 bg-amber-tint px-5 py-4 text-[13px] leading-relaxed text-amber">
          Fees, settlement times, and supported methods change frequently.
          These are typical ranges for orientation — always confirm current
          pricing on the provider&apos;s own website before choosing one.
        </div>

        <h2 className="mt-12 font-display text-[22px] font-semibold text-ink">
          For domestic (Indian) clients
        </h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <Th>Gateway</Th>
                <Th>Best for</Th>
                <Th>Typical fees</Th>
                <Th>Settlement</Th>
              </tr>
            </thead>
            <tbody>
              {domestic.map((g) => (
                <Row key={g.name} gateway={g} />
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-14 font-display text-[22px] font-semibold text-ink">
          For international clients
        </h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <Th>Gateway</Th>
                <Th>Best for</Th>
                <Th>Typical fees</Th>
                <Th>Settlement</Th>
              </tr>
            </thead>
            <tbody>
              {international.map((g) => (
                <Row key={g.name} gateway={g} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-14 max-w-2xl rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-display text-[17px] font-semibold text-ink">
            Quick way to decide
          </h3>
          <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-ink-soft">
            <li>Mostly Indian clients → Razorpay or Cashfree, or a plain UPI link for smaller work.</li>
            <li>Recurring international clients → Wise, for the better exchange rate over time.</li>
            <li>One-off international clients → PayPal, for the client&apos;s familiarity.</li>
            <li>Paid via Upwork/Fiverr → use whichever withdrawal method the platform supports; Payoneer is common.</li>
          </ul>
        </div>
      </Container>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-light">
      {children}
    </th>
  );
}

function Row({ gateway }: { gateway: Gateway }) {
  return (
    <tr className="border-t border-border">
      <td className="px-5 py-4 font-medium text-ink">{gateway.name}</td>
      <td className="px-5 py-4 text-ink-soft">{gateway.bestFor}</td>
      <td className="px-5 py-4 font-tabular text-ink-soft">
        {gateway.typicalFees}
      </td>
      <td className="px-5 py-4 text-ink-soft">{gateway.settlement}</td>
    </tr>
  );
}
