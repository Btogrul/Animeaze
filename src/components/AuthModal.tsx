import React, { useState, useEffect } from 'react';
import { X, UserCheck, LogIn, UserPlus, Sparkles, AlertCircle, Shield, Check, Globe } from 'lucide-react';
import { User } from '../types';
import { Language, translations } from '../lib/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialReason?: string;
  initialTab?: 'signin' | 'signup';
  currentLang?: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialReason,
  initialTab = 'signin',
  currentLang = 'az'
}) => {
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  // Sign In state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up state
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  // Google Sim Modal / State
  const [showGoogleSim, setShowGoogleSim] = useState(false);

  // Messages & Loading
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMsg('');
    setSuccessMsg('');
    setRegConfirmPassword('');
  }, [initialTab, isOpen]);

  // Username uniqueness live checker
  useEffect(() => {
    if (!regUsername || regUsername.trim().length < 3) {
      setUsernameStatus({ checking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true });
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(regUsername.trim())}`);
        const data = await res.json();
        setUsernameStatus({
          checking: false,
          available: data.available,
          message: data.message
        });
      } catch (e) {
        setUsernameStatus({ checking: false });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [regUsername]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setErrorMsg('E-poçt və ya istifadəçi adını daxil edin.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: loginInput,
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Giriş zamanı xəta baş verdi.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Uğurla daxil oldunuz!');
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg('Serverlə əlaqə kəsildi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim() || !regUsername.trim()) {
      setErrorMsg('E-poçt və Nickname daxil edilməlidir.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg(t.minPasswordLength);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg(t.passwordsDoNotMatch);
      return;
    }

    if (usernameStatus.available === false) {
      setErrorMsg('Bu ləqəb (nick) artıq götürülüb. Fərqli bir nick seçin.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          username: regUsername,
          password: regPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Qeydiyyat zamanı xəta baş verdi.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Qeydiyyat uğurla tamamlandı!');
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg('Serverlə əlaqə kəsildi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (emailToUse: string, nameToUse: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          name: nameToUse,
          picture: emailToUse === 'baghirli.togrul@gmail.com' 
            ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Google ilə giriş xətası.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Google hesabı ilə daxil olundu!');
      setTimeout(() => {
        onLoginSuccess(data.user);
        setShowGoogleSim(false);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg('Serverlə əlaqə kəsildi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AnimeAze Profil Girişi</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {activeTab === 'signin' ? 'Hesaba Daxil Ol' : 'Yeni Hesab Yarat'}
          </h2>
          {initialReason && (
            <p className="text-xs text-amber-300 font-semibold bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              💡 {initialReason}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-2xl border border-amber-500/20">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'signin'
                ? 'bg-amber-500 text-slate-950 gold-glow shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{t.signIn}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'signup'
                ? 'bg-amber-500 text-slate-950 gold-glow shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.signUp}</span>
          </button>
        </div>

        {/* Google Login Fast Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowGoogleSim(true)}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center space-x-3 transition-all cursor-pointer shadow-md hover:shadow-lg border border-slate-200"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.32a7.17 7.17 0 0 1 0-4.64V6.59H1.29a11.96 11.96 0 0 0 0 10.82l3.99-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.09c.95-2.83 3.6-4.93 6.72-4.93z" />
            </svg>
            <span>{t.signInWithGoogle}</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="absolute px-3 bg-slate-950 text-[10px] font-bold text-slate-500 uppercase">
            {t.emailAddress} / {t.usernameLabel}
          </span>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-300">{t.emailAddress} / {t.usernameLabel}</label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="naruto@uzumaki.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-300">{t.passwordLabel}</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs gold-glow transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? '...' : t.signIn}
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-300">{t.emailAddress}</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="naruto@uzumaki.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-all"
              />
            </div>

            {/* Unique Username Input with Live Verification */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-300">
                  {t.usernameLabel}
                </label>
                {usernameStatus.checking && (
                  <span className="text-[10px] text-amber-400 font-bold animate-pulse">...</span>
                )}
              </div>

              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="məs: Naruto_Uzumaki"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-white text-xs outline-none transition-all ${
                  usernameStatus.available === true
                    ? 'border-emerald-500 focus:border-emerald-400'
                    : usernameStatus.available === false
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-800 focus:border-amber-400'
                }`}
              />

              {/* Username Availability Feedback */}
              {regUsername.trim().length >= 3 && usernameStatus.message && (
                <p className={`text-[11px] font-bold ${usernameStatus.available ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {usernameStatus.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-300">{t.passwordLabel}</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-all"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-300">{t.confirmPasswordLabel}</label>
              </div>
              <input
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-white text-xs outline-none transition-all ${
                  regConfirmPassword && regPassword !== regConfirmPassword
                    ? 'border-rose-500 focus:border-rose-400'
                    : regConfirmPassword && regPassword === regConfirmPassword && regPassword.length >= 6
                    ? 'border-emerald-500 focus:border-emerald-400'
                    : 'border-slate-800 focus:border-amber-400'
                }`}
              />

              {/* Password Match / Mismatch Feedback Notification */}
              {regConfirmPassword && regPassword !== regConfirmPassword && (
                <p className="text-[11px] font-bold text-rose-400 flex items-center space-x-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.passwordsDoNotMatch}</span>
                </p>
              )}

              {regConfirmPassword && regPassword === regConfirmPassword && regPassword.length >= 6 && (
                <p className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1 mt-1 font-semibold">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.passwordsMatch}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || usernameStatus.available === false || (!!regConfirmPassword && regPassword !== regConfirmPassword)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs gold-glow transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? '...' : t.signUp}
            </button>
          </form>
        )}

      </div>

      {/* Google Account Selector Dialog */}
      {showGoogleSim && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-card rounded-3xl p-6 border border-amber-500/40 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.32a7.17 7.17 0 0 1 0-4.64V6.59H1.29a11.96 11.96 0 0 0 0 10.82l3.99-3.09z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.09c.95-2.83 3.6-4.93 6.72-4.93z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-white">Google İlə Daxil Olun</h3>
            <p className="text-xs text-slate-300">Hesab seçin və ya e-poçt ünvanınızı daxil edin:</p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleGoogleLogin('baghirli.togrul@gmail.com', 'Togrul Baghirli')}
                className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 flex items-center space-x-3 transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  TB
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white flex items-center space-x-1">
                    <span>Togrul Baghirli</span>
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded border border-amber-500/30 font-black">Admin</span>
                  </p>
                  <p className="text-[10px] text-slate-400">baghirli.togrul@gmail.com</p>
                </div>
              </button>

              <button
                onClick={() => handleGoogleLogin('naruto@uzumaki.com', 'Naruto Uzumaki')}
                className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center space-x-3 transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-black flex items-center justify-center text-xs">
                  NU
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">Naruto Uzumaki</p>
                  <p className="text-[10px] text-slate-400">naruto@uzumaki.com</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowGoogleSim(false)}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Ləğv et
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
