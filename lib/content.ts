export interface ToolMeta {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  status: "live" | "coming-soon";
  category: string;
}

export const tools: ToolMeta[] = [
  {
    slug: "gst-calculator",
    title: "GST Calculator",
    shortTitle: "GST Calculator",
    description:
      "Add or remove GST from any amount. CGST/SGST and IGST breakdown included.",
    status: "live",
    category: "Tax",
  },
  {
    slug: "salary-calculator",
    title: "In-hand Salary Calculator",
    shortTitle: "Salary Calculator",
    description:
      "Convert your CTC into monthly in-hand salary with PF and tax deducted.",
    status: "live",
    category: "Salary",
  },
  {
    slug: "invoice-generator",
    title: "Invoice Generator",
    shortTitle: "Invoice Generator",
    description:
      "Create a GST-compliant invoice as a PDF in under a minute. No sign-up.",
    status: "live",
    category: "Invoicing",
  },
  {
    slug: "freelance-tax-calculator",
    title: "Freelance Tax Calculator",
    shortTitle: "Freelance Tax",
    description:
      "Estimate tax under presumptive taxation (Section 44ADA) for freelancers.",
    status: "live",
    category: "Tax",
  },
  {
    slug: "payment-gateway-comparison",
    title: "Payment Gateway Comparison",
    shortTitle: "Gateway Comparison",
    description:
      "Compare fees, settlement time, and support across Razorpay, Cashfree, PayPal & more.",
    status: "live",
    category: "Payments",
  },
  {
    slug: "hra-calculator",
    title: "HRA Exemption Calculator",
    shortTitle: "HRA Calculator",
    description:
      "Calculate your HRA tax exemption from basic salary, HRA received, and rent paid.",
    status: "live",
    category: "Salary",
  },
  {
    slug: "tds-calculator",
    title: "TDS Calculator",
    shortTitle: "TDS Calculator",
    description:
      "Calculate TDS deducted under Section 194J or 194C and your net receivable amount.",
    status: "live",
    category: "Tax",
  },
  {
    slug: "emi-calculator",
    title: "EMI Calculator",
    shortTitle: "EMI Calculator",
    description:
      "Calculate monthly EMI, total interest, and total repayment for any loan.",
    status: "live",
    category: "Loans",
  },
  {
    slug: "sip-calculator",
    title: "SIP Calculator",
    shortTitle: "SIP Calculator",
    description:
      "Estimate the future value of your monthly SIP investment.",
    status: "live",
    category: "Investing",
  },
  {
    slug: "freelance-rate-calculator",
    title: "Freelance Hourly Rate Calculator",
    shortTitle: "Rate Calculator",
    description:
      "Find the hourly or daily rate you need to charge to hit your income goal.",
    status: "live",
    category: "Freelancing",
  },
  {
    slug: "tax-regime-comparison",
    title: "Old vs New Tax Regime Calculator",
    shortTitle: "Regime Comparison",
    description:
      "Compare your tax liability under the old and new tax regimes side by side.",
    status: "live",
    category: "Tax",
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    shortTitle: "Percentage Calculator",
    description: "Quick X% of Y, what-percent, and percentage change calculations.",
    status: "live",
    category: "Basic Math",
  },
  {
    slug: "discount-calculator",
    title: "Discount Calculator",
    shortTitle: "Discount Calculator",
    description: "Calculate the final price after a percentage discount.",
    status: "live",
    category: "Basic Math",
  },
  {
    slug: "profit-margin-calculator",
    title: "Profit Margin Calculator",
    shortTitle: "Margin Calculator",
    description: "Calculate profit margin and markup from cost and selling price.",
    status: "live",
    category: "Business",
  },
  {
    slug: "ppf-calculator",
    title: "PPF Calculator",
    shortTitle: "PPF Calculator",
    description: "Calculate the maturity value of your PPF investment.",
    status: "live",
    category: "Investing",
  },
  {
    slug: "gratuity-calculator",
    title: "Gratuity Calculator",
    shortTitle: "Gratuity Calculator",
    description: "Calculate gratuity from last drawn salary and years of service.",
    status: "live",
    category: "Salary",
  },
  {
    slug: "break-even-calculator",
    title: "Break-even Calculator",
    shortTitle: "Break-even Calculator",
    description: "Find the units and revenue needed to break even on your costs.",
    status: "live",
    category: "Business",
  },
  {
    slug: "currency-converter",
    title: "Currency Converter",
    shortTitle: "Currency Converter",
    description: "Convert INR to USD, EUR, GBP and other major currencies.",
    status: "live",
    category: "Payments",
  },
  {
    slug: "interest-calculator",
    title: "Simple & Compound Interest Calculator",
    shortTitle: "Interest Calculator",
    description: "Calculate simple or compound interest on any amount.",
    status: "live",
    category: "Basic Math",
  },
  {
    slug: "nps-calculator",
    title: "NPS Calculator",
    shortTitle: "NPS Calculator",
    description: "Estimate your NPS retirement corpus and monthly pension.",
    status: "live",
    category: "Investing",
  },
  {
    slug: "rent-receipt-generator",
    title: "Rent Receipt Generator",
    shortTitle: "Rent Receipt",
    description: "Generate a rent receipt for your HRA exemption claim.",
    status: "live",
    category: "Salary",
  },
  {
    slug: "quotation-generator",
    title: "Quotation Generator",
    shortTitle: "Quotation Generator",
    description: "Create a professional project quotation or estimate as a PDF.",
    status: "live",
    category: "Invoicing",
  },
  {
    slug: "late-payment-interest-calculator",
    title: "Late Payment Interest Calculator",
    shortTitle: "Late Payment Interest",
    description: "Calculate interest owed on an overdue client invoice.",
    status: "live",
    category: "Freelancing",
  },
  {
    slug: "retirement-corpus-calculator",
    title: "Retirement Corpus Calculator",
    shortTitle: "Retirement Corpus",
    description: "Find out how much you need to retire and the SIP required.",
    status: "live",
    category: "Investing",
  },
  {
    slug: "net-worth-calculator",
    title: "Net Worth Calculator",
    shortTitle: "Net Worth Calculator",
    description: "Track your assets vs liabilities to see your net worth.",
    status: "live",
    category: "Personal Finance",
  },
];

