"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/layout/SearchBar";

const navLinks = [
  { label: "Tools", href: "/tools" },
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white font-display text-[15px] font-bold">
            ₹
          </span>
          <span className="font-display text-[19px] font-semibold text-ink">
            Get<span className="text-green">Paid</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-ink-soft hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <Button href="/tools/invoice-generator" variant="green" size="sm">
              Create free invoice
            </Button>
          </div>

          <button
            className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <div className="flex flex-col gap-1">
              <span className="h-0.5 w-4 bg-ink" />
              <span className="h-0.5 w-4 bg-ink" />
              <span className="h-0.5 w-4 bg-ink" />
            </div>
          </button>
        </div>
      </Container>

      {open && (
        <div className="md:hidden border-t border-border bg-white">
          <Container className="flex flex-col gap-3 py-4">
            <SearchBar />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-1">
              <Button
                href="/tools/invoice-generator"
                variant="green"
                size="sm"
                className="w-full"
              >
                Create free invoice
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
