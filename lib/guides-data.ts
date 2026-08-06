export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string };

export interface GuideContent {
  slug: string;
  intro: string;
  blocks: Block[];
}

export const guideContent: Record<string, GuideContent> = {
  "receive-paypal-in-india": {
    slug: "receive-paypal-in-india",
    intro:
      "If a client abroad wants to pay you through PayPal, you can receive it — but Indian regulations mean it works a little differently than PayPal in the US or Europe. Here's what actually happens to the money and how to do it correctly.",
    blocks: [
      { type: "h2", text: "PayPal in India works on a withdraw-only model" },
      {
        type: "p",
        text: "Since 2011, PayPal balances in India can't sit idle or be used to pay other people directly. Every payment you receive into your PayPal account must be withdrawn to a linked Indian bank account — you can't hold a running PayPal balance or send that money to someone else from within PayPal.",
      },
      {
        type: "p",
        text: "In practice this just means: client pays you on PayPal, you initiate a withdrawal, and the money lands in your bank account in India, usually within a few business days.",
      },
      { type: "h2", text: "Set up your account correctly" },
      {
        type: "list",
        items: [
          "Register as a business/merchant account rather than a personal one if you're freelancing regularly — it reflects your actual purpose and avoids account limitations later.",
          "Link an Indian bank account under your own name (or your business's name, if you've registered one) — PayPal requires the account holder name to match.",
          "Keep your PAN and basic KYC documents ready; PayPal will ask for these once your inbound volume crosses certain thresholds.",
        ],
      },
      { type: "h2", text: "What gets deducted" },
      {
        type: "p",
        text: "PayPal charges a receiving fee (a percentage plus a fixed amount, varying by the sender's country and your account type) before the money reaches you, and applies its own currency conversion rate on top, which typically carries a margin over the interbank rate. Between the two, it's common to lose more of the payment than a single 'transaction fee' figure suggests — always check PayPal's current fee schedule for your country pair before quoting a client, since these rates change periodically.",
      },
      { type: "h2", text: "FIRC and taxation basics" },
      {
        type: "p",
        text: "Every inward foreign remittance needs a Foreign Inward Remittance Certificate (FIRC) or equivalent bank certificate — this is your proof that the money came from a legitimate export of services, and you'll need it if you ever claim GST benefits on export of services or need to justify the foreign credit to your bank or tax authorities. PayPal and most Indian banks can generate this on request.",
      },
      {
        type: "p",
        text: "Income received this way is regular business/professional income for tax purposes — it doesn't become tax-free just because it came from abroad. It still needs to be declared in your ITR, and if you're registered for GST, export of services has its own treatment (usually zero-rated, but with conditions).",
      },
      {
        type: "callout",
        text: "This is general information, not tax advice. FIRC requirements, GST treatment of exports, and PayPal's fee structure can all change — confirm specifics with your bank and a CA before relying on them for a large payment.",
      },
      { type: "h2", text: "When PayPal isn't the best option" },
      {
        type: "p",
        text: "For large or recurring payments, PayPal's combined fee and conversion margin can add up. Many freelancers use PayPal for one-off or smaller client payments where convenience matters, and switch to Wise, Payoneer, or a direct bank wire for larger recurring contracts where the exchange rate difference is worth optimizing for.",
      },
    ],
  },

  "stripe-alternatives-india": {
    slug: "stripe-alternatives-india",
    intro:
      "Stripe is the default answer for online payments almost everywhere — except India, where full merchant access has historically been restricted for Indian-registered businesses. Here's what to reach for instead, depending on what you're actually building.",
    blocks: [
      { type: "h2", text: "Why Stripe is limited for Indian businesses" },
      {
        type: "p",
        text: "Stripe requires businesses to have a registered entity in a country where Stripe operates fully as a payments provider. India has historically not been one of Stripe's fully supported markets for new merchant accounts, so most Indian-registered businesses can't simply sign up and start accepting domestic payments the way a US or UK business can.",
      },
      {
        type: "p",
        text: "This changes periodically as Stripe expands, so it's worth checking Stripe's own list of supported countries directly before ruling it out — but for most Indian freelancers and small businesses today, a domestic-first alternative is the practical starting point.",
      },
      { type: "h2", text: "If you're accepting payments from Indian customers" },
      {
        type: "list",
        items: [
          "Razorpay — the closest thing to a Stripe-equivalent for India: cards, UPI, netbanking, wallets, subscriptions, and a comparable developer API.",
          "Cashfree — strong on payouts and split payments, competitive pricing, popular with marketplaces.",
          "Instamojo — simpler setup, popular for smaller sellers and one-off payment links rather than deep API integration.",
          "PayU — established player with broad payment method coverage, often used by larger e-commerce platforms.",
        ],
      },
      { type: "h2", text: "If you're accepting payments from international clients" },
      {
        type: "list",
        items: [
          "PayPal — simplest to set up, widely trusted by overseas clients, but higher effective cost once fees and conversion margin are counted.",
          "Wise (formerly TransferWise) — strong for receiving international payments at close to the real exchange rate, especially for recurring client relationships.",
          "Payoneer — popular with freelancers on platforms like Upwork and Fiverr, offers a local receiving account in USD/EUR/GBP that behaves like a domestic account for your client.",
        ],
      },
      { type: "h2", text: "For SaaS or subscription billing specifically" },
      {
        type: "p",
        text: "If you're building a subscription product and need recurring billing, invoicing, and dunning management rather than just one-off payments, Razorpay and Cashfree both offer subscription APIs comparable to Stripe Billing. Some businesses also use a merchant-of-record model (like Paddle or LemonSqueezy) if they're selling primarily to international customers and want to offload tax compliance — worth evaluating if most of your revenue is non-Indian.",
      },
      {
        type: "callout",
        text: "Payment provider terms, supported countries, and fee structures change often. Confirm current details directly on each provider's website before committing, especially for anything affecting how you're paid.",
      },
    ],
  },

  "best-payment-gateway-freelancers": {
    slug: "best-payment-gateway-freelancers",
    intro:
      "There's no single 'best' gateway — it depends entirely on where your clients are and how often they pay you. Here's how to actually decide, broken down by situation.",
    blocks: [
      { type: "h2", text: "Start with where your clients are, not the gateway's features" },
      {
        type: "p",
        text: "The single biggest factor is geography. A gateway optimized for domestic Indian card and UPI payments will serve you badly for international clients, and vice versa. Most freelancers end up using two — one for domestic, one for international — rather than trying to force one tool to do both well.",
      },
      { type: "h2", text: "Mostly Indian clients" },
      {
        type: "p",
        text: "UPI is now the default expectation for domestic payments — fast, free for the payer, and instantly familiar. A Razorpay or Cashfree payment link (or even a plain UPI QR code for smaller, informal work) covers most domestic freelance invoicing without needing a full merchant account.",
      },
      { type: "h2", text: "Mostly international clients, recurring relationships" },
      {
        type: "p",
        text: "For clients who pay you monthly or per-milestone over a long engagement, the exchange rate margin matters more than convenience. Wise and Payoneer generally offer rates closer to the real mid-market rate than PayPal, which becomes meaningful once payment amounts are large or frequent.",
      },
      { type: "h2", text: "Mostly international clients, one-off projects" },
      {
        type: "p",
        text: "For a single project or infrequent payments, PayPal's familiarity and ease of use for the paying client often outweighs the slightly worse exchange rate — clients are more likely to complete a payment they already trust and understand.",
      },
      { type: "h2", text: "Working through freelance platforms" },
      {
        type: "p",
        text: "If you're paid through Upwork, Fiverr, or similar platforms, you're generally locked into their supported withdrawal methods (commonly bank transfer, PayPal, or Payoneer) rather than choosing a gateway independently — check what the platform supports before optimizing anything else.",
      },
      {
        type: "list",
        items: [
          "Ask: is this client domestic or international?",
          "Ask: is this a one-off payment or a recurring relationship?",
          "Ask: does the amount justify optimizing for exchange rate, or does convenience win?",
        ],
      },
      {
        type: "callout",
        text: "Fee structures and supported countries change often across all these providers — verify current pricing directly with the provider before quoting a client or committing to a payment method for a large contract.",
      },
    ],
  },

  "gst-invoice-format": {
    slug: "gst-invoice-format",
    intro:
      "A GST-compliant invoice isn't just a nicely formatted bill — it needs specific fields to be legally valid and to let your client claim input tax credit. Here's exactly what's required.",
    blocks: [
      { type: "h2", text: "Mandatory fields on every GST invoice" },
      {
        type: "list",
        items: [
          "Invoice number and date — sequential, unique, and not repeated within a financial year.",
          "Your legal name, address, and GSTIN (GST registration number).",
          "Your client's name, address, and GSTIN (if they're GST-registered — required for B2B invoices).",
          "HSN or SAC code for each item or service — this classifies what you're billing for under GST.",
          "Description of goods or services.",
          "Quantity and unit (for goods) or the scope of service.",
          "Taxable value — the amount before GST.",
          "GST rate and amount, split into CGST + SGST (same state) or IGST (inter-state/export).",
          "Total invoice value, including tax.",
          "Place of supply — particularly important for inter-state transactions and export of services.",
          "Signature (physical or digital) of the supplier or an authorized representative.",
        ],
      },
      { type: "h2", text: "A few fields freelancers often miss" },
      {
        type: "p",
        text: "The SAC (Services Accounting Code) is easy to skip if you're used to informal invoicing, but it's mandatory once you're GST-registered — it tells the tax authority exactly what category of service you provided. Most freelance/consulting services fall under a small set of common SAC codes; check the GST portal or your CA for the one that matches your work.",
      },
      {
        type: "p",
        text: "'Place of supply' also trips people up. For most services, it's where your client is located — this determines whether you charge CGST+SGST or IGST, and it directly affects the export-of-services treatment if your client is outside India.",
      },
      { type: "h2", text: "Export of services" },
      {
        type: "p",
        text: "If you're invoicing a client outside India for services, this generally qualifies as an export of services and is typically zero-rated under GST — but specific conditions apply (payment received in foreign exchange, place of supply outside India, and a few others). You'll usually still issue an invoice with GST fields, marked appropriately as an export, even though the tax charged is nil.",
      },
      { type: "h2", text: "Do you need to charge GST at all?" },
      {
        type: "p",
        text: "If your annual turnover is below the GST registration threshold (which varies by state and category of supply), you may not be required to register for GST at all — in which case you issue a regular invoice without GST fields rather than a GST invoice. Once you cross the threshold, or if you register voluntarily, GST invoicing becomes mandatory for every applicable transaction.",
      },
      {
        type: "callout",
        text: "GST thresholds, SAC codes, and export conditions are specific to your situation and do change. This is a structural guide to invoice fields, not tax advice — confirm your registration status and exact obligations with a CA.",
      },
    ],
  },
};

