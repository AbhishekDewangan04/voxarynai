import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GlassButton, GlassPanel } from "./Glass";
import Reveal from "./Reveal";
import Waveform from "./Waveform";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export default function FinalCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      setMessage("That email doesn't look right — check it and try again.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await base44.functions.invoke("createWaitlistEntry", { email: value, source: "home" });
      const data = response?.data ?? {};
      if (data.error) {
        setStatus("error");
        setMessage(data.error);
        return;
      }
      setStatus("success");
      setMessage(
        data.alreadyJoined
          ? "You're already on the list — we'll send your invite as soon as a slot opens."
          : "You're on the list. We'll email your invite and a short setup call link shortly."
      );
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error?.response?.data?.error || "We couldn't save that just now. Please try again.");
    }
  };

  return (
    <section id="waitlist" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-x-4 -inset-y-8 -z-10 bg-[radial-gradient(50%_60%_at_25%_25%,rgba(124,58,237,0.55),transparent_70%),radial-gradient(45%_55%_at_75%_70%,rgba(34,211,238,0.4),transparent_72%),radial-gradient(40%_50%_at_50%_100%,rgba(47,91,255,0.5),transparent_70%)] blur-[60px]"
          />
          <Reveal y={30}>
            <GlassPanel className="overflow-hidden px-6 py-12 text-center sm:px-10 sm:py-16" refraction={34}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40">
                <Waveform bars={64} tone="soft" />
              </div>

              <div className="relative mx-auto max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  <Sparkles className="h-3 w-3 text-cyan-200" aria-hidden="true" />
                  Private beta · rolling invites
                </span>

                <h2 className="font-display-tight mt-6 text-balance text-[clamp(2.1rem,5.4vw,4rem)] text-white">
                  Give your voice an AI.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-white/62 sm:text-base">
                  Join the waitlist and we'll set up your first agent with you — number, voice and permissions
                  included. No card, no commitment.
                </p>

                <div className="mt-9">
                  <AnimatePresence mode="wait" initial={false}>
                    {status === "success" ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mx-auto flex max-w-md flex-col items-center gap-3"
                        role="status"
                        aria-live="polite"
                      >
                        <span className="grid h-12 w-12 place-items-center rounded-full border border-emerald-300/40 bg-emerald-400/20 text-emerald-200">
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <p className="text-[14px] font-medium text-white">You're on the list.</p>
                        <p className="text-[12.5px] leading-relaxed text-white/55">{message}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setStatus("idle");
                            setMessage("");
                          }}
                          className="mt-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                          Add another email
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mx-auto max-w-lg"
                        noValidate
                      >
                        <div className="flex flex-col gap-2.5 rounded-[1.4rem] border border-white/15 bg-white/[0.06] p-2 backdrop-blur-md sm:flex-row sm:items-center sm:rounded-full">
                          <label htmlFor="waitlist-email" className="sr-only">
                            Email address
                          </label>
                          <input
                            id="waitlist-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(event) => {
                              setEmail(event.target.value);
                              if (status === "error") {
                                setStatus("idle");
                                setMessage("");
                              }
                            }}
                            aria-invalid={status === "error"}
                            aria-describedby={message ? "waitlist-message" : undefined}
                            required
                            className="h-12 w-full flex-1 rounded-full bg-transparent px-5 text-[14px] text-white placeholder:text-white/35 focus:outline-none"
                          />
                          <GlassButton
                            type="submit"
                            size="md"
                            tone="primary"
                            className="h-12 shrink-0 px-6"
                            disabled={status === "loading"}
                          >
                            {status === "loading" ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                                Joining…
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                Join the waitlist
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </span>
                            )}
                          </GlassButton>
                        </div>
                        {message && (
                          <p
                            id="waitlist-message"
                            role="alert"
                            className={`mt-3 text-[12.5px] ${status === "error" ? "text-rose-200" : "text-white/55"}`}
                          >
                            {message}
                          </p>
                        )}
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <p className="mt-5 inline-flex items-center gap-1.5 text-[11.5px] text-white/35">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    We only email you about Voxaryn access. Unsubscribe in one click.
                  </p>
                </div>
              </div>
            </GlassPanel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}