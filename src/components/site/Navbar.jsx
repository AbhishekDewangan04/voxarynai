import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, LayoutDashboard, Menu, X } from "lucide-react";
import { GlassButton, GlassPanel } from "./Glass";
import Brand from "./Brand";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const jumpToSection = (event, href) => {
    event.preventDefault();
    setOpen(false);
    const id = href.replace("#", "");
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 340);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <GlassPanel
          className={`rounded-full transition-all duration-500 ${scrolled ? "shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)]" : ""}`}
          refraction={22}
          bezel={18}
        >
          <nav aria-label="Primary" className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
            <Brand className="pl-1" />

            <ul className="hidden items-center gap-0.5 lg:flex">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-full px-3 py-2 text-[13.5px] font-medium text-white/70 transition-colors duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <Link
                to="/login?returnTo=/dashboard"
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13.5px] font-medium text-white/70 transition-colors hover:text-white sm:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Sign in
              </Link>
              <GlassButton size="sm" className="hidden sm:inline-flex" tone="primary">
                <Link to="/register?returnTo=/dashboard" className="inline-flex items-center gap-1.5">
                  Get Started
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </GlassButton>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:hidden"
              >
                {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </nav>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id="mobile-nav"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden lg:hidden"
              >
                <div className="mx-3 mb-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
                  <ul className="grid gap-1">
                    {LINKS.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          onClick={(event) => jumpToSection(event, link.href)}
                          className="block rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 grid gap-2 border-t border-white/10 pt-3">
                    <Link
                      to="/login?returnTo=/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                    >
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Sign in / Dashboard
                    </Link>
                    <GlassButton size="md" className="w-full" tone="primary">
                      <Link
                        to="/register?returnTo=/dashboard"
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1.5"
                      >
                        Get Started
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </GlassButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>
      </div>
    </header>
  );
}