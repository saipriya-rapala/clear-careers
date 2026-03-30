import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, UserCircle2, X } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebaseConfig";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSuccessMessage(false);

    if (!isFirebaseConfigured) {
      setError("Firebase is not configured. Add REACT_APP_FIREBASE_* values in .env.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    if (isLogin) {
      try {
        await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        onAuthSuccess();
      } catch (loginError) {
        setError(loginError?.message || "Login failed.");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      onAuthSuccess();
    } catch (signUpError) {
      setError(signUpError?.message || "Sign-up failed.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsSuccessMessage(true);
    setError("Account created successfully.");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="w-full max-w-md rounded-2xl border border-white/25 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-cyan-200">Secure Access</p>
              <h2 className="text-2xl font-black text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-200 transition hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/20 bg-slate-900/30 p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
                setIsSuccessMessage(false);
              }}
              className={`rounded-lg py-2 text-sm font-semibold transition ${
                isLogin ? "bg-cyan-500 text-slate-900" : "text-slate-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
                setIsSuccessMessage(false);
              }}
              className={`rounded-lg py-2 text-sm font-semibold transition ${
                !isLogin ? "bg-cyan-500 text-slate-900" : "text-slate-300"
              }`}
            >
              Sign-up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
                <Mail className="h-3.5 w-3.5" />
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/25 bg-slate-900/50 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
                <Lock className="h-3.5 w-3.5" />
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/25 bg-slate-900/50 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-white/10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {!isLogin && (
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  Confirm Password
                </span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/25 bg-slate-900/50 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-white/10"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
            )}

            {error && (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  isSuccessMessage
                    ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : "border border-red-400/30 bg-red-500/10 text-red-200"
                }`}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Please wait..." : isLogin ? "Login" : "Create Account"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
