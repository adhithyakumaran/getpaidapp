import Link from "next/link";
import Container from "@/components/ui/Container";

const columns = [
  {
    title: "Calculators",
    links: [
      { label: "GST Calculator", href: "/tools/gst-calculator" },
      { label: "In-hand Salary Calculator", href: "/tools/salary-calculator" },
      { label: "Freelance Tax Calculator", href: "/tools/freelance-tax-calculator" },
      { label: "Invoice Generator", href: "/tools/invoice-generator" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "Receive PayPal payments in India", href: "/guides/receive-paypal-in-india" },
      { label: "Stripe alternatives in India", href: "/guides/stripe-alternatives-india" },
      { label: "Best payment gateway for freelancers", href: "/guides/best-payment-gateway-freelancers" },
      { label: "GST invoice format", href: "/guides/gst-invoice-format" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "Payment gateways in India", href: "/tools/payment-gateway-comparison" },
      { label: "Freelance tax calculator", href: "/tools/freelance-tax-calculator" },
      { label: "Invoice generator", href: "/tools/invoice-generator" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About GetPaid", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-white font-display text-[13px] font-bold">
                ₹
              </span>
              <span className="font-display text-[17px] font-semibold text-ink">
                Get<span className="text-green">Paid</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Free tools and guides to help Indian freelancers and businesses
              get paid, priced right, and compliant.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft hover:text-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-border pt-6 md:flex-row md:items-center">
          <p className="text-sm text-slate">
            © {new Date().getFullYear()} GetPaid.in — Built for freelancers
            and small businesses in India.
          </p>
          <p className="text-sm text-slate-light">
            Not a substitute for professional tax or legal advice.
          </p>
        </div>
      </Container>
    </footer>
  );
}