Object.assign(guideContent, {
  "how-to-price-freelance-projects": {
    slug: "how-to-price-freelance-projects",
    intro:
      "Pricing is where most new freelancers lose the most money — not because they charge too much, but because they default to hourly rates that punish efficiency and undersell their actual value. Here's how to think about it properly.",
    blocks: [
      { type: "h2", text: "Hourly pricing has a built-in penalty" },
      {
        type: "p",
        text: "When you charge hourly, getting faster at your job literally reduces your income for the same output. A designer who finishes a logo in 3 hours instead of 8 earns less than a slower designer doing identical work — which is backwards from how value should be priced.",
      },
      { type: "h2", text: "Fixed project pricing rewards expertise instead" },
      {
        type: "p",
        text: "A fixed price is based on the value and scope of the outcome, not the hours it takes you. This means your growing efficiency and experience translate directly into higher effective hourly earnings, without needing to renegotiate rates constantly.",
      },
      {
        type: "list",
        items: [
          "Estimate your hours honestly first, using your own hourly rate calculation as a floor, not the price you quote.",
          "Price the outcome — what the client gets — not the labor that produces it.",
          "Always define scope explicitly in writing so 'small changes' don't quietly become unpaid extra work.",
        ],
      },
      { type: "h2", text: "When hourly still makes sense" },
      {
        type: "p",
        text: "Hourly billing works better for open-ended, hard-to-scope work — ongoing maintenance, retained consulting, or projects where requirements are expected to shift. In those cases, hourly protects you from scope creep rather than punishing your speed.",
      },
      { type: "h2", text: "A simple way to set your starting rate" },
      {
        type: "p",
        text: "Work backwards from the annual income you want, subtract for the portion of your time that won't be billable (admin, proposals, client calls), and that gives you the rate you actually need to charge — not a number pulled from what a similar freelancer online happens to post.",
      },
      {
        type: "callout",
        text: "If you haven't calculated this yet, our freelance hourly rate calculator does this math for you based on your income goal and billable hours.",
      },
      { type: "h2", text: "Raising rates without losing clients" },
      {
        type: "p",
        text: "Existing long-term clients are usually more price-tolerant than new freelancers assume — the cost of switching to a new freelancer (onboarding, lost context, risk) is often higher than a reasonable rate increase. Give advance notice, tie the increase to a natural point (start of year, project renewal), and let your track record do the negotiating.",
      },
    ],
  },

  "tds-on-freelance-income-explained": {
    slug: "tds-on-freelance-income-explained",
    intro:
      "If a client has ever paid you less than your invoice amount and mentioned 'TDS,' this is what happened — and why it's not actually a loss, even though it feels like one when the payment lands short.",
    blocks: [
      { type: "h2", text: "What TDS actually is" },
      {
        type: "p",
        text: "TDS (Tax Deducted at Source) means your client deducts a percentage of your payment and deposits it directly with the government on your behalf, rather than paying you the full amount and leaving you to pay tax later. It's tax collection built into the payment itself.",
      },
      { type: "h2", text: "Why it feels like a loss but usually isn't" },
      {
        type: "p",
        text: "The TDS deducted isn't an extra tax on top of what you owe — it's an advance payment toward your total tax liability for the year. When you file your ITR, this amount shows up as credit, and if your actual tax owed is less than the TDS already deducted, you get the difference refunded.",
      },
      { type: "h2", text: "Common TDS sections that apply to freelancers" },
      {
        type: "list",
        items: [
          "Section 194J — 10% TDS on professional or technical service fees, when payment from one client crosses ₹30,000 in a year.",
          "Section 194C — lower TDS (commonly 1-2%) for contract/work-based payments, distinct from professional fees.",
          "Threshold and rate details can change; always check the applicable rate for your specific type of work.",
        ],
      },
      { type: "h2", text: "How to track it properly" },
      {
        type: "p",
        text: "Every client deducting TDS should give you a TDS certificate (Form 16A), and the same information shows up in your Form 26AS (available on the income tax portal) — reconcile these against your own invoice records before filing, since mismatches are one of the most common reasons for delayed refunds.",
      },
      { type: "h2", text: "What if a client doesn't deduct TDS at all?" },
      {
        type: "p",
        text: "Some smaller clients or those unfamiliar with compliance may not deduct TDS even when required to. This doesn't reduce your own tax liability — you still owe tax on the full income; you simply don't get a TDS credit for that particular payment, so budget for the full tax amount yourself in that case.",
      },
      {
        type: "callout",
        text: "This is general information on how TDS works, not tax advice for your specific filing. Confirm applicable sections and rates with a CA, especially if you work across multiple client types.",
      },
    ],
  },

  "old-vs-new-tax-regime-freelancers": {
    slug: "old-vs-new-tax-regime-freelancers",
    intro:
      "Regime choice gets more confusing for freelancers than for salaried employees, because presumptive taxation under Section 44ADA changes what deductions are even relevant. Here's how the two questions interact.",
    blocks: [
      { type: "h2", text: "These are actually two separate decisions" },
      {
        type: "p",
        text: "Whether you use presumptive taxation (Section 44ADA) and which tax regime (old or new) you choose are independent choices, not the same thing — you can combine either presumptive or actual-expense accounting with either tax regime, though some combinations make more sense than others.",
      },
      { type: "h2", text: "If you're using Section 44ADA presumptive taxation" },
      {
        type: "p",
        text: "Under presumptive taxation, your taxable income is fixed at 50% of gross receipts regardless of your actual expenses — which means most of the deductions that make the old regime attractive (specific business expense claims) don't apply the same way. In this case, the new regime's lower slab rates and higher standard deduction often work out better, since you're not giving up much by skipping old-regime-only benefits.",
      },
      { type: "h2", text: "If you're declaring actual profit (not presumptive)" },
      {
        type: "p",
        text: "If your actual business expenses are high relative to receipts, you may prefer to declare actual profit rather than the 50% presumption — and in that case, the old regime's ability to also claim 80C investments, health insurance premiums, and other personal deductions can meaningfully lower your final tax, depending on how much you actually invest in those categories.",
      },
      { type: "h2", text: "A practical way to decide" },
      {
        type: "list",
        items: [
          "List your actual annual 80C-eligible investments (PF, ELSS, life insurance, etc).",
          "List any home loan interest, health insurance premiums, or other old-regime-only deductions you actually claim.",
          "If these add up to a large amount relative to your income, run both regimes' numbers — otherwise, the new regime's simplicity and lower rates usually win by default.",
        ],
      },
      {
        type: "callout",
        text: "Our old vs new tax regime calculator runs both scenarios side by side using your actual numbers — but for a filing decision, confirm with a CA, since presumptive taxation rules have specific eligibility conditions.",
      },
    ],
  },

  "gst-registration-for-freelancers": {
    slug: "gst-registration-for-freelancers",
    intro:
      "Not every freelancer needs to register for GST — but once you cross certain thresholds, or take specific kinds of clients, it stops being optional. Here's how to tell where you stand.",
    blocks: [
      { type: "h2", text: "The basic threshold" },
      {
        type: "p",
        text: "GST registration becomes mandatory once your aggregate annual turnover crosses the applicable threshold for service providers — this varies somewhat by state, so check the current limit for your state on the GST portal rather than assuming a single number applies everywhere in India.",
      },
      { type: "h2", text: "Why you might register voluntarily, even below the threshold" },
      {
        type: "list",
        items: [
          "Some larger clients — especially companies — only work with GST-registered vendors, since they need your GSTIN to claim input tax credit on what they pay you.",
          "Voluntary registration lets you claim input tax credit on your own business expenses (software subscriptions, equipment, etc.) that carry GST.",
          "It can also lend credibility for larger contracts, even when not strictly required.",
        ],
      },
      { type: "h2", text: "What changes once you're registered" },
      {
        type: "p",
        text: "You'll need to issue GST-compliant invoices (with GSTIN, HSN/SAC codes, and the correct tax split), file periodic GST returns even in months with no activity, and maintain slightly more detailed records than an unregistered freelancer. This is a real ongoing compliance commitment, not a one-time form.",
      },
      { type: "h2", text: "Export of services and GST" },
      {
        type: "p",
        text: "If most of your clients are outside India, your services likely qualify as export of services, which is typically zero-rated under GST — meaning you may still need to register and file, but the actual GST charged on those invoices can be nil, subject to specific conditions being met (payment in foreign exchange, place of supply outside India, and a few others).",
      },
      {
        type: "callout",
        text: "State-specific thresholds, category-specific rules, and export conditions all affect whether you're required to register. This is a general orientation — confirm your specific obligation with a CA or on the official GST portal.",
      },
    ],
  },

  "upi-for-business": {
    slug: "upi-for-business",
    intro:
      "UPI has become the default way Indian clients expect to pay — but there's a real difference between using your personal UPI ID informally and setting it up properly for a growing freelance or small business.",
    blocks: [
      { type: "h2", text: "Personal UPI vs a business UPI setup" },
      {
        type: "p",
        text: "You can absolutely receive freelance payments on your personal UPI ID linked to a savings account — plenty of freelancers do this for smaller, informal work. But as volume grows, a current account with a business UPI ID (through your bank or a payment aggregator like Razorpay/Cashfree) gives you cleaner reconciliation, higher transaction limits, and a more professional appearance to clients.",
      },
      { type: "h2", text: "Transaction limits to know" },
      {
        type: "p",
        text: "UPI has per-transaction and daily limits that apply to personal accounts, which can matter if you're invoicing larger amounts. Business/current account UPI setups through a bank or payment gateway typically support higher limits suited to commercial volume — worth checking directly with your bank if you're regularly hitting personal account limits.",
      },
      { type: "h2", text: "Reconciling UPI payments with invoices" },
      {
        type: "list",
        items: [
          "Always include your invoice number in the UPI payment note/remark field when possible, or ask clients to — this makes matching payments to invoices far easier at tax time.",
          "A business UPI setup through a payment gateway usually gives you a dashboard that auto-matches payments to payment links, removing manual reconciliation entirely.",
          "Keep bank statements and UPI transaction history as backup records — these matter if you're ever asked to substantiate income sources.",
        ],
      },
      { type: "h2", text: "UPI for GST-registered businesses" },
      {
        type: "p",
        text: "If you're GST-registered, the payment method itself (UPI, bank transfer, card) doesn't change your GST obligations — you still need to issue a proper GST invoice regardless of how the client pays. UPI is just the collection mechanism, not a substitute for invoicing.",
      },
    ],
  },

  "how-to-invoice-international-clients": {
    slug: "how-to-invoice-international-clients",
    intro:
      "Invoicing a client outside India isn't fundamentally different from invoicing domestically, but a few specific things — currency, GST treatment, and documentation — need to be handled correctly.",
    blocks: [
      { type: "h2", text: "What to include on an export invoice" },
      {
        type: "list",
        items: [
          "Your business name, address, and GSTIN if registered.",
          "Client's name and address (full country address, since 'place of supply' matters for GST treatment).",
          "Invoice number, date, and a clear description of the service provided.",
          "Currency of the invoice — typically the currency you agreed with the client (USD, EUR, GBP are common), not automatically INR.",
          "If GST-registered: a note marking the invoice as an export of service, along with the applicable GST treatment (commonly zero-rated, subject to conditions).",
        ],
      },
      { type: "h2", text: "Currency and exchange rate handling" },
      {
        type: "p",
        text: "Invoice in the currency you and the client agreed on — usually the client's local currency for larger, ongoing engagements. For your own records and tax filing, you'll need to convert the received amount to INR using the exchange rate applicable on the date of receipt (your bank or payment platform typically provides this).",
      },
      { type: "h2", text: "FIRC and proof of receipt" },
      {
        type: "p",
        text: "For any inward foreign remittance, get a Foreign Inward Remittance Certificate (FIRC) or your bank's equivalent certificate — this documents that the money is a legitimate foreign payment, and you may need it for GST export claims, loan applications, or general income substantiation later.",
      },
      { type: "h2", text: "GST on export invoices" },
      {
        type: "p",
        text: "Export of services is typically zero-rated under GST, meaning you can invoice without charging GST to the client, provided you meet the specific conditions (payment in convertible foreign exchange, place of supply outside India, and a few others). This is different from being exempt — you may still need to file the appropriate export declarations even at zero tax.",
      },
      {
        type: "callout",
        text: "Currency, FIRC, and export GST rules have specific conditions that vary by situation. This is a structural guide to what belongs on the invoice — confirm export-specific GST treatment with a CA before relying on it for a large contract.",
      },
    ],
  },

  "freelance-tax-filing-checklist": {
    slug: "freelance-tax-filing-checklist",
    intro:
      "Filing as a freelancer means gathering more documentation than a salaried employee with a single Form 16. Here's what to have ready before you sit down to file.",
    blocks: [
      { type: "h2", text: "Income documentation" },
      {
        type: "list",
        items: [
          "All client invoices raised during the financial year, ideally organized by client and date.",
          "Bank statements covering the full year, to cross-check that invoiced amounts match actual receipts.",
          "FIRCs for any foreign client payments received.",
          "Form 26AS and/or AIS (Annual Information Statement) from the income tax portal, showing TDS deducted and other reported income.",
        ],
      },
      { type: "h2", text: "TDS reconciliation" },
      {
        type: "p",
        text: "Collect Form 16A certificates from every client who deducted TDS, and reconcile these against Form 26AS before filing — mismatches between what clients reported and what shows in your own records are one of the most common causes of delayed refunds or notices.",
      },
      { type: "h2", text: "Expense records, if not using presumptive taxation" },
      {
        type: "p",
        text: "If you're declaring actual profit rather than using Section 44ADA's 50% presumption, you'll need organized records of business expenses — software subscriptions, equipment, coworking fees, travel for client work, and similar costs — with receipts or invoices to substantiate each claim.",
      },
      { type: "h2", text: "Deduction proofs, if using the old regime" },
      {
        type: "list",
        items: [
          "80C investment proofs — PF, ELSS, life insurance premium receipts.",
          "Health insurance premium receipts (Section 80D).",
          "Home loan interest certificate, if applicable.",
          "Rent receipts if claiming HRA (relevant if you also have salary income alongside freelance income).",
        ],
      },
      { type: "h2", text: "Key dates to know" },
      {
        type: "p",
        text: "Freelancers with tax liability above a certain threshold are generally required to pay advance tax in quarterly installments through the year, rather than a single payment at filing time — missing these can attract interest, so it's worth tracking due dates rather than treating filing as a once-a-year event.",
      },
      {
        type: "callout",
        text: "Specific due dates, thresholds, and applicable forms change and depend on your total income and business structure. This checklist is a starting point — a CA can confirm exact deadlines and requirements for your situation.",
      },
    ],
  },
});

