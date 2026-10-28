import React from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter } from "lucide-react";
import Brand from "./Brand";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Personality studio", href: "/#studio" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Professionals", href: "/#use-cases" },
      { label: "Small business", href: "/#use-cases" },
      { label: "Healthcare clinics", href: "/#use-cases" },
      { label: "Integrations", href: "/#integrations" },
      { label: "Security", href: "/#security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Join the waitlist", href: "/#waitlist" },
      { label: "Contact", href: "mailto:hello@voxaryn.ai" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const SOCIALS = [
  { label: "Voxaryn on X", href: "https://x.com", icon: Twitter },
  { label: "Voxaryn on LinkedIn", href: "https://www.linkedin.com", icon: Linkedin },
  { label: "Voxaryn on GitHub", href: "https://github.com", icon: Github },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 pb-10 pt-14">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Brand />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/50">
              Your AI. Your Identity. Your Rules. Personal voice agents that answer, remember and act — with
              permissions you control.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-white/60 transition-colors duration-300 hover:border-white/30 hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{column.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("mailto:") ? (
                        <a
                          href={link.href}
                          className="text-[13px] text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-[13px] text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-[11.5px] text-white/35">© 2026 Voxaryn AI. All rights reserved.</p>
          <p className="text-[11.5px] text-white/30">
            Designed and built for people who'd rather be talking to someone.
          </p>
        </div>
      </div>
    </footer>
  );
}