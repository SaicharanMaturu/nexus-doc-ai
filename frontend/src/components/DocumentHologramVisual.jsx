import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Lock, Cpu, Database, Eye, Stamp, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DocumentHologramVisual({ isLight = false }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [isStamped, setIsStamped] = useState(false);

  const verificationStages = [
    { label: 'PERCEPTION', status: 'Sharpness 98.4%', passed: true },
    { label: 'LAYOUT GEOMETRY', status: '48 BBoxes Anchored', passed: true },
    { label: 'ARITHMETIC', status: 'Subtotal + Tax Balanced', passed: true },
    { label: 'CROSS-CHECK', status: 'Dual-Engine Agreement 99%', passed: true }
  ];

  const funnyAuditorFacts = [
    "Numbers verified: 100% • Hallucination rate: 0.00%",
    "Accountants saved from midnight spreadsheets: 14,892",
    "Calculators broken in frustration: Exactly 0",
    "Arithmetic precision: Absolute deterministic proof"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % verificationStages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleStampClick = () => {
    setIsStamped(true);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff3b2f', '#ffffff', '#10b981']
      });
    } catch {}
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-[4/3] flex items-center justify-center select-none">
      {/* Ambient Red Glow Behind Document Hologram */}
      <div
        className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isLight ? 'bg-[#ff3b2f]/10 opacity-60' : 'bg-[#ff3b2f]/15 opacity-80'
        }`}
      />

      {/* Outer Hologram Container with 3D Perspective */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        {/* Layer 1: Background Verification Matrix Plane (Deepest) */}
        <motion.div
          className={`absolute w-80 h-96 rounded-2xl border transition-all duration-500 ${
            isLight
              ? 'bg-slate-100/60 border-slate-300/60 shadow-lg'
              : 'bg-[#0f1013]/60 border-[rgba(255,255,255,0.06)] shadow-2xl'
          } backdrop-blur-sm`}
          style={{
            transform: 'rotateX(20deg) rotateY(-18deg) rotateZ(3deg) translateZ(-40px)',
            transformStyle: 'preserve-3d',
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [-3, 3, -3],
                }
          }
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Subtle grid pattern inside background card */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ff3b2f_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>SYS_INTELLIGENCE // V1</span>
            <span className="text-[#ff3b2f]">ZERO-KNOWLEDGE AUDIT</span>
          </div>
        </motion.div>

        {/* Layer 2: Main Verified Document Sheet (Primary Foreground Plane) */}
        <motion.div
          className={`relative w-84 sm:w-88 h-[410px] rounded-2xl border transition-all duration-500 overflow-hidden ${
            isLight
              ? 'bg-white/95 border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.08),0_0_25px_rgba(255,59,47,0.08)]'
              : 'bg-[#141518]/90 border-[rgba(255,59,47,0.3)] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(255,59,47,0.18)]'
          } backdrop-blur-xl`}
          style={{
            transform: 'rotateX(18deg) rotateY(-14deg) rotateZ(2deg) translateZ(20px)',
            transformStyle: 'preserve-3d',
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [4, -4, 4],
                  rotateX: [17, 19, 17],
                  rotateY: [-15, -13, -15],
                }
          }
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Active Red Scanning Laser Line */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute left-0 right-0 h-1 z-30 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 59, 47, 0.95), transparent)',
                boxShadow: '0 0 16px 2px rgba(255, 59, 47, 0.75)',
              }}
              animate={{
                top: ['3%', '94%', '3%'],
              }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="absolute right-4 -top-3.5 px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#ff3b2f] text-white tracking-widest shadow-sm">
                SCANNING
              </div>
            </motion.div>
          )}

          {/* Document Header Bar */}
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff3b2f] animate-pulse" />
              <div className="text-[11px] font-heading font-bold tracking-wider text-[var(--text-primary)]">
                INVOICE #NX-2026-9841
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[9px] font-mono font-medium">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>VERIFIED</span>
            </div>
          </div>

          {/* Document Content Elements with Optical Bounding Boxes */}
          <div className="p-4 space-y-3 font-mono text-[10px]">
            {/* Vendor & Due Date Box */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative p-2 rounded-lg bg-[var(--bg-secondary)] border border-dashed border-[#ff3b2f]/40">
                <span className="text-[8px] text-[var(--text-tertiary)] block uppercase tracking-wider">Vendor Entity</span>
                <span className="font-semibold text-[var(--text-primary)] text-[11px] truncate block">Astraea Quantum</span>
                <span className="text-[8px] text-emerald-500 block">OCR Conf: 99.8%</span>
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#ff3b2f] rounded-full" />
              </div>

              <div className="relative p-2 rounded-lg bg-[var(--bg-secondary)] border border-dashed border-[var(--border-subtle)]">
                <span className="text-[8px] text-[var(--text-tertiary)] block uppercase tracking-wider">Issue Date</span>
                <span className="font-semibold text-[var(--text-primary)] text-[11px] block">2026-11-20</span>
                <span className="text-[8px] text-[var(--text-tertiary)] block">Due: +30 Days (Valid)</span>
              </div>
            </div>

            {/* Extracted Line Items Wireframe */}
            <div className="rounded-lg bg-[var(--bg-secondary)] p-2.5 border border-[var(--border-subtle)] space-y-2">
              <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] pb-1 border-b border-[var(--border-subtle)]">
                <span>ITEM DESCRIPTION</span>
                <span>TOTAL</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                <span className="truncate max-w-[160px]">Optical Sensor Module Gen-5</span>
                <span className="font-semibold text-[var(--text-primary)]">$8,400.00</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                <span className="truncate max-w-[160px]">Deterministic Engine License</span>
                <span className="font-semibold text-[var(--text-primary)]">$4,200.00</span>
              </div>
            </div>

            {/* Arithmetic Constraints Proof Box */}
            <div className="relative p-2.5 rounded-lg bg-[#ff3b2f]/[0.04] border border-[#ff3b2f]/30 space-y-1">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-[var(--text-secondary)]">Subtotal ($12,600) + Tax ($1,260)</span>
                <span className="text-emerald-500 font-bold">PASSED</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-[11px] font-bold">
                <span className="text-[var(--text-primary)]">Total Balance</span>
                <span className="text-[#ff3b2f] font-mono">$13,860.00</span>
              </div>
            </div>

            {/* Dynamic Stage Pill */}
            <div className="pt-1 flex items-center justify-between text-[9px] text-[var(--text-tertiary)]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b2f] animate-ping" />
                <span className="font-semibold text-[#ff3b2f]">
                  {verificationStages[activeStep].label}:
                </span>
                <span>{verificationStages[activeStep].status}</span>
              </div>
              <span className="font-mono text-[8px] text-[var(--text-tertiary)]">256-BIT PROOF</span>
            </div>

            {/* Interactive "Click to Stamp & Verify" Easter Egg Button */}
            <button
              type="button"
              onClick={handleStampClick}
              className="w-full mt-1.5 py-1.5 px-3 rounded-lg border border-dashed border-[#ff3b2f]/40 hover:border-[#ff3b2f] bg-[#ff3b2f]/5 hover:bg-[#ff3b2f]/15 text-[#ff3b2f] text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              <span>{isStamped ? "✓ Document Stamped (Click for Confetti!)" : "⚡ Click to Stamp & Verify"}</span>
            </button>
          </div>

          {/* Interactive Auditor Rubber Stamp Overlay */}
          <AnimatePresence>
            {isStamped && (
              <motion.div
                initial={{ scale: 2.4, opacity: 0, rotate: -35 }}
                animate={{ scale: 1, opacity: 0.95, rotate: -12 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 p-4"
              >
                <div className="border-4 border-dashed border-[#ff3b2f] bg-[#ff3b2f]/15 backdrop-blur-[2px] px-4 py-2.5 rounded-xl text-center shadow-[0_0_35px_rgba(255,59,47,0.5)]">
                  <span className="block text-lg font-heading font-black tracking-widest text-[#ff3b2f]">
                    100% AUDIT APPROVED
                  </span>
                  <span className="block text-[8px] font-mono tracking-widest text-[var(--text-primary)] uppercase font-bold mt-0.5">
                    Deterministic Math &bull; 0 Hallucinations
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Layer 3: Floating Micro-Badges & Connected Neural Evidence Points (Floating Out in Front) */}
        <motion.div
          className={`absolute -bottom-4 -left-3 sm:-left-6 px-3.5 py-2 rounded-xl border backdrop-blur-md shadow-xl flex items-center gap-2.5 transition-all duration-300 ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-800'
              : 'bg-[#18181b]/95 border-[rgba(255,59,47,0.35)] text-zinc-100'
          }`}
          style={{
            transform: 'translateZ(55px)',
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [-2, 2, -2],
                }
          }
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-7 h-7 rounded-lg bg-[#ff3b2f]/10 border border-[#ff3b2f]/30 flex items-center justify-center text-[#ff3b2f]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-heading font-bold leading-tight">Deterministic Trust</div>
            <div className="text-[9px] font-mono text-[var(--text-tertiary)]">Zero Hallucination Math</div>
          </div>
        </motion.div>

        <motion.div
          className={`absolute -top-3 -right-2 sm:-right-4 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg flex items-center gap-2 transition-all duration-300 ${
            isLight
              ? 'bg-white/90 border-slate-200 text-slate-800'
              : 'bg-[#18181b]/90 border-[rgba(255,255,255,0.1)] text-zinc-200'
          }`}
          style={{
            transform: 'translateZ(45px)',
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [2, -2, 2],
                }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-wide">Dual OCR Agreement: 99.4%</span>
        </motion.div>
      </div>
    </div>
  );
}