Object.assign(guideContent, {
  "best-banks-for-freelancers": {
    slug: "best-banks-for-freelancers",
    intro:
      "Most freelancers open a business account at whichever bank is nearest or most familiar, then discover months later that it doesn't handle foreign remittances well, or charges heavily for basic transactions. Here's what actually matters.",
    blocks: [
      { type: "h2", text: "What to check before choosing" },
      {
        type: "list",
        items: [
          "Foreign remittance handling — if you have international clients, ask specifically how the bank processes inward foreign wires and how quickly they issue FIRCs, since some banks are noticeably slower or costlier than others.",
          "Minimum balance requirements — current accounts often carry higher minimum balance rules than savings accounts; check the penalty for falling below it.",
          "UPI and payment gateway integration — if you'll use Razorpay, Cashfree, or similar, confirm the bank supports smooth settlement into your account.",
          "Online banking and API access — if you expect to reconcile many transactions, a bank with a genuinely usable net banking interface (not just a mobile app) saves real time.",
        ],
      },
      { type: "h2", text: "Savings account vs current account" },
      {
        type: "p",
        text: "Freelancers with modest, occasional client payments can often operate through a personal savings account without issue. Once you're invoicing regularly, especially at higher volumes or with GST registration, a current account is the more appropriate structure — it's designed for business transaction volume and is what most B2B clients and payment gateways expect to see.",
      },
      { type: "h2", text: "Newer digital-first banks vs traditional banks" },
      {
        type: "p",
        text: "Digital-first neobanks and business-banking platforms have made current account setup significantly faster than the traditional branch-visit process, often bundling GST invoicing or expense tracking tools alongside the account. Traditional banks still tend to have an edge in foreign remittance experience and branch support for anything requiring in-person paperwork.",
      },
      {
        type: "callout",
        text: "Fee structures, minimum balances, and foreign remittance handling vary and change — compare current details directly on each bank's website rather than relying on general reputation alone.",
      },
    ],
  },

  "how-to-handle-late-paying-clients": {
    slug: "how-to-handle-late-paying-clients",
    intro:
      "Almost every freelancer deals with a late-paying client eventually. The mistake most people make is either going silent and hoping it resolves itself, or escalating too aggressively too soon. Here's a structured approach.",
    blocks: [
      { type: "h2", text: "Start before the due date, not after" },
      {
        type: "p",
        text: "A short, friendly reminder a few days before the invoice is due — not after it's already late — sets a professional tone and gives the client a natural nudge without feeling like a confrontation. This alone resolves a surprising number of late payments that were simply overlooked.",
      },
      { type: "h2", text: "The escalation ladder" },
      {
        type: "list",
        items: [
          "Day of due date: a polite reminder email, assuming good faith (\"just following up on invoice #123, due today\").",
          "1 week late: a firmer follow-up referencing the original payment terms, asking for a specific update.",
          "2-3 weeks late: a direct call or message stating the overdue amount clearly and asking for a committed payment date.",
          "Beyond that: a formal written notice referencing your contract/invoice terms, and a clear statement of next steps if payment isn't received.",
        ],
      },
      { type: "h2", text: "Prevent it upfront with clear terms" },
      {
        type: "p",
        text: "Most late-payment friction comes from ambiguous terms agreed informally at the start of a project. Stating payment terms explicitly on every invoice (net 15, net 30, late fee if applicable) and getting them agreed before work starts gives you a clear, referenceable standard to point back to if payment slips.",
      },
      { type: "h2", text: "When to involve a legal notice" },
      {
        type: "p",
        text: "For amounts that matter and clients who've gone unresponsive after multiple direct attempts, a formal legal notice (sent via a lawyer, even a simple one) often prompts payment on its own — it signals seriousness without necessarily leading to actual litigation, which most clients want to avoid as much as you do.",
      },
      { type: "h2", text: "Protecting yourself on future projects" },
      {
        type: "p",
        text: "For new or uncertain clients, an upfront deposit (25-50% before work begins) meaningfully reduces your exposure to non-payment risk, and milestone-based payments for larger projects mean you're never carrying more unpaid work than one milestone's worth at a time.",
      },
    ],
  },

  "what-is-lut-gst-export": {
    slug: "what-is-lut-gst-export",
    intro:
      "If you export services and you're GST-registered, a Letter of Undertaking (LUT) is what lets you invoice without charging GST upfront and then claiming a refund later — instead, you commit to meeting export conditions and skip the tax entirely at the point of invoicing.",
    blocks: [
      { type: "h2", text: "The problem an LUT solves" },
      {
        type: "p",
        text: "Without an LUT, a GST-registered exporter technically has to pay IGST on the export invoice and then separately claim a refund from the government — a process that ties up cash and adds paperwork. An LUT lets you skip that entirely: you export without charging or paying GST upfront, provided you meet the export conditions.",
      },
      { type: "h2", text: "Who needs one" },
      {
        type: "p",
        text: "Any GST-registered business or freelancer regularly invoicing clients outside India for services should generally file an LUT, since it directly improves cash flow by removing the pay-now-refund-later cycle on every export invoice.",
      },
      { type: "h2", text: "How it works in practice" },
      {
        type: "list",
        items: [
          "File the LUT (Form GST RFD-11) on the GST portal — it's typically valid for one financial year and needs to be renewed annually.",
          "Once filed, mark export invoices as \"Supply meant for export under LUT without payment of IGST.\"",
          "You still need to meet the underlying export conditions — payment received in convertible foreign exchange, and the recipient located outside India.",
        ],
      },
      { type: "h2", text: "What happens if you don't file one" },
      {
        type: "p",
        text: "You can still export services without an LUT, but you'll need to pay IGST on the export invoice and then file for a refund separately — a slower, more paperwork-heavy path that most regular exporters avoid once they discover the LUT alternative.",
      },
      {
        type: "callout",
        text: "LUT filing, renewal timing, and eligibility conditions can change and have specific requirements. Confirm current process and conditions on the GST portal or with a CA before relying on this for your export invoicing.",
      },
    ],
  },

  "how-to-register-sole-proprietorship": {
    slug: "how-to-register-sole-proprietorship",
    intro:
      "Most solo freelancers in India operate as a sole proprietorship by default — there's no single 'sole proprietorship registration' certificate, but a combination of registrations that together establish your business legally and let you open a business bank account.",
    blocks: [
      { type: "h2", text: "There's no single proprietorship registration form" },
      {
        type: "p",
        text: "Unlike a private limited company or LLP, a sole proprietorship isn't registered as a separate legal entity — you and the business are legally the same person. What you actually need are the specific registrations that prove your business exists and let you transact as one.",
      },
      { type: "h2", text: "The registrations that typically matter" },
      {
        type: "list",
        items: [
          "PAN — you already have this as an individual; it doubles as your business PAN for a sole proprietorship.",
          "GST registration — mandatory once you cross the turnover threshold, or useful voluntarily for B2B credibility and input tax credit.",
          "Udyam (MSME) registration — free, quick, and gives you a recognized business identity useful for some client onboarding processes and access to MSME-specific benefits.",
          "Shop & Establishment license — required in some states/municipalities for any commercial activity, including home-based freelance work in some jurisdictions.",
          "A current bank account in your business name — banks typically ask for at least one of the above (GST certificate or Udyam registration) to open one.",
        ],
      },
      { type: "h2", text: "Do you need all of these to start freelancing?" },
      {
        type: "p",
        text: "No — many freelancers operate for a while on just a PAN and a personal or basic current account before formalizing further. But as you take on larger clients, cross tax thresholds, or want a stronger business identity for banking and contracts, adding Udyam and GST registration (even before it's mandatory) tends to make transactions smoother.",
      },
      {
        type: "callout",
        text: "Specific requirements (like Shop & Establishment licensing) vary significantly by state and municipality. Confirm what applies in your specific location before assuming a particular registration is or isn't required.",
      },
    ],
  },

  "invoice-numbering-best-practices": {
    slug: "invoice-numbering-best-practices",
    intro:
      "Invoice numbering seems trivial until a client or auditor asks why your numbers skip around, or you realize two invoices share the same number. A little structure upfront avoids this entirely.",
    blocks: [
      { type: "h2", text: "The core GST rule" },
      {
        type: "p",
        text: "GST rules require invoice numbers to be sequential and unique within a financial year — you can't reuse a number, and you generally shouldn't have unexplained gaps in the sequence, since that can raise questions during any review.",
      },
      { type: "h2", text: "A numbering scheme that scales" },
      {
        type: "list",
        items: [
          "A common pattern: [PREFIX]-[FINANCIAL YEAR]-[SEQUENCE], e.g. INV-2526-001, INV-2526-002.",
          "The prefix can identify a business or invoice type (INV for standard, EXP for export) if you handle several invoice categories.",
          "Reset the sequence number at the start of each financial year (typically April 1st in India), keeping the year identifier in the prefix so old and new numbers never collide.",
        ],
      },
      { type: "h2", text: "Why gaps in sequence cause problems" },
      {
        type: "p",
        text: "If invoice #005 is missing between #004 and #006, it can look like a deleted or unreported transaction during a GST audit, even if the real explanation is simply a cancelled draft. If you do cancel an invoice before sending it, it's safer to still record it as \"cancelled\" in your own records rather than skip the number silently.",
      },
      { type: "h2", text: "Manual vs automated numbering" },
      {
        type: "p",
        text: "Manually tracking invoice numbers in a spreadsheet works fine at low volume, but becomes error-prone once you're issuing invoices across multiple clients regularly. An invoicing tool (like our invoice generator) or accounting software that auto-increments the number removes the most common source of numbering mistakes — duplicate or skipped numbers from manual entry.",
      },
    ],
  },

  "advance-tax-for-freelancers": {
    slug: "advance-tax-for-freelancers",
    intro:
      "If you've only ever had salary income with TDS automatically deducted, advance tax can catch you off guard as a freelancer — because nobody is automatically withholding tax through the year on your behalf the same way.",
    blocks: [
      { type: "h2", text: "What advance tax is" },
      {
        type: "p",
        text: "Advance tax means paying your estimated income tax liability in installments during the financial year, rather than as one lump sum when you file your return. It applies to anyone whose total tax liability for the year (after TDS credits) exceeds a modest threshold — which most actively freelancing individuals will cross.",
      },
      { type: "h2", text: "The typical due dates" },
      {
        type: "list",
        items: [
          "By 15th June — 15% of estimated tax liability",
          "By 15th September — 45% of estimated tax liability (cumulative)",
          "By 15th December — 75% of estimated tax liability (cumulative)",
          "By 15th March — 100% of estimated tax liability (cumulative)",
        ],
      },
      { type: "h2", text: "How to estimate what you owe" },
      {
        type: "p",
        text: "Estimate your total expected income for the year (using your invoicing pace so far as a guide), calculate the expected tax using either presumptive taxation (Section 44ADA) or actual profit, subtract any TDS already deducted by clients, and pay the remaining amount in the quarterly proportions above.",
      },
      { type: "h2", text: "What happens if you miss a payment" },
      {
        type: "p",
        text: "Missing or underpaying advance tax installments attracts interest under Sections 234B and 234C — not a heavy penalty, but a real cost that compounds if ignored across multiple quarters. It's calculated as simple interest on the shortfall, so catching up sooner rather than later limits the damage.",
      },
      {
        type: "callout",
        text: "Advance tax thresholds, exact due dates, and interest calculations can have specific conditions. This is a general overview — a CA can help you estimate your specific quarterly liability accurately.",
      },
    ],
  },
});

