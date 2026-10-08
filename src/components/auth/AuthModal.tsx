import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Hash, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type ModalMode = 'LOGIN' | 'REGISTER' | 'REGISTER_OTP' | 'FORGOT_EMAIL' | 'FORGOT_OTP';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    sendRegisterOtp,
    verifyRegisterOtp,
    sendForgotOtp,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<ModalMode>('LOGIN');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [studentId, setStudentId] = useState('');
  const [batch, setBatch] = useState('65');
  const [section, setSection] = useState('B');
  const [otp, setOtp] = useState('');

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  const resetAllStates = () => {
    setError(null);
    setSuccessMsg(null);
    setOtp('');
  };

  // 1. SIGN IN SUBMIT
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    resetAllStates();
    setLoading(true);

    try {
      await login(email.trim(), password);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // 2. REGISTRATION STEP 1: Send OTP to Email
  const handleSendRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !department) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    resetAllStates();
    setLoading(true);

    try {
      const res = await sendRegisterOtp({
        name: name.trim(),
        email: email.trim(),
        password,
        department,
        batch: batch.trim(),
        section: section.trim(),
      });
      setSuccessMsg(res.message || `A 6-digit verification code has been sent to ${email}.`);
      setMode('REGISTER_OTP');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // 3. REGISTRATION STEP 2: Verify OTP and Create Account
  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    resetAllStates();
    setLoading(true);

    try {
      await verifyRegisterOtp({
        name: name.trim(),
        email: email.trim(),
        password,
        department,
        studentId: studentId.trim() || undefined,
        batch: batch.trim(),
        section: section.trim(),
        otp: otp.trim(),
      });
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please check your inbox or click Resend.');
    } finally {
      setLoading(false);
    }
  };

  // 4. FORGOT PASSWORD STEP 1: Send Reset OTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }
    resetAllStates();
    setLoading(true);

    try {
      const res = await sendForgotOtp(email.trim());
      setSuccessMsg(res.message || `Password reset code sent to ${email}.`);
      setMode('FORGOT_OTP');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'No account found with this email address.');
    } finally {
      setLoading(false);
    }
  };

  // 5. FORGOT PASSWORD STEP 2: Verify OTP and Reset
  const handleResetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    resetAllStates();
    setLoading(true);

    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setSuccessMsg('Password updated successfully! Please sign in with your new password.');
      setPassword(newPassword);
      setNewPassword('');
      setOtp('');
      setMode('LOGIN');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code or password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-5 sm:p-7 flex flex-col text-slate-100 scrollbar-thin my-auto">
        {/* Fixed Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-sky-400 font-semibold">City University</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400">CampusOS Portal</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'LOGIN' && 'Sign In to CampusOS'}
            {mode === 'REGISTER' && 'Create Student Account'}
            {mode === 'REGISTER_OTP' && 'Verify Email Address'}
            {mode === 'FORGOT_EMAIL' && 'Reset Your Password'}
            {mode === 'FORGOT_OTP' && 'Enter Verification Code'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'LOGIN' && 'Sign in with your email and password to access your campus portal.'}
            {mode === 'REGISTER' && 'Step 1 of 2: Fill in your university details to get your verification code.'}
            {mode === 'REGISTER_OTP' && `Step 2 of 2: Enter the 6-digit code sent to ${email}`}
            {mode === 'FORGOT_EMAIL' && 'Enter your registered email to receive a password reset code.'}
            {mode === 'FORGOT_OTP' && `Enter the verification code sent to ${email} and choose a new password.`}
          </p>
        </div>

        {/* Alerts & Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: SIGN IN FORM */}
        {/* ========================================================================= */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    resetAllStates();
                    setMode('FORGOT_EMAIL');
                  }}
                  className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="pt-3 text-center border-t border-slate-800 text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  resetAllStates();
                  setMode('REGISTER');
                }}
                className="text-sky-400 hover:underline font-semibold"
              >
                Create Account (OTP Verification)
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: REGISTRATION STEP 1 (Details Form) */}
        {/* ========================================================================= */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleSendRegisterOtp} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Md. Rezaul Karim"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="Electrical & Electronic Engineering">EEE</option>
                  <option value="Business Administration">BBA</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="Department of English">English</option>
                  <option value="Department of Law">Law</option>
                  <option value="Department of Pharmacy">Pharmacy</option>
                  <option value="Textile Engineering">Textile</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Student ID (Optional)</label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="213-15-XXXX"
                    className="w-full pl-8 pr-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Batch (e.g. 65)</label>
                <input
                  type="text"
                  required
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="65"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Section (e.g. B)</label>
                <input
                  type="text"
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="B"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Verification Code (OTP)'
                )}
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  resetAllStates();
                  setMode('LOGIN');
                }}
                className="text-sky-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: REGISTRATION STEP 2 (Enter OTP) */}
        {/* ========================================================================= */}
        {mode === 'REGISTER_OTP' && (
          <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-sky-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                Verification Code Sent
              </div>
              <div>
                We have dispatched a 6-digit OTP code to <strong className="text-white">{email}</strong>. Please check your inbox (or spam folder) and enter it below.
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-800 border-2 border-sky-500/50 text-white text-center text-lg font-mono tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify OTP & Complete Registration'
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  resetAllStates();
                  setMode('REGISTER');
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={loading || resendCooldown > 0}
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    await sendRegisterOtp({
                      name,
                      email,
                      password,
                      department,
                      batch,
                      section,
                    });
                    setSuccessMsg('A new 6-digit OTP has been sent to your email.');
                    setResendCooldown(60);
                  } catch (err: any) {
                    setError(err.message || 'Failed to resend code.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-sky-400 hover:text-sky-300 disabled:opacity-50 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: FORGOT PASSWORD STEP 1 */}
        {/* ========================================================================= */}
        {mode === 'FORGOT_EMAIL' && (
          <form onSubmit={handleSendForgotOtp} className="space-y-3.5">
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-300 leading-relaxed">
              Enter your registered email address. We will send a 6-digit verification code to reset your password.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Send Reset Code (OTP)'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                resetAllStates();
                setMode('LOGIN');
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mx-auto transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: FORGOT PASSWORD STEP 2 (Enter OTP & New Password) */}
        {/* ========================================================================= */}
        {mode === 'FORGOT_OTP' && (
          <form onSubmit={handleResetPasswordWithOtp} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-300">
              Enter the 6-digit OTP code sent to <strong className="text-white">{email}</strong> and your new password.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border-2 border-sky-500/50 text-white text-center font-mono text-base tracking-widest focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || !newPassword}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Verify & Reset Password'
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  resetAllStates();
                  setMode('FORGOT_EMAIL');
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={loading || resendCooldown > 0}
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    await sendForgotOtp(email);
                    setSuccessMsg('A new reset OTP has been sent to your email.');
                    setResendCooldown(60);
                  } catch (err: any) {
                    setError(err.message || 'Failed to resend code.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-sky-400 hover:text-sky-300 disabled:opacity-50 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

