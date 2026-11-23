import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Shield, Smile, Eye, EyeOff } from 'lucide-react';

export default function NexusGuardianBot({
  formState = 'idle', // 'idle' | 'email' | 'password' | 'password_visible' | 'submitting' | 'success' | 'error'
  isLight = false,
  passwordStrengthScore = 0
}) {
  const [bubbleText, setBubbleText] = useState('Greetings, Human Auditor! Ready to inspect some documents?');
  const [jokeIndex, setJokeIndex] = useState(0);

  const wittyJokes = [
    "Why did the invoice cross the road? To balance the ledger on the other side.",
    "Did you know? 89% of math errors happen 5 minutes before Friday logout.",
    "I consume unverified PDFs for breakfast. With a side of deterministic math.",
    "My zero-knowledge proofs are so private, even I don't know my own shoe size.",
    "Don't worry, I won't judge your password... but my neural net might chuckle."
  ];

  useEffect(() => {
    switch (formState) {
      case 'email':
        setBubbleText("Analyzing organic keystrokes... Looking sharp, Chief! ☕");
        break;
      case 'password':
        if (passwordStrengthScore === 0) {
          setBubbleText("I'm covering my sensors! Zero-Knowledge respect! 🙈");
        } else if (passwordStrengthScore === 1) {
          setBubbleText("Potato tier password detected 🥔... Add a number or symbol!");
        } else if (passwordStrengthScore === 2) {
          setBubbleText("Getting warm! 🧐 You could stop a nosy coworker with that.");
        } else if (passwordStrengthScore === 3) {
          setBubbleText("Solid fortress armor! 🏰 Almost impenetrable.");
        } else {
          setBubbleText("GOD-TIER ENCRYPTION 🚀! Quantum aliens are crying right now.");
        }
        break;
      case 'password_visible':
        setBubbleText("Wait, you made it visible?! Looking away, looking away! 🫣");
        break;
      case 'submitting':
        setBubbleText("Crunching cryptographic Argon2 hashes... Hold your coffee! ⚡");
        break;
      case 'success':
        setBubbleText("ACCESS GRANTED! Welcome back to the intelligence matrix! 🎉");
        break;
      case 'error':
        setBubbleText("Ouch! Either the matrix glitched or your fingers slipped. Try again! 🤖");
        break;
      default:
        setBubbleText("I'm REX, your Document Sentinel. Tap me for insider audit gossip!");
        break;
    }
  }, [formState, passwordStrengthScore]);

  const cycleJoke = () => {
    const nextIdx = (jokeIndex + 1) % wittyJokes.length;
    setJokeIndex(nextIdx);
    setBubbleText(wittyJokes[nextIdx]);
  };

  const isHidingEyes = formState === 'password';
  const isPeeking = formState === 'password_visible';

  return (
    <div className="relative flex flex-col items-center select-none py-2">
      {/* Interactive Witty Speech Bubble */}
      <motion.div
        key={bubbleText}
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={cycleJoke}
        title="Click me for AI auditor humor!"
        className={`relative mb-3 px-3.5 py-2 rounded-2xl border text-xs font-mono max-w-[280px] sm:max-w-[320px] text-center shadow-lg cursor-pointer transition-colors ${
          isLight
            ? 'bg-white border-red-200 text-slate-800 shadow-red-500/5 hover:border-[#ff3b2f]'
            : 'bg-[#18181b]/95 border-[#ff3b2f]/40 text-zinc-100 shadow-[0_0_15px_rgba(255,59,47,0.15)] hover:border-[#ff3b2f]'
        }`}
      >
        <span className="leading-snug block">{bubbleText}</span>
        <span className="text-[9px] text-[#ff3b2f] block font-bold mt-1 uppercase tracking-wider">
          ✦ Click Rex for audit wit
        </span>
        {/* Tail indicator */}
        <div
          className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b ${
            isLight ? 'bg-white border-red-200' : 'bg-[#18181b] border-[#ff3b2f]/40'
          }`}
        />
      </motion.div>

      {/* Cybernetic Mascot "REX" SVG Robot with Interactive Eyeballs / Hands */}
      <motion.div
        animate={
          formState === 'submitting'
            ? { rotate: [0, -3, 3, 0], y: [0, -4, 0] }
            : { y: [0, -3, 0] }
        }
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-20 h-20 flex items-center justify-center cursor-pointer"
        onClick={cycleJoke}
      >
        {/* Head Glow Aura */}
        <div
          className={`absolute inset-0 rounded-full blur-md opacity-40 transition-colors ${
            formState === 'error'
              ? 'bg-amber-500'
              : formState === 'success'
              ? 'bg-emerald-500'
              : 'bg-[#ff3b2f]'
          }`}
        />

        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-md">
          {/* Antenna */}
          <line x1="50" y1="20" x2="50" y2="8" stroke={isLight ? '#475569' : '#a1a1aa'} strokeWidth="3" strokeLinecap="round" />
          <motion.circle
            cx="50"
            cy="7"
            r="4.5"
            fill="#ff3b2f"
            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Ears / Side Sensory Pods */}
          <rect x="18" y="38" width="6" height="14" rx="3" fill="#ff3b2f" opacity="0.85" />
          <rect x="76" y="38" width="6" height="14" rx="3" fill="#ff3b2f" opacity="0.85" />

          {/* Main Head Chassis */}
          <rect
            x="22"
            y="20"
            width="56"
            height="46"
            rx="14"
            fill={isLight ? '#ffffff' : '#141518'}
            stroke={isLight ? '#cbd5e1' : '#27272a'}
            strokeWidth="2.5"
          />

          {/* Glowing Visor Screen */}
          <rect
            x="28"
            y="28"
            width="44"
            height="22"
            rx="8"
            fill={isLight ? '#0f172a' : '#07080a'}
            stroke="#ff3b2f"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* Normal Eyes / Looking around */}
          {!isHidingEyes && !isPeeking && (
            <g>
              {/* Left Eye */}
              <motion.circle
                cx={formState === 'email' ? '41' : '39'}
                cy="39"
                r="3.5"
                fill="#ff3b2f"
                animate={{ scaleY: [1, 1, 0.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
              />
              {/* Right Eye */}
              <motion.circle
                cx={formState === 'email' ? '59' : '61'}
                cy="39"
                r="3.5"
                fill="#ff3b2f"
                animate={{ scaleY: [1, 1, 0.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
              />
              {/* Cheek Blushes */}
              <circle cx="34" cy="45" r="1.5" fill="#ff3b2f" opacity="0.5" />
              <circle cx="66" cy="45" r="1.5" fill="#ff3b2f" opacity="0.5" />
            </g>
          )}

          {/* Peeking Eyes (Show Password) */}
          {isPeeking && (
            <g>
              <circle cx="39" cy="38" r="4" fill="#10b981" />
              <circle cx="61" cy="38" r="4" fill="#10b981" />
              <circle cx="40" cy="37" r="1.5" fill="#ffffff" />
              <circle cx="62" cy="37" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Mouth / Audio Wave */}
          <g>
            <motion.path
              d="M 44 45 Q 50 48 56 45"
              fill="none"
              stroke={formState === 'success' ? '#10b981' : '#ff3b2f'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>

          {/* Robotic Hands covering eyes when typing password */}
          {isHidingEyes && (
            <motion.g
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Left Hand */}
              <rect x="29" y="30" width="18" height="18" rx="6" fill="#ff3b2f" />
              <circle cx="35" cy="36" r="1.5" fill="#ffffff" />
              <circle cx="41" cy="36" r="1.5" fill="#ffffff" />
              {/* Right Hand */}
              <rect x="53" y="30" width="18" height="18" rx="6" fill="#ff3b2f" />
              <circle cx="59" cy="36" r="1.5" fill="#ffffff" />
              <circle cx="65" cy="36" r="1.5" fill="#ffffff" />
            </motion.g>
          )}

          {/* Neck & Torso Collar */}
          <rect x="42" y="66" width="16" height="5" rx="2" fill={isLight ? '#94a3b8' : '#3f3f46'} />
          <path d="M 32 72 L 68 72 L 72 82 L 28 82 Z" fill={isLight ? '#f1f5f9' : '#18181b'} stroke={isLight ? '#cbd5e1' : '#27272a'} strokeWidth="1.5" />
          <circle cx="50" cy="77" r="2.5" fill="#ff3b2f" />
        </svg>

        {/* Small floating status emblem */}
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono bg-[#ff3b2f] text-white font-bold shadow-sm">
          REX AI
        </span>
      </motion.div>
    </div>
  );
}
