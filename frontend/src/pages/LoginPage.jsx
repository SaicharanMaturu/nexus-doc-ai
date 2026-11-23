import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sun,
  Moon,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import DocumentHologramVisual from '../components/DocumentHologramVisual';
import NexusGuardianBot from '../components/NexusGuardianBot';
import confetti from 'canvas-confetti';

export default function LoginPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    sessionExpiredNotice,
    dismissSessionExpiredNotice
  } = useAuth();

  // Mode: 'login' | 'register' | 'forgot' | 'reset'
  const queryMode = new URLSearchParams(location.search).get('mode');
  const [authMode, setAuthMode] = useState(queryMode || initialMode || 'login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [botState, setBotState] = useState('idle');

  // Destination route after login
  const fromPath = location.state?.from?.pathname || '/dashboard';

  // Synchronize mode if query parameter or initialMode changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get('mode') || initialMode;
    if (m && ['login', 'register', 'forgot', 'reset'].includes(m)) {
      setAuthMode(m);
    }
  }, [location.search, initialMode]);

  // Clear messages when switching modes
  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});
    setBotState('idle');
    dismissSessionExpiredNotice();
  };

  // Password strength calculator with humorous yet neat tier badges
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty (Not even a ghost)', color: 'bg-zinc-600', width: '0%' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score, label: 'Potato Tier 🥔 (A crayon could crack this)', color: 'bg-red-500', width: '25%' };
      case 2:
        return { score, label: 'Mildly Optimistic 🧐 (Roommate-proof)', color: 'bg-amber-500', width: '50%' };
      case 3:
        return { score, label: 'Fortified Bunker 🏰 (CFO Approved)', color: 'bg-blue-500', width: '75%' };
      case 4:
        return { score, label: 'God-Tier 🚀 (Quantum Aliens Are Crying)', color: 'bg-emerald-500', width: '100%' };
      default:
        return { score: 0, label: 'Potato Tier 🥔', color: 'bg-red-500', width: '15%' };
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Auto-fill demo credentials for friction-free evaluation
  const handleFillDemoCredentials = () => {
    setEmail('analyst@nexusdoc.ai');
    setPassword('NexusDocAI#2026!');
    setErrorMessage('');
    setFieldErrors({});
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      errors.email = 'Valid corporate email address required';
    }

    if (authMode === 'login') {
      if (!password) {
        errors.password = 'Password is required';
      }
    } else if (authMode === 'register') {
      if (!name || name.trim().length < 2) {
        errors.name = 'Full name must be at least 2 characters';
      }
      if (!password || password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (authMode === 'reset') {
      if (!resetToken) {
        errors.resetToken = 'Recovery token is required';
      }
      if (!password || password.length < 8) {
        errors.password = 'New password must be at least 8 characters';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (authMode === 'login') {
        setBotState('submitting');
        await login(email, password, rememberMe);
        setBotState('success');
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff3b2f', '#ffffff', '#10b981']
          });
        } catch {}
        setTimeout(() => {
          navigate(fromPath, { replace: true });
        }, 500);
      } else if (authMode === 'register') {
        setBotState('submitting');
        await register({
          email,
          password,
          name,
          organization: organization || 'Nexus Enterprise Workspace'
        });
        setBotState('success');
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ff3b2f', '#ffffff', '#10b981']
          });
        } catch {}
        setTimeout(() => {
          navigate(fromPath, { replace: true });
        }, 500);
      } else if (authMode === 'forgot') {
        setBotState('submitting');
        const res = await forgotPassword(email);
        setBotState('success');
        if (res.token_preview) {
          setResetToken(res.token_preview);
          setSuccessMessage(`Recovery token generated: ${res.token_preview}. Now set your new password below.`);
          setAuthMode('reset');
        } else {
          setSuccessMessage(res.message || 'Recovery protocol dispatched to email.');
        }
      } else if (authMode === 'reset') {
        setBotState('submitting');
        const res = await resetPassword(email, resetToken, password);
        setBotState('success');
        setSuccessMessage('Password successfully updated.');
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#ff3b2f', '#ffffff', '#10b981']
          });
        } catch {}
        setTimeout(() => {
          setAuthMode('login');
          setPassword('');
          setConfirmPassword('');
          setBotState('idle');
          setSuccessMessage('Password reset successfully. Sign in with your new credentials.');
        }, 1200);
      }
    } catch (err) {
      setBotState('error');
      setErrorMessage(err.message || 'An authentication error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col lg:flex-row relative overflow-x-hidden font-sans transition-colors duration-300 ${
        isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#09090b] text-[#f5f5f5]'
      }`}
    >
      {/* Background Architectural Grid & Subtle Crimson Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute inset-0 ${
            isLight
              ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50/40 via-transparent to-transparent'
              : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ff3b2f]/10 via-[#09090b]/40 to-[#09090b]'
          }`}
        />
        {/* Subtle architectural grid lines */}
        <div
          className={`absolute inset-0 opacity-[0.035] ${
            isLight ? 'invert' : ''
          }`}
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Ambient Crimson illumination corner orb */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ff3b2f]/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#ff3b2f]/8 blur-[140px] pointer-events-none" />
      </div>

      {/* =========================================================================
          LEFT SIDE — NEXUS BRAND EXPERIENCE (52% on Desktop)
          ========================================================================= */}
      <div className="relative z-10 w-full lg:w-[52%] flex flex-col justify-between p-6 sm:p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">
        {/* Top Header: Brand Identity & Telemetry */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[rgba(255,59,47,0.35)] shadow-[0_0_20px_rgba(255,59,47,0.22)] group-hover:border-[#ff3b2f] transition-all duration-300">
              <span className="text-2xl font-bold font-heading text-[#ff3b2f]">N</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ff3b2f] animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ff3b2f]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-wider text-[var(--text-primary)]">
                  NEXUS
                </span>
                <span className="font-heading font-bold text-xl text-[#ff3b2f]">
                  DOC AI
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)]">
                Intelligence Gateway &bull; v1.0
              </span>
            </div>
          </Link>

          {/* Security Telemetry Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zero-Knowledge Proofs Active</span>
          </div>
        </div>

        {/* Center: Editorial Tagline & 3D Interactive Document Scanner Visual */}
        <div className="my-8 lg:my-auto space-y-8 max-w-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff3b2f]/10 border border-[#ff3b2f]/30 text-[#ff3b2f] text-xs font-mono font-medium tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DETERMINISTIC VERIFICATION ARCHITECTURE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight leading-[1.1] text-[var(--text-primary)]">
              Trust Every <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3b2f] via-[#ff6b5f] to-[#ff3b2f]">
                Document.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] font-normal leading-relaxed">
              Intelligent verification. Evidence-driven decisions. Where numbers actually add up, and CFOs sleep soundly at night ☕
            </p>
          </div>

          {/* Custom Abstract 3D-Inspired Visual */}
          <div className="py-2">
            <DocumentHologramVisual isLight={isLight} />
          </div>

          {/* Security Specifications Row */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)]">
            <div>
              <span className="text-[var(--text-tertiary)] block text-[10px] uppercase">Cryptography</span>
              <span className="font-semibold text-[var(--text-primary)]">Argon2id Hash</span>
            </div>
            <div>
              <span className="text-[var(--text-tertiary)] block text-[10px] uppercase">Dual OCR</span>
              <span className="font-semibold text-[var(--text-primary)]">Hardware Engine</span>
            </div>
            <div>
              <span className="text-[var(--text-tertiary)] block text-[10px] uppercase">Audit Trail</span>
              <span className="font-semibold text-[var(--text-primary)]">Immutable Logs</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-[var(--text-tertiary)] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} NEXUS DOC AI Corporation</span>
          <span className="font-mono text-[10px]">SOC2 Type II &bull; ISO 27001 Compliant</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE — AUTHENTICATION EXPERIENCE (48% on Desktop)
          ========================================================================= */}
      <div className="relative z-10 w-full lg:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-16">
        {/* Top Control Bar: Theme Toggle */}
        <div className="flex items-center justify-end">
          <motion.button
            type="button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 cursor-pointer shadow-sm ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-[#ff3b2f]/40'
                : 'bg-[#18181b] hover:bg-[#1f1f23] border-[rgba(255,255,255,0.1)] text-[#f5f5f5] hover:border-[#ff3b2f]/40'
            }`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            {isLight ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold">Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#ff3b2f]" />
                <span className="font-semibold">Dark Theme</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Center: Auth Card & Interaction Forms */}
        <div className="my-auto max-w-md w-full mx-auto py-8">
          {/* Active Session Notice if already logged in */}
          {isAuthenticated && user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-[var(--bg-card)] border border-[#ff3b2f]/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="text-xs">
                <div className="flex items-center gap-1.5 text-emerald-500 font-mono text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active Session Detected</span>
                </div>
                <div className="text-[var(--text-secondary)] mt-0.5">
                  Signed in as <strong className="text-[var(--text-primary)]">{user.email}</strong>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-3 py-1.5 rounded-lg bg-[#ff3b2f] text-white text-xs font-semibold hover:bg-[#ff5147] transition-colors"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={async () => { await logout(); }}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-white hover:border-[#ff3b2f]/40 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}

          {/* Top Segmented Mode Tabs: Sign In / Create Account / Forgot Password */}
          <div className="mb-6 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] grid grid-cols-3 gap-1 select-none">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-mono font-medium transition-all text-center cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[var(--bg-card)] text-[#ff3b2f] shadow-sm font-bold border border-[#ff3b2f]/35'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-mono font-medium transition-all text-center cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[var(--bg-card)] text-[#ff3b2f] shadow-sm font-bold border border-[#ff3b2f]/35'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-mono font-medium transition-all text-center cursor-pointer ${
                authMode === 'forgot' || authMode === 'reset'
                  ? 'bg-[var(--bg-card)] text-[#ff3b2f] shadow-sm font-bold border border-[#ff3b2f]/35'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Forgot Pass
            </button>
          </div>

          {/* Notification: Session Expired Alert */}
          {sessionExpiredNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Your security session has expired. Please sign in again.</span>
              </div>
              <button
                type="button"
                onClick={dismissSessionExpiredNotice}
                className="text-xs font-bold hover:underline ml-2"
              >
                &times;
              </button>
            </motion.div>
          )}

          {/* Notification: Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </motion.div>
          )}

          {/* Notification: Success Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </motion.div>
          )}

          {/* Interactive REX Cyber Sentinel Robot Mascot */}
          <div className="mb-4">
            <NexusGuardianBot
              formState={botState}
              isLight={isLight}
              passwordStrengthScore={passwordStrength.score}
            />
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-primary)]">
              {authMode === 'login' && 'Welcome to NEXUS.'}
              {authMode === 'register' && 'Create Account.'}
              {authMode === 'forgot' && 'Password Recovery.'}
              {authMode === 'reset' && 'Reset Security Credential.'}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              {authMode === 'login' && 'Access your intelligent document workspace.'}
              {authMode === 'register' && 'Join the enterprise intelligent document verification platform.'}
              {authMode === 'forgot' && 'Enter your registered email to receive recovery instructions.'}
              {authMode === 'reset' && 'Enter your recovery token and define a new secure password.'}
            </p>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field: Full Name (Registration Only) */}
            {authMode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-medium font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Full Name / Legal Identifier
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Jennifer Vance"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none ${
                      isLight
                        ? 'bg-white border-slate-300 focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-slate-900 placeholder:text-slate-400'
                        : 'bg-[#141518] border-[rgba(255,255,255,0.1)] focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-white placeholder:text-zinc-600'
                    } ${fieldErrors.name ? 'border-red-500' : ''}`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[11px] text-red-500 font-mono">{fieldErrors.name}</p>
                )}
              </motion.div>
            )}

            {/* Field: Organization / Workspace (Registration Only) */}
            {authMode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-medium font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Enterprise Organization
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Astraea Financial Operations"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none ${
                      isLight
                        ? 'bg-white border-slate-300 focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-slate-900 placeholder:text-slate-400'
                        : 'bg-[#141518] border-[rgba(255,255,255,0.1)] focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-white placeholder:text-zinc-600'
                    }`}
                  />
                </div>
              </motion.div>
            )}

            {/* Field: Email Address (All modes) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setBotState('email')}
                  onBlur={() => setBotState('idle')}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none ${
                    isLight
                      ? 'bg-white border-slate-300 focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                      : 'bg-[#141518] border-[rgba(255,255,255,0.1)] focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-white placeholder:text-zinc-600 shadow-inner'
                  } ${fieldErrors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 font-mono">{fieldErrors.email}</p>
              )}
            </div>

            {/* Field: Recovery Token (Reset Mode Only) */}
            {authMode === 'reset' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-medium font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Recovery Token
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff3b2f]" />
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                    placeholder="NEXUS-RST-XXXX-XXXX"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono tracking-wider transition-all duration-200 outline-none ${
                      isLight
                        ? 'bg-white border-slate-300 focus:border-[#ff3b2f] text-slate-900'
                        : 'bg-[#141518] border-[rgba(255,255,255,0.1)] focus:border-[#ff3b2f] text-white'
                    }`}
                  />
                </div>
              </motion.div>
            )}

            {/* Field: Password (Login, Register, and Reset) */}
            {authMode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                    {authMode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-[#ff3b2f] hover:underline font-mono"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setBotState(showPassword ? 'password_visible' : 'password')}
                    onBlur={() => setBotState('idle')}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    required
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none ${
                      isLight
                        ? 'bg-white border-slate-300 focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        : 'bg-[#141518] border-[rgba(255,255,255,0.1)] focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-white placeholder:text-zinc-600 shadow-inner'
                    } ${fieldErrors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = !showPassword;
                      setShowPassword(next);
                      setBotState(next ? 'password_visible' : 'password');
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-red-500 font-mono">{fieldErrors.password}</p>
                )}

                {/* Password Strength Feedback (Registration and Reset) */}
                {(authMode === 'register' || authMode === 'reset') && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-1.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[var(--text-tertiary)]">Security Entropy:</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {passwordStrength.label}
                      </span>
                    </div>
                    {/* Visual 4-Segment Strength Bar */}
                    <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                        }`}
                        style={{ width: '25%' }}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'
                        }`}
                        style={{ width: '25%' }}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'
                        }`}
                        style={{ width: '25%' }}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'
                        }`}
                        style={{ width: '25%' }}
                      />
                    </div>
                    <ul className="text-[10px] text-[var(--text-tertiary)] space-y-0.5 pt-0.5">
                      <li className={password.length >= 8 ? 'text-emerald-500' : ''}>
                        &bull; Minimum 8 characters
                      </li>
                      <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-500' : ''}>
                        &bull; Uppercase and lowercase letters
                      </li>
                      <li className={/\d/.test(password) ? 'text-emerald-500' : ''}>
                        &bull; At least one numerical digit
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>
            )}

            {/* Field: Confirm Password (Registration Only) */}
            {authMode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-medium font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none ${
                      isLight
                        ? 'bg-white border-slate-300 focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-slate-900 placeholder:text-slate-400'
                        : 'bg-[#141518] border-[rgba(255,255,255,0.1)] focus:border-[#ff3b2f] focus:ring-2 focus:ring-[#ff3b2f]/20 text-white placeholder:text-zinc-600'
                    } ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-red-500 font-mono">{fieldErrors.confirmPassword}</p>
                )}
              </motion.div>
            )}

            {/* Option: Remember Me (Login Mode Only) */}
            {authMode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-[#ff3b2f] focus:ring-[#ff3b2f] accent-[#ff3b2f]"
                  />
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    Remember me for 7 days <span className="text-[10px] text-[var(--text-tertiary)] font-normal">(Unless you clear cookies at 2 AM ☕)</span>
                  </span>
                </label>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full py-3 px-6 rounded-xl font-heading font-bold text-sm tracking-wide text-white uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                  isSubmitting
                    ? 'bg-zinc-700 cursor-not-allowed opacity-75'
                    : 'bg-[#ff3b2f] hover:bg-[#ff5147] shadow-[0_0_25px_rgba(255,59,47,0.35)] hover:shadow-[0_0_35px_rgba(255,59,47,0.5)] cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {authMode === 'login' && 'Sign In'}
                      {authMode === 'register' && 'Create Enterprise Account'}
                      {authMode === 'forgot' && 'Send Recovery Protocol'}
                      {authMode === 'reset' && 'Confirm Password Reset'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Quick Demo Credentials Autofill Pill (for convenient evaluation) */}
          {authMode === 'login' && (
            <div className="mt-5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-center">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff3b2f]" />
                  <span className="font-mono text-[11px]">Too tired to type?</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold text-[#ff3b2f] bg-[#ff3b2f]/10 hover:bg-[#ff3b2f]/20 transition-colors"
                >
                  Auditor Superpowers ⚡
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Fill for Forgot Password */}
          {authMode === 'forgot' && (
            <div className="mt-5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-center">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <KeyRound className="w-3.5 h-3.5 text-[#ff3b2f]" />
                  <span className="font-mono text-[11px]">Demo Recovery:</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setEmail('analyst@nexusdoc.ai'); setErrorMessage(''); }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold text-[#ff3b2f] bg-[#ff3b2f]/10 hover:bg-[#ff3b2f]/20 transition-colors"
                >
                  Fill Demo Email
                </button>
              </div>
            </div>
          )}

          {/* Mode Switchers */}
          <div className="mt-6 text-center text-xs text-[var(--text-secondary)] space-y-2">
            {authMode === 'login' && (
              <>
                <p>
                  New to NEXUS?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-semibold text-[#ff3b2f] hover:underline cursor-pointer"
                  >
                    Create an account.
                  </button>
                </p>
                <p>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-[var(--text-tertiary)] hover:text-[#ff3b2f] underline cursor-pointer"
                  >
                    Need password recovery? Click here.
                  </button>
                </p>
              </>
            )}

            {authMode === 'register' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-[#ff3b2f] hover:underline cursor-pointer"
                >
                  Sign In instead.
                </button>
              </p>
            )}

            {authMode === 'forgot' && (
              <div className="space-y-1.5">
                <p>
                  Already have a recovery token?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="font-semibold text-[#ff3b2f] hover:underline cursor-pointer"
                  >
                    Enter token directly.
                  </button>
                </p>
                <p>
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-[#ff3b2f] hover:underline cursor-pointer"
                  >
                    Return to Sign In.
                  </button>
                </p>
              </div>
            )}

            {authMode === 'reset' && (
              <div className="space-y-1.5">
                <p>
                  Need to request a token first?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="font-semibold text-[#ff3b2f] hover:underline cursor-pointer"
                  >
                    Request new recovery token.
                  </button>
                </p>
                <p>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-[#ff3b2f] hover:underline cursor-pointer"
                  >
                    Return to Sign In.
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Security Assurance */}
        <div className="text-center lg:text-left text-[11px] font-mono text-[var(--text-tertiary)] flex items-center justify-center lg:justify-start gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Gateway &bull; Strict Argon2 Authentication Standards</span>
        </div>
      </div>
    </div>
  );
}
