"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import { ArrowUpRight, ArrowRight, Menu, X } from "lucide-react";

/* ---------------------------------------------------------
   LEARN RESEARCH LAB
   "A language model, annotated."
--------------------------------------------------------- */

const HEADLINE_WORDS = [
  { final: "Trained", candidates: ["Modeled", "Formed"] },
  { final: "in", candidates: ["from", "at"] },
  { final: "the", candidates: ["a", "our"] },
  { final: "margins", candidates: ["shadows", "edges"] },
  { final: "of", candidates: ["between", "beyond"] },
  { final: "what's", candidates: ["what is", "the"] },
  { final: "known.", candidates: ["written.", "certain."] },
];

const TICKER = [
  "I-am-still-learning", "124M parameters", "Open weights", "Trained on textbook data",
  "arXiv:2607.04821", "I-am-still-learning", "124M params", "Autoregressive LLM"
];

function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      x: (e.clientX - (r.left + r.width / 2)) * strength,
      y: (e.clientY - (r.top + r.height / 2)) * strength,
    });
  }, [strength]);
  const onLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);
  return { ref, pos, onMove, onLeave };
}

function Magnetic({ children, className, strength = 0.28, ...rest }: { children: React.ReactNode; className?: string; strength?: number }) {
  const { ref, pos, onMove, onLeave } = useMagnetic(strength);
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.4 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function Reveal({ children, delay = 0, y = 24, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [label, setLabel] = useState("");
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorEl = target.closest("[data-cursor]") as HTMLElement;
      if (cursorEl) {
        setHover(true);
        setLabel(cursorEl.getAttribute("data-cursor") || "");
      } else {
        setHover(false);
        setLabel("");
      }
    };
    window.addEventListener("mouseover", handleMouseOver);
    return () => window.removeEventListener("mouseover", handleMouseOver);
  }, []);

  return (
    <motion.div
      className="cursor-x"
      animate={{ x: pos.x - 12, y: pos.y - 12, scale: hover ? 1.3 : 1 }}
      transition={{ type: "spring", stiffness: 600, damping: 40, mass: 0.3 }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24">
        <line x1="12" y1="2" x2="12" y2="9" />
        <line x1="12" y1="15" x2="12" y2="22" />
        <line x1="2" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="22" y2="12" />
        <circle cx="12" cy="12" r="1.6" fill="#B23B2E" stroke="none" />
      </svg>
      {label && <span className="cursor-tag">{label}</span>}
    </motion.div>
  );
}

