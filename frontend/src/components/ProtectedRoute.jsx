import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden select-none">
        {/* Subtle background ambient pulse */}
        <div className="absolute inset-0 bg-radial-vignette opacity-40 pointer-events-none" />
        <div className="absolute w-96 h-96 rounded-full bg-[#ff3b2f]/10 blur-3xl -top-20 -left-20 animate-pulse pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-6 p-8">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[rgba(255,59,47,0.4)] shadow-[0_0_30px_rgba(255,59,47,0.25)]">
            <span className="text-2xl font-bold font-heading text-[#ff3b2f]">N</span>
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-[#ff3b2f]/60"
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-[#ff3b2f]">
              <span className="w-2 h-2 rounded-full bg-[#ff3b2f] animate-ping" />
              <span>Verifying Cryptographic Session</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] font-sans">
              Establishing encrypted security channel with NEXUS DOC AI...
            </p>
          </div>

          {/* Precision laser scanner line */}
          <div className="w-48 h-0.5 bg-[var(--border-subtle)] relative overflow-hidden rounded-full">
            <motion.div
              className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-[#ff3b2f] to-transparent"
              animate={{ x: [-80, 200] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