Object.assign(guideContent, {
  "common-freelance-invoicing-mistakes": {
    slug: "common-freelance-invoicing-mistakes",
    intro:
      "Late payment often starts with the invoice itself, not the client. A handful of small, fixable mistakes are responsible for a surprising share of payment delays.",
    blocks: [
      { type: "h2", text: "Missing or vague payment terms" },
      {
        type: "p",
        text: "An invoice without a clear due date leaves the client to decide when to pay — which usually means later rather than sooner. State the due date explicitly (\"due 15 August 2026\"), not just \"net 15,\" since not every client will calculate that correctly or consistently.",
      },
      { type: "h2", text: "No clear description of what's being billed" },
      {
        type: "p",
        text: "A vague line item like \"Services rendered\" gives an accounts team no way to match the invoice against what was actually agreed, which often triggers an internal query and delays payment while someone tracks down the context. Specific descriptions (\"Homepage redesign — final delivery, per SOW dated 1 July\") get approved faster.",
      },
      { type: "h2", text: "Sending the invoice to the wrong person" },
      {
        type: "p",
        text: "At any company larger than a couple of people, the person who approved the work often isn't the person who processes payment. Confirm the correct accounts payable contact and cc them from the first invoice, rather than relying on your main point of contact to forward it along.",
      },
      { type: "h2", text: "Inconsistent invoice numbering" },
      {
        type: "p",
        text: "Skipped or duplicate invoice numbers can trigger a client's internal compliance check, especially at larger companies with formal AP processes — an easily avoidable delay with a consistent numbering scheme.",
      },
      { type: "h2", text: "Not including your GSTIN or bank details clearly" },
      {
        type: "p",
        text: "Missing GSTIN (if applicable), or bank details buried in small text, are common reasons an invoice bounces back for correction instead of being paid on the first pass. Keep this information prominent and consistent across every invoice.",
      },
      {
        type: "callout",
        text: "A structured invoice template — like our invoice generator — removes most of these mistakes by construction, since the required fields are already built in.",
      },
    ],
  },

  "what-is-form-26as-and-ais": {
    slug: "what-is-form-26as-and-ais",
    intro:
      "Before filing your return, two documents on the income tax portal tell you what the government already knows about your income and tax paid — checking them first avoids mismatches that can delay your refund or trigger a notice.",
    blocks: [
      { type: "h2", text: "Form 26AS" },
      {
        type: "p",
        text: "Form 26AS is your consolidated tax statement — it shows TDS deducted by clients on your behalf, any advance tax you've paid, and other tax credits linked to your PAN. It's essentially a receipt of tax already collected against your income for the year.",
      },
      { type: "h2", text: "AIS (Annual Information Statement)" },
      {
        type: "p",
        text: "AIS goes further than 26AS — it aggregates a broader range of financial information reported to the tax department, including certain high-value transactions, interest income, and more. It's meant to give you (and the tax department) a fuller picture of your financial activity for the year, not just tax deducted.",
      },
      { type: "h2", text: "Why freelancers should check both before filing" },
      {
        type: "list",
        items: [
          "Confirm every client who deducted TDS actually reported and deposited it — mismatches between what a client told you and what shows in 26AS are a common source of delayed refunds.",
          "Catch any income reported under your PAN that you didn't expect, which is worth investigating before you file rather than after a notice arrives.",
          "Reconcile total TDS credit claimed in your return against what's actually shown, since a mismatch can flag your return for review.",
        ],
      },
      { type: "h2", text: "How to access them" },
      {
        type: "p",
        text: "Both are available directly on the income tax e-filing portal under your account — no separate registration needed beyond your existing PAN-linked login.",
      },
      {
        type: "callout",
        text: "Reconciling 26AS/AIS against your own invoice and payment records before filing is one of the simplest ways to avoid a delayed refund — but for anything unclear or mismatched, a CA can help interpret and resolve it.",
      },
    ],
  },

  "how-to-negotiate-freelance-rates": {
    slug: "how-to-negotiate-freelance-rates",
    intro:
      "Rate negotiation feels uncomfortable for most freelancers, largely because it's framed as confrontation rather than a normal business conversation both sides expect to have. A few reframes make it considerably easier.",
    blocks: [
      { type: "h2", text: "Anchor on value, not your own costs" },
      {
        type: "p",
        text: "Explaining your rate by listing your expenses or hours (\"I need this much to cover my costs\") invites the client to negotiate down to your minimum. Instead, frame the rate around the outcome you deliver — what the work is worth to their business — which is a harder number to argue down.",
      },
      { type: "h2", text: "Don't be the first to name a number, when you can avoid it" },
      {
        type: "p",
        text: "If a client asks your rate before sharing their budget, asking what budget they have in mind first (politely) sometimes reveals they were prepared to pay more than you would have quoted. This isn't always possible, but it's worth trying before defaulting to your own number.",
      },
      { type: "h2", text: "Handling a lowball offer" },
      {
        type: "list",
          items: [
          "Don't reject immediately — ask what's driving the budget constraint; sometimes scope can flex instead of price.",
          "Offer a smaller scope at their budget rather than the full scope at a discount — this protects your rate while giving them an honest option.",
          "If you do concede on price, get something in return: faster payment terms, a longer commitment, or reduced revision rounds.",
        ],
      },
      { type: "h2", text: "Raising rates with existing clients" },
      {
        type: "p",
        text: "Give advance notice (a month or more), tie it to a natural point like a new year or contract renewal, and lead with your track record rather than apologizing for the increase — a client who's happy with your work will usually absorb a reasonable rate increase rather than restart the search for someone new.",
      },
      { type: "h2", text: "When to just walk away" },
      {
        type: "p",
        text: "A client who negotiates aggressively before work has even started is often a preview of how they'll behave throughout the relationship — on scope, deadlines, and future rate discussions. It's sometimes cheaper long-term to decline a low-paying client than to accept the relationship dynamics that come with them.",
      },
    ],
  },

  "cash-vs-accrual-accounting-freelancers": {
    slug: "cash-vs-accrual-accounting-freelancers",
    intro:
      "Most solo freelancers default to cash accounting without ever deciding to — it's simply the intuitive way to track money. But knowing the alternative, and when it matters, helps you avoid confusion as your business grows.",
    blocks: [
      { type: "h2", text: "Cash accounting: record it when money moves" },
      {
        type: "p",
        text: "Under cash accounting, you record income when you actually receive payment, and expenses when you actually pay them — not when the invoice was raised or the bill was received. This is simpler to track and matches your actual bank balance closely, which is why most individual freelancers use it by default.",
      },
      { type: "h2", text: "Accrual accounting: record it when it's earned or owed" },
      {
        type: "p",
        text: "Under accrual accounting, you record income when you invoice (regardless of when you're paid) and expenses when you incur them (regardless of when you pay). This gives a more accurate picture of your business's actual performance in a given period, independent of payment timing delays.",
      },
      { type: "h2", text: "Why the difference matters" },
      {
        type: "p",
        text: "If you invoice a large project in March but get paid in April, cash accounting shows that income in April's numbers, while accrual accounting shows it in March — which can meaningfully shift how a given month or quarter looks, especially with large, lumpy freelance income.",
      },
      { type: "h2", text: "Which should you use?" },
      {
        type: "p",
        text: "For income tax purposes, presumptive taxation under Section 44ADA is generally based on amounts actually received during the year, which aligns naturally with cash accounting — most solo freelancers using presumptive taxation don't need to formally adopt accrual accounting at all. It becomes more relevant if you're maintaining detailed books of account (opting out of presumptive taxation) or running a business with employees and more complex operations.",
      },
      {
        type: "callout",
        text: "Which method applies to your tax filing depends on your specific situation — a CA can confirm whether cash or accrual basis is appropriate given your business structure and taxation approach.",
      },
    ],
  },
});