export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  status: "live" | "coming-soon";
  readTime: string;
  updated: string;
}

export const guides: GuideMeta[] = [
  {
    slug: "receive-paypal-in-india",
    title: "How to receive PayPal payments in India",
    description:
      "The legal, low-fee way to get PayPal payouts as a freelancer or business in India.",
    status: "live",
    readTime: "7 min read",
    updated: "August 2026",
  },
  {
    slug: "stripe-alternatives-india",
    title: "Best Stripe alternatives for Indian businesses",
    description:
      "Stripe has limited India support — here's what freelancers and startups use instead.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "best-payment-gateway-freelancers",
    title: "Best payment gateway for freelancers in 2026",
    description: "Fees, payout speed, and international support compared.",
    status: "live",
    readTime: "8 min read",
    updated: "August 2026",
  },
  {
    slug: "gst-invoice-format",
    title: "GST invoice format: what's mandatory in 2026",
    description:
      "The exact fields a GST-compliant invoice needs, with a free template.",
    status: "live",
    readTime: "5 min read",
    updated: "August 2026",
  },
  {
    slug: "how-to-price-freelance-projects",
    title: "How to price freelance projects in India",
    description:
      "Hourly vs fixed pricing, and how to quote projects without underselling yourself.",
    status: "live",
    readTime: "7 min read",
    updated: "August 2026",
  },
  {
    slug: "tds-on-freelance-income-explained",
    title: "TDS on freelance income, explained simply",
    description:
      "What TDS is, why clients deduct it, and how to claim it back at tax filing time.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "old-vs-new-tax-regime-freelancers",
    title: "Old vs new tax regime: which should freelancers pick?",
    description:
      "How the presumptive taxation scheme interacts with regime choice for freelancers.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "gst-registration-for-freelancers",
    title: "GST registration for freelancers: do you need it?",
    description:
      "Turnover thresholds, voluntary registration, and what changes once you're GST-registered.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "upi-for-business",
    title: "UPI for business: a complete guide",
    description:
      "Setting up UPI for your business, transaction limits, and reconciling payments.",
    status: "live",
    readTime: "5 min read",
    updated: "August 2026",
  },
  {
    slug: "how-to-invoice-international-clients",
    title: "How to invoice international clients from India",
    description:
      "What to include on export invoices, currency handling, and GST treatment.",
    status: "live",
    readTime: "7 min read",
    updated: "August 2026",
  },
  {
    slug: "freelance-tax-filing-checklist",
    title: "Freelance income tax filing checklist",
    description:
      "Everything to gather before you file — receipts, TDS certificates, and deadlines.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "best-banks-for-freelancers",
    title: "Best banks for freelancers and small businesses in India",
    description:
      "What to look for in a current account beyond just the brand name.",
    status: "live",
    readTime: "5 min read",
    updated: "August 2026",
  },
  {
    slug: "how-to-handle-late-paying-clients",
    title: "How to handle late-paying clients",
    description:
      "A practical escalation approach, from friendly reminder to legal notice.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "what-is-lut-gst-export",
    title: "What is a LUT and why exporters of services need one",
    description:
      "How a Letter of Undertaking lets you export services without paying GST upfront.",
    status: "live",
    readTime: "5 min read",
    updated: "August 2026",
  },
  {
    slug: "how-to-register-sole-proprietorship",
    title: "How to register a sole proprietorship in India",
    description:
      "The registrations that actually matter for a solo freelance business.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "invoice-numbering-best-practices",
    title: "Invoice numbering: rules and best practices",
    description:
      "How to structure invoice numbers so they stay GST-compliant and organized.",
    status: "live",
    readTime: "4 min read",
    updated: "August 2026",
  },
  {
    slug: "advance-tax-for-freelancers",
    title: "Advance tax for freelancers: what it is and when to pay",
    description:
      "Quarterly due dates, how to estimate what you owe, and penalties for missing them.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "common-freelance-invoicing-mistakes",
    title: "Common freelance invoicing mistakes that delay payment",
    description:
      "The small errors that make clients pay late — and how to avoid them.",
    status: "live",
    readTime: "5 min read",
    updated: "August 2026",
  },
  {
    slug: "what-is-form-26as-and-ais",
    title: "What is Form 26AS and AIS, and why freelancers should check them",
    description:
      "How to verify your TDS and reported income before you file your return.",
    status: "live",
    readTime: "5 min read",
    updated: "August 2026",
  },
  {
    slug: "how-to-negotiate-freelance-rates",
    title: "How to negotiate freelance rates without losing the client",
    description:
      "Practical scripts and framing for pushing back on lowball offers.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "cash-vs-accrual-accounting-freelancers",
    title: "Cash vs accrual accounting: what freelancers should use",
    description:
      "The two ways to track income and expenses, and which is simpler for solo freelancers.",
    status: "live",
    readTime: "5 min read",
    updated: "August 2026",
  },
  {
    slug: "gst-composition-scheme-explained",
    title: "GST composition scheme, explained",
    description:
      "A simpler GST option for small businesses — who's eligible and the tradeoffs.",
    status: "live",
    readTime: "5 min read",
    updated: "August 2026",
  },
  {
    slug: "quotation-vs-invoice-vs-receipt",
    title: "Quotation vs invoice vs receipt: what's the difference",
    description:
      "Three documents freelancers confuse — what each one is actually for.",
    status: "live",
    readTime: "4 min read",
    updated: "August 2026",
  },
  {
    slug: "how-to-write-a-freelance-contract",
    title: "How to write a freelance contract that protects you",
    description:
      "The clauses that matter most, even for a simple one-page agreement.",
    status: "live",
    readTime: "7 min read",
    updated: "August 2026",
  },
  {
    slug: "common-gst-filing-mistakes",
    title: "Common GST filing mistakes small businesses make",
    description:
      "The errors that trigger notices or lost input tax credit — and how to avoid them.",
    status: "live",
    readTime: "6 min read",
    updated: "August 2026",
  },
  {
    slug: "hra-vs-home-loan-tax-benefits",
    title: "Can you claim HRA and home loan tax benefits together?",
    description:
      "Yes, in specific situations — here's exactly when it's allowed.",
    status: "live",
    readTime: "4 min read",
    updated: "August 2026",
  },
];