function Preloader({ done, pct }: { done: boolean; pct: number }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="preloader" exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
          <div className="preloader-row">
            <span className="preloader-mark">LEARN</span>
            <span className="preloader-pct">{pct}%</span>
          </div>
          <div className="preloader-bar">
            <motion.div className="preloader-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="preloader-caption">loading weights · i-am-still-learning.safetensors</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Nav({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    return scrollY.on("change", (v) => setSolid(v > 60));
  }, [scrollY]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 backdrop-blur-md"
        animate={{
          backgroundColor: solid ? "rgba(234, 235, 227, 0.92)" : "rgba(234, 235, 227, 0)",
          borderBottomColor: solid ? "#D3D4C6" : "rgba(211, 212, 198, 0)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="font-serif text-lg font-semibold tracking-wider text-[#17181A]" data-cursor="Lab">
            LEARN
          </div>
          <div className="hidden md:block">
            <Magnetic strength={0.25}>
              <Link href="/chat" className="border border-[#17181A] bg-transparent text-[#17181A] px-5 py-2 font-mono text-[10px] uppercase tracking-widest rounded-full hover:bg-[#17181A] hover:text-[#EAEBE3] transition-colors duration-300" data-cursor="Cite">
                API access
              </Link>
            </Magnetic>
          </div>
          <button className="md:hidden text-[#17181A]" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>
      
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 top-[60px] z-40 bg-[#EAEBE3] flex flex-col gap-6 p-8 border-t border-[#D3D4C6] md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mt-4">
              <Link href="/chat" className="block text-center w-full border border-[#17181A] text-[#17181A] py-3 font-mono text-[11px] uppercase tracking-widest rounded-full">
                API access
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GeneratingHeadline({ start }: { start: boolean }) {
  const [settledCount, setSettledCount] = useState(0);
  const [flickerWord, setFlickerWord] = useState("");
  const [prob, setProb] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) return;
    let cancelled = false;

    async function run() {
      for (let i = 0; i < HEADLINE_WORDS.length; i++) {
        const { final, candidates } = HEADLINE_WORDS[i];
        const seq = [...candidates, final];
        for (let s = 0; s < seq.length; s++) {
          if (cancelled) return;
          setFlickerWord(seq[s]);
          setProb(s === seq.length - 1 ? 92 + Math.random() * 6 : 30 + Math.random() * 40);
          await new Promise((r) => setTimeout(r, s === seq.length - 1 ? 95 : 110));
        }
        if (cancelled) return;
        setSettledCount(i + 1);
        setFlickerWord("");
        await new Promise((r) => setTimeout(r, 70));
      }
      if (!cancelled) setDone(true);
    }
    run();
    return () => { cancelled = true; };
  }, [start]);

  const settled = HEADLINE_WORDS.slice(0, settledCount).map((w) => w.final);

  return (
    <div className="mt-6">
      <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.1] text-[#17181A] max-w-4xl select-text">
        {settled.join(" ")}
        {settled.length > 0 && " "}
        {flickerWord && <span className="text-[#B23B2E] italic">{flickerWord}</span>}
        <span className="inline-block text-[#B23B2E] font-sans animate-[pulse_1s_infinite_steps(1)]">▍</span>
      </h1>
      <div className="flex items-center gap-2 font-mono text-[10px] text-[#6B6A5C] mt-6">
        <span className="text-[#B23B2E] font-semibold">
          p = {prob ? prob.toFixed(1) : "0.0"}%
        </span>
        <span>·</span>
        <span>temp 0.70 · top-p 0.90</span>
      </div>
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={ref} className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Graph Paper Grid Background */}
      <div className="hero-grid" aria-hidden="true" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <Reveal delay={0.08}>
          <div className="flex items-center gap-3 font-mono text-[10px] text-[#6B6A5C] tracking-wide">
            <span className="border border-[#B23B2E] text-[#B23B2E] px-2 py-0.5 rounded-sm font-semibold uppercase">
              Technical Report
            </span>
            <span>·</span>
            <span>I-am-still-learning · 124M parameters · Open weights</span>
          </div>
        </Reveal>

        <GeneratingHeadline start={inView} />

        <Reveal delay={0.16} className="mt-8">
          <p className="max-w-xl text-base text-[#17181A]/85 leading-relaxed font-sans">
            Learn is a research laboratory studying how autoregressive language models reason, cite,
            and explain their inner alignments — publishing model configurations alongside annotations.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Magnetic strength={0.2}>
              <Link href="/chat" className="flex items-center gap-2 bg-[#17181A] text-[#EAEBE3] px-6 py-3.5 font-mono text-[11px] uppercase tracking-wider rounded-sm hover:bg-[#B23B2E] hover:text-[#EAEBE3] transition-colors duration-300" data-cursor="Try">
                Try Model
                <ArrowRight size={14} />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Ticker() {
  return (
    <div className="border-t border-b border-[#D3D4C6] py-3.5 bg-transparent overflow-hidden select-none">
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          className="flex gap-16 pr-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {/* Loop-scroll parameters */}
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-6 font-mono text-[11px] text-[#2E4C82] tracking-wider uppercase">
              {t}
              <span className="text-[#D3D4C6]">·</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function ArchitectureDiagram() {
  const stages = ["Tokenize", "Embed", "Attention ×32", "MLP", "Unembed", "Sample"];
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20% 0px" });

  return (
    <div className="mt-8 border border-[#D3D4C6] p-6 rounded-sm bg-white/10" ref={ref}>
      <div className="relative h-12 flex items-center mb-4">
        {/* Connection Line */}
        <div className="absolute left-6 right-6 h-[1.5px] bg-[#D3D4C6] z-0" />
        
        {/* Pulsing traveler particle */}
        {inView && (
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-[#B23B2E] z-10"
            style={{ left: "24px" }}
            animate={{ left: ["24px", "calc(100% - 32px)"] }}
            transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
          />
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {stages.map((s, i) => (
          <div className="flex flex-col gap-1 text-left" key={s}>
            <span className="font-mono text-[10px] text-[#B23B2E]">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[11px] font-sans font-medium text-[#17181A]">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Editorial() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 border-t border-[#D3D4C6]">
      <div className="max-w-3xl">
        <Reveal>
          <blockquote className="font-serif text-2xl sm:text-3xl text-[#17181A] leading-relaxed italic">
            "At Learn, we believe that intelligence is not a static artifact to be deployed, but an active process of annotation and continuous adjustment. By sharing our full weight histories and interpretability traces, we open the black box of learning to the scientific collective."
          </blockquote>
          <p className="font-mono text-[11px] text-[#6B6A5C] mt-4 uppercase tracking-wider">
            — The Learn Research Collective
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <ArchitectureDiagram />
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <footer className="bg-[#17181A] text-[#EAEBE3] py-20 px-6 mt-12 border-t border-[#D3D4C6]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 border-b border-[#D3D4C6]/20">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal max-w-sm text-[#EAEBE3] leading-tight">
                Get weights for I-am-still-learning
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-7 flex items-end">
            <Reveal delay={0.08} className="w-full">
              <div className="relative max-w-md w-full">
                <input
                  type="email"
                  placeholder="name@lab.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="w-full bg-transparent border-b border-[#D3D4C6]/30 py-3.5 pr-10 font-mono text-xs text-[#EAEBE3] focus:outline-none placeholder-[#8A897A] tracking-wider transition-colors duration-300"
                />
                <button
                  type="button"
                  className="absolute right-0 top-3 text-[#EAEBE3] hover:text-[#B23B2E] transition-colors"
                  data-cursor="Join"
                  aria-label="Submit email"
                >
                  <ArrowUpRight size={18} />
                </button>
                {/* Volumetric focus line */}
                <div
                  className={`absolute bottom-0 left-0 h-[1px] bg-[#B23B2E] transition-transform duration-500 origin-left ${
                    focused ? "scale-x-100" : "scale-x-0"
                  }`}
                  style={{ width: "100%" }}
                />
              </div>
            </Reveal>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-12 text-[10px] font-mono text-[#8A897A]">
          <span>© 2026 LEARN AI RESEARCH LAB</span>
          <span className="uppercase tracking-widest">Every claim, annotated.</span>
        </div>
      </div>
    </footer>
  );
}

export default function LabPage() {
  const [pct, setPct] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Custom cursor activation boundary class
    document.documentElement.classList.add("lab-cursor-active");

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) {
        p = 100;
        setPct(100);
        clearInterval(iv);
        setTimeout(() => setLoaded(true), 380);
      } else {
        setPct(Math.floor(p));
      }
    }, 150);

    return () => {
      document.documentElement.classList.remove("lab-cursor-active");
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#EAEBE3] text-[#17181A] font-sans selection:bg-[#B23B2E] selection:text-[#EAEBE3] overflow-x-hidden">
      <Preloader done={loaded} pct={pct} />
      <CustomCursor />
      <Nav open={menuOpen} setOpen={setMenuOpen} />

      <Hero />
      <Ticker />

      <Editorial />
      <Footer />
    </div>
  );
}
