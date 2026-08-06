"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { tools, guides } from "@/lib/content";

interface SearchItem {
  type: "Tool" | "Guide";
  title: string;
  description: string;
  href: string;
}

const allItems: SearchItem[] = [
  ...tools
    .filter((t) => t.status === "live")
    .map((t) => ({
      type: "Tool" as const,
      title: t.title,
      description: t.description,
      href: `/tools/${t.slug}`,
    })),
  ...guides
    .filter((g) => g.status === "live")
    .map((g) => ({
      type: "Guide" as const,
      title: g.title,
      description: g.description,
      href: `/guides/${g.slug}`,
    })),
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 6);
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[280px]">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 focus-within:border-ink transition-colors">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-slate-light"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search tools, guides…"
          className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-slate-light"
        />
        <kbd className="hidden shrink-0 rounded border border-border bg-white px-1.5 py-0.5 text-[10px] text-slate-light md:block">
          ⌘K
        </kbd>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-white p-1.5 shadow-[0_8px_30px_-8px_rgba(11,18,32,0.2)]">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
          {results.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-surface"
            >
              <span
                className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  item.type === "Tool"
                    ? "bg-blue-tint text-blue"
                    : "bg-green-tint text-green-dark"
                }`}
              >
                {item.type}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium text-ink">
                  {item.title}
                </span>
                <span className="block truncate text-[13px] text-slate">
                  {item.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
