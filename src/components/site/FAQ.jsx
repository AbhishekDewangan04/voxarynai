import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GlassCard } from "./Glass";
import Reveal from "./Reveal";
import SectionShell from "./SectionShell";

const FAQS = [
  {
    q: "Does the agent actually sound like me?",
    a: "You can start from one of six studio voices or clone your own from a few minutes of audio. Voice, pace and filler words are all adjustable, and you can preview any change instantly in the Personality Studio before it goes live.",
  },
  {
    q: "What happens when the agent doesn't know something?",
    a: "It says so, then follows your escalation rule — transfer the call to you, take a message, or book a callback. It never invents details and never confirms something it can't verify in your connected tools.",
  },
  {
    q: "How does the memory work, and who can see it?",
    a: "Memory is stored per agent and per person you talk to. Only you can read it, every entry is editable or deletable, and you can set retention from 7 days to forever. Memories never leave your workspace unless you authorise an integration to read them.",
  },
  {
    q: "Do I need a new phone number?",
    a: "No. You can forward your existing line to the agent, or buy a local number in 40+ countries from the dashboard. Forwarding is reversible at any time and keeps your current number visible to callers.",
  },
  {
    q: "Which tasks can it perform without asking me?",
    a: "Only the permissions you switch on — booking events, sending confirmations, reading contacts, transferring calls. Anything involving payments or deleting records is off by default and requires explicit approval.",
  },
  {
    q: "Are calls recorded?",
    a: "Recording is off by default. Transcripts are generated for your own review, and audio is discarded once the call ends unless you enable retention. When recording is on, callers are notified at the start of the call.",
  },
  {
    q: "Can I use it for my team, not just myself?",
    a: "Yes. Pro includes three agents and shared memory between them; Enterprise adds unlimited agents, SSO, role-based permissions and audit exports for compliance teams.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <SectionShell
      id="faq"
      eyebrow="FAQ"
      title="Questions worth asking before you hand over your line."
      description="If something isn't covered here, the waitlist form gets you straight to the team."
    >
      <Reveal className="mx-auto mt-12 max-w-3xl">
        <GlassCard className="divide-y divide-white/8 px-5 py-2 sm:px-7">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    id={`faq-trigger-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="cursor-target flex w-full items-center justify-between gap-5 py-4 text-left text-[14px] font-medium text-white transition-colors hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:text-[14.5px]"
                  >
                    {item.q}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-8 text-[13.5px] leading-relaxed text-white/60">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </GlassCard>
      </Reveal>
    </SectionShell>
  );
}