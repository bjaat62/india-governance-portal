"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

import { useLocale } from "@/components/providers";
import { cn } from "@/components/ui";

const navigation = [
  { href: "/", key: "home" },
  { href: "/leaders", key: "leaders" },
  { href: "/states", key: "states" },
  { href: "/admin", key: "admin" }
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron via-gold to-emerald text-sm font-black text-white shadow-soft">
              IN
            </div>
            <div>
              <p className="font-display text-lg text-foreground">India Governance Portal</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Constitution to Cabinet</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-navy text-white"
                      : "text-muted-foreground hover:bg-white/70 hover:text-foreground dark:hover:bg-white/5"
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-saffron/30"
            >
              {resolvedTheme === "dark" ? t("lightMode") : t("darkMode")}
            </button>
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "hi" : "en")}
              className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-saffron/30"
            >
              {t("language")}: {locale.toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>

      <footer className="border-t border-border/60 bg-card/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div className="space-y-4">
            <p className="font-display text-2xl text-foreground">India Governance Portal</p>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              A premium full-stack reference portal for public office data, timelines, state-wise leadership, and
              scalable civic administration workflows.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Portal</p>
            <Link href="/" className="block text-sm text-foreground hover:text-saffron">
              Homepage
            </Link>
            <Link href="/leaders" className="block text-sm text-foreground hover:text-saffron">
              Leader directory
            </Link>
            <Link href="/states" className="block text-sm text-foreground hover:text-saffron">
              State explorer
            </Link>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Administration</p>
            <Link href="/admin/login" className="block text-sm text-foreground hover:text-saffron">
              Admin login
            </Link>
            <a href="https://www.india.gov.in/" className="block text-sm text-foreground hover:text-saffron" target="_blank" rel="noreferrer">
              National portal
            </a>
            <a href="https://www.nic.in/" className="block text-sm text-foreground hover:text-saffron" target="_blank" rel="noreferrer">
              National Informatics Centre
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
