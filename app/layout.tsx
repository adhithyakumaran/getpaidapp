import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "GetPaid — Free Payment & Freelance Tools for India",
    template: "%s | GetPaid",
  },
  description: siteConfig.description,
  keywords: [
    "getpaid",
    "get paid",
    "getpaid India",
    "getpaid application",
    "getpaid tool",
    "getpaid software",
    "get paid tool",
    "GST calculator",
    "GST calculator India",
    "salary calculator India",
    "in-hand salary calculator",
    "invoice generator India",
    "free invoice generator",
    "freelance tax calculator",
    "payment gateway comparison India",
    "payu india",
    "paypal india",
    "razorpay alternative",
    "freelance tools India",
    "TDS calculator India",
    "HRA calculator",
    "EMI calculator India",
    "SIP calculator",
    "income tax calculator India",
    "freelance invoicing India",
    "payment tools India",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: "GetPaid",
    title: "GetPaid — Free Payment & Freelance Tools for India",
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "GetPaid — Free Calculators & Guides for Indian Freelancers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetPaid — Free Payment & Freelance Tools for India",
    description: siteConfig.description,
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
  verification: {
    google: undefined, // Add your Google Search Console verification token here if needed
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GetPaid",
    url: siteConfig.url,
    logo: siteConfig.logoUrl,
    description: siteConfig.description,
    foundingLocation: "India",
    sameAs: [],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GetPaid",
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/tools?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="antialiased flex min-h-screen flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
