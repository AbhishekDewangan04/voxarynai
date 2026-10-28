import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Background from "@/components/site/Background";
import Brand from "@/components/site/Brand";
import { GlassPanel } from "@/components/site/Glass";
import Footer from "@/components/site/Footer";

const PRIVACY = {
  title: "Privacy policy",
  intro:
    "Voxaryn AI is a personal voice agent platform. This policy explains what we collect when you join the waitlist or run an agent, and the controls you have over it.",
  sections: [
    {
      heading: "What we collect",
      body: "Waitlist signups: your email address and the page you signed up from. Product usage: call metadata, transcripts and AI summaries generated for your own agents, plus the memory entries your agent creates. We do not sell personal data or share it with advertisers.",
    },
    {
      heading: "Call recordings",
      body: "Recording is off by default. When a call happens, audio is used to transcribe the conversation in real time and is discarded once the call ends, unless you enable retention for that agent. If retention is on, callers hear a notice at the start of the call and can ask to opt out.",
    },
    {
      heading: "Memory and retention",
      body: "Memory entries are stored per agent and per contact in your workspace. You can set retention from 7 days to indefinite, edit any entry, or delete it. Deleting an entry removes it from future calls immediately.",
    },
    {
      heading: "Sharing with integrations",
      body: "An agent can only read or write inside an integration you have authorised. Access tokens are scoped to the exact actions you enabled and can be revoked from the dashboard at any time.",
    },
    {
      heading: "Your rights",
      body: "You can request a copy of your data, correct it, or ask us to delete it by emailing hello@voxaryn.ai. We respond to requests within 30 days. Waitlist emails can be removed instantly through the unsubscribe link in any message.",
    },
    {
      heading: "Contact",
      body: "Questions about this policy: hello@voxaryn.ai.",
    },
  ],
};

const TERMS = {
  title: "Terms of service",
  intro:
    "These terms cover your use of the Voxaryn AI waitlist and, once your workspace opens, the voice agent platform. By joining the waitlist you accept them.",
  sections: [
    {
      heading: "Using Voxaryn",
      body: "You must be at least 18 and authorised to act for the phone number you connect. You are responsible for how your agent behaves on your behalf, including the permissions you grant it and the information it shares with callers.",
    },
    {
      heading: "Acceptable use",
      body: "Do not use Voxaryn for unsolicited outbound marketing, impersonating someone without their consent, recording callers without the required notice, or any unlawful activity. We may suspend an agent that breaks these rules.",
    },
    {
      heading: "AI limitations",
      body: "Voice agents can misunderstand speech. Summaries and transcripts are generated automatically and may contain errors. Do not rely on an agent for medical, legal or financial advice, and keep a human escalation path enabled for urgent calls.",
    },
    {
      heading: "Plans and billing",
      body: "Paid plans are billed in advance, monthly or yearly. Overage is billed at the per-minute rate shown at signup. You can cancel at any time; access continues until the end of the paid period and unused minutes do not convert to cash.",
    },
    {
      heading: "Availability",
      body: "We target 99.9% uptime for the voice platform and 99.99% on Enterprise. Planned maintenance is announced in advance, and the dashboard shows the status of your agents at all times.",
    },
    {
      heading: "Changes",
      body: "We may update these terms as the product evolves. Material changes are announced by email at least 14 days before they take effect. Continued use after that date means you accept the updated terms.",
    },
  ],
};

export default function Legal() {
  const { pathname } = useLocation();
  const page = pathname.includes("terms") ? TERMS : PRIVACY;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Background />
      <header className="px-4 pt-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
          <Brand />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[12px] font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 pb-20 pt-14 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Last updated 28 October 2026</p>
        <h1 className="font-display-tight mt-3 text-[clamp(2rem,5vw,3rem)] text-white">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-white/60">{page.intro}</p>

        <GlassPanel className="mt-10 p-6 sm:p-9">
          <div className="space-y-8">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-[16px] font-semibold text-white">{section.heading}</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">{section.body}</p>
              </section>
            ))}
          </div>
        </GlassPanel>

        <p className="mt-8 text-[12.5px] text-white/40">
          Need something else?{" "}
          <Link to="/#faq" className="text-cyan-200 underline-offset-4 hover:underline">
            Read the FAQ
          </Link>{" "}
          or email{" "}
          <a href="mailto:hello@voxaryn.ai" className="text-cyan-200 underline-offset-4 hover:underline">
            hello@voxaryn.ai
          </a>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
}