Object.assign(guideContent, {
  "gst-composition-scheme-explained": {
    slug: "gst-composition-scheme-explained",
    intro:
      "The composition scheme trades away input tax credit and inter-state sales in exchange for dramatically simpler compliance and a lower, fixed tax rate — a real tradeoff worth understanding before you opt in.",
    blocks: [
      { type: "h2", text: "What the composition scheme actually changes" },
      {
        type: "p",
        text: "Instead of charging GST at the standard rate for your category and filing detailed monthly returns, composition scheme taxpayers pay a small fixed percentage of turnover as tax and file simplified quarterly returns with an annual return, rather than the standard monthly filing cycle.",
      },
      { type: "h2", text: "Who's eligible" },
      {
        type: "p",
        text: "Eligibility is based on annual turnover thresholds that are lower than the standard GST registration threshold, and the scheme has historically been more available to goods suppliers than service providers — a specific composition option exists for small service providers too, but with its own separate (often lower) turnover limit. Check current thresholds on the GST portal, since these are revised periodically.",
      },
      { type: "h2", text: "The tradeoffs" },
      {
        type: "list",
        items: [
          "You cannot charge GST separately on invoices or collect it from customers — the fixed rate comes out of your own revenue instead.",
          "You cannot claim input tax credit on your own business purchases, which matters if you have significant GST-taxed expenses.",
          "You generally cannot make inter-state supplies under composition — this immediately rules it out for many freelancers serving clients across states or exporting services.",
          "B2B clients who need GST input credit from your invoice may prefer working with a regular GST-registered vendor instead.",
        ],
      },
      { type: "h2", text: "When it makes sense" },
      {
        type: "p",
        text: "Composition tends to suit small, single-state businesses selling mostly to end consumers (not GST-registered businesses claiming input credit), where compliance simplicity outweighs the loss of input tax credit and inter-state flexibility. Most freelancers serving businesses or working with out-of-state or international clients find the restrictions too limiting.",
      },
      {
        type: "callout",
        text: "Eligibility thresholds, applicable rates, and restrictions change periodically and vary by category. Confirm current details on the GST portal or with a CA before opting in — switching back has its own process and timing rules.",
      },
    ],
  },

  "quotation-vs-invoice-vs-receipt": {
    slug: "quotation-vs-invoice-vs-receipt",
    intro:
      "These three documents get used interchangeably by newer freelancers, but each serves a distinct legal and practical purpose in a transaction — mixing them up creates real confusion for clients and accountants alike.",
    blocks: [
      { type: "h2", text: "Quotation (or estimate)" },
      {
        type: "p",
        text: "A quotation is sent before any work begins — it's a proposed price for a defined scope, not yet a request for payment. It typically has a validity period (\"valid for 14 days\") since costs or availability can change. No payment obligation exists yet; it's the client deciding whether to proceed.",
      },
      { type: "h2", text: "Invoice" },
      {
        type: "p",
        text: "An invoice is a formal request for payment, issued after work is delivered (or at agreed milestones) — it creates a payment obligation with a due date. Unlike a quotation, an invoice is a legal record with specific compliance requirements if you're GST-registered (invoice number, GSTIN, tax breakdown, etc).",
      },
      { type: "h2", text: "Receipt" },
      {
        type: "p",
        text: "A receipt confirms that payment has actually been received — it's issued after the invoice has been paid, as proof the transaction is complete. Some freelancers skip issuing separate receipts and instead mark the invoice itself as \"Paid,\" which is fine for most informal use cases but a dedicated receipt is sometimes specifically requested (as with rent receipts for HRA claims).",
      },
      { type: "h2", text: "Why the distinction matters" },
      {
        type: "list",
        items: [
          "Sending a \"quotation\" labeled as an \"invoice\" can confuse a client's accounts team into thinking payment is due before work has even started.",
          "GST compliance requirements apply specifically to invoices, not quotations — a quotation doesn't need a GSTIN or tax breakdown since no supply has occurred yet.",
          "Keeping quotations, invoices, and receipts as separate, correctly labeled documents makes your own record-keeping and any later reconciliation far easier.",
        ],
      },
    ],
  },

  "how-to-write-a-freelance-contract": {
    slug: "how-to-write-a-freelance-contract",
    intro:
      "A freelance contract doesn't need to be a 20-page legal document to be effective — but it does need to cover a specific set of things clearly, in writing, before work begins.",
    blocks: [
      { type: "h2", text: "Scope of work" },
      {
        type: "p",
        text: "Define exactly what's included — and just as importantly, what's not. Vague scope (\"website design\") is the single biggest source of disputes later, since client and freelancer often have different mental models of what that phrase includes. Be specific: number of pages, revision rounds, what happens with out-of-scope requests.",
      },
      { type: "h2", text: "Payment terms" },
      {
        type: "list",
        items: [
          "Total price or rate structure (fixed project vs hourly).",
          "Payment schedule — upfront deposit, milestone payments, or payment on completion.",
          "Due date/payment terms for each invoice (e.g., net 15).",
          "What happens if payment is late — interest, work pause, or other consequences.",
        ],
      },
      { type: "h2", text: "Revisions and scope changes" },
      {
        type: "p",
        text: "State how many rounds of revision are included, and what happens beyond that — either an hourly rate for extra revisions or a defined process for scoping additional work as a separate quotation. Without this, \"just one more small change\" can quietly consume unpaid hours indefinitely.",
      },
      { type: "h2", text: "Ownership and usage rights" },
      {
        type: "p",
        text: "Clarify when ownership of the final deliverable transfers to the client — commonly upon full payment, not upon delivery. This protects you if a client tries to use unpaid work, and gives the client clarity on when they can legally use what you've created.",
      },
      { type: "h2", text: "Termination clause" },
      {
        type: "p",
        text: "Define what happens if either party wants to end the engagement early — notice period, payment for work completed so far, and handover of any work in progress. This protects both sides from an abrupt, undefined exit.",
      },
      {
        type: "callout",
        text: "A written contract, even a simple one both parties sign, is far stronger than a verbal agreement or email thread if a dispute ever arises. For high-value or ongoing engagements, having a lawyer review a template once is a worthwhile one-time cost.",
      },
    ],
  },

  "common-gst-filing-mistakes": {
    slug: "common-gst-filing-mistakes",
    intro:
      "Most GST filing problems aren't dramatic fraud cases — they're small, repeated errors that quietly cost businesses input tax credit or trigger unnecessary notices. Here are the ones that come up most often.",
    blocks: [
      { type: "h2", text: "Mismatched invoice details between GSTR-1 and GSTR-3B" },
      {
        type: "p",
        text: "GSTR-1 reports your outward supplies in detail, while GSTR-3B is a summary return with tax payment. When the two don't reconcile — a common result of manual data entry errors — it can flag your filings for scrutiny even when the underlying transactions were correctly reported.",
      },
      { type: "h2", text: "Claiming input tax credit without proper documentation" },
      {
        type: "p",
        text: "Input tax credit claimed without a valid supplier invoice, or where the supplier hasn't correctly reported and paid their own GST, can be disallowed even if you paid the invoice in good faith. Reconcile your claimed ITC against your GSTR-2B (auto-generated from supplier filings) before claiming.",
      },
      { type: "h2", text: "Missing the filing deadline, even with nil activity" },
      {
        type: "p",
        text: "GST returns are due even in months with zero transactions — a \"nil return\" still needs to be filed. Missing this, even when there's genuinely nothing to report, results in late fees that accumulate for every day of delay.",
      },
      { type: "h2", text: "Incorrect HSN/SAC codes" },
      {
        type: "p",
        text: "Using the wrong classification code affects the applicable tax rate and can misrepresent what you're actually supplying. This is especially common for freelancers new to GST who aren't sure which SAC code matches their specific service category.",
      },
      { type: "h2", text: "Not reconciling export invoices under LUT correctly" },
      {
        type: "p",
        text: "Marking export invoices incorrectly, or failing to file the LUT before invoicing exports without IGST, can result in an unexpected tax demand later — the export benefit only applies when the correct process and paperwork are in place from the start.",
      },
      {
        type: "callout",
        text: "GST compliance has specific, changing procedural requirements. This is a general orientation to common pitfalls — for your actual filings, working with a CA or GST practitioner significantly reduces the risk of these errors.",
      },
    ],
  },

  "hra-vs-home-loan-tax-benefits": {
    slug: "hra-vs-home-loan-tax-benefits",
    intro:
      "It sounds contradictory — claiming rent exemption while also claiming home loan interest deduction — but there are legitimate situations where both apply simultaneously. Here's when it's actually allowed.",
    blocks: [
      { type: "h2", text: "The situation where both genuinely apply" },
      {
        type: "p",
        text: "If you own a home in one city (say, on a home loan) but work and rent accommodation in a different city, you can claim HRA exemption on the rent you pay for your work-city accommodation, while separately claiming home loan interest deduction (Section 24) on the home you own elsewhere — because these relate to two genuinely different properties and situations.",
      },
      { type: "h2", text: "What you cannot do" },
      {
        type: "p",
        text: "You generally cannot claim HRA exemption for rent paid on the same property you also own and are claiming home loan benefits on — nor can you claim HRA for rent paid to a spouse or immediate family member in a way designed purely to generate a tax deduction without genuine economic substance, which is a pattern tax authorities specifically watch for.",
      },
      { type: "h2", text: "A common legitimate scenario" },
      {
        type: "p",
        text: "Someone who bought a home in their hometown (perhaps still under construction, or occupied by parents) while working and renting in a different city for their job is a standard, legitimate case where both benefits genuinely apply — the rented accommodation and the owned property serve different real purposes.",
      },
      { type: "h2", text: "Which regime allows this" },
      {
        type: "p",
        text: "Both HRA exemption and home loan interest deduction (for a self-occupied or let-out property) are old-regime benefits — under the new tax regime, neither is available in the same way, so this combined strategy is specifically relevant to old-regime filers.",
      },
      {
        type: "callout",
        text: "This is a legitimate but sometimes scrutinized area of tax filing — keep clear documentation (rent agreement, rent receipts, home loan statement) and confirm your specific situation qualifies with a CA before claiming both.",
      },
    ],
  },
});
