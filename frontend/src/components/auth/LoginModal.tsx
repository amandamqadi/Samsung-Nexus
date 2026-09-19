import { useState } from 'react';
import { Briefcase, CheckCircle2, Eye, EyeOff, Handshake, IdCard, Loader2, Sparkles, Users, Zap } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import {
  validateConfirmPassword, validateEmail, validateFullName, validatePassword, validateSAID,
} from '../../utils/validation';

type Mode = 'signin' | 'signup';

const DEMO_PASSWORD = 'SamsungNexus2026!';

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, login, showToast } = useApp();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  function fillDemo(type: 'user' | 'admin') {
    setEmail(type === 'user' ? 'john.doe@alumni.samsung.com' : 'admin@nexus.samsung.com');
    setPassword(DEMO_PASSWORD);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      setEmail('');
      setPassword('');
    } catch {
      // error toast already shown by login()
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
  }

  return (
    <Modal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} maxWidth="max-w-3xl" noPadding>
      <div className="grid md:grid-cols-2">
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-samsung-blue via-[#0A1650] to-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-grid opacity-[0.15]" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, #2E8FFF 0%, transparent 45%), radial-gradient(circle at 80% 80%, #8B5CF6 0%, transparent 50%)',
          }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-glow font-semibold">
              <Zap size={14} /> Samsung Alumni
            </div>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center py-10">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-glow/20 blur-2xl" />
              <div className="absolute inset-0 rounded-full border border-white/15 border-dashed animate-[spin_50s_linear_infinite]" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-glow to-samsung-blue flex items-center justify-center shadow-[0_0_50px_-6px_rgba(0,229,255,0.6)] animate-float-slow">
                <Handshake size={30} className="text-white" />
              </div>
              <div className="absolute top-1 right-4 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Users size={14} className="text-cyan-glow" />
              </div>
              <div className="absolute bottom-2 left-1 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Briefcase size={14} className="text-nexus-emerald" />
              </div>
              <div className="absolute bottom-6 right-0 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={14} className="text-nexus-amber" />
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="font-display text-lg font-semibold leading-snug">"Where Hands Touch."</p>
            <p className="text-sm text-white/70 mt-1">Samsung Innovation Campus Alumni</p>
          </div>
        </div>

        <div className="p-8">
          {mode === 'signin' ? (
            <>
              <h2 className="text-2xl font-display font-bold text-primary">Welcome Back</h2>
              <p className="text-sm text-muted mt-1 mb-6">Access your Samsung Nexus account</p>

              <div className="flex gap-2 mb-6 text-xs">
                <button
                  type="button"
                  onClick={() => fillDemo('user')}
                  className="flex-1 py-1.5 rounded-lg border border-hairline text-muted hover:text-cyan-glow hover:border-cyan-glow/50 transition-colors"
                >
                  Fill demo alumni
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="flex-1 py-1.5 rounded-lg border border-hairline text-muted hover:text-cyan-glow hover:border-cyan-glow/50 transition-colors"
                >
                  Fill demo admin
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@alumni.samsung.com"
                    className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 pr-10 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="mt-1.5 text-xs text-samsung-blue hover:text-cyan-glow"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {submitting ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : 'Sign In'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-hairline border-t border-hairline" />
                <span className="text-xs text-faint">or</span>
                <div className="h-px flex-1 bg-hairline border-t border-hairline" />
              </div>

              <button
                type="button"
                onClick={() => showToast('Google sign-in is not configured for this project yet')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-hairline-strong text-sm font-medium text-primary hover:bg-card-alt transition-colors"
              >
                <GoogleIcon />
                Log in with your Google account
              </button>

              <p className="text-center text-xs text-muted mt-6">
                New here?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-samsung-blue hover:text-cyan-glow font-medium">
                  Create your Alumni Profile
                </button>
              </p>
            </>
          ) : (
            <CreateProfileForm onBackToSignIn={() => switchMode('signin')} />
          )}
        </div>
      </div>

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <h3 className="text-lg font-display font-semibold text-primary mb-2">Reset your password</h3>
        <p className="text-sm text-muted mb-4">Enter your alumni email and we'll send a reset link.</p>
        <input
          type="email"
          placeholder="you@alumni.samsung.com"
          className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue mb-4"
        />
        <button
          onClick={() => setForgotOpen(false)}
          className="w-full py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
        >
          Send reset link
        </button>
      </Modal>
    </Modal>
  );
}

interface ProfileFields {
  name: string;
  email: string;
  idNumber: string;
  password: string;
  confirmPassword: string;
}

type ProfileErrors = Partial<Record<keyof ProfileFields, string | null>>;

function validateAll(fields: ProfileFields): ProfileErrors {
  return {
    name: validateFullName(fields.name),
    email: validateEmail(fields.email),
    idNumber: validateSAID(fields.idNumber),
    password: validatePassword(fields.password),
    confirmPassword: validateConfirmPassword(fields.password, fields.confirmPassword),
  };
}

function CreateProfileForm({ onBackToSignIn }: { onBackToSignIn: () => void }) {
  const { signUp } = useApp();
  const [fields, setFields] = useState<ProfileFields>({ name: '', email: '', idNumber: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState<Partial<Record<keyof ProfileFields, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const errors = validateAll(fields);

  function setField<K extends keyof ProfileFields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function markTouched(key: keyof ProfileFields) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function shouldShowError(key: keyof ProfileFields) {
    return (touched[key] || submitted) && !!errors[key];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) return;
    setSubmitting(true);
    try {
      await signUp({ name: fields.name.trim(), email: fields.email.trim(), idNumber: fields.idNumber.trim(), password: fields.password });
    } catch {
      // error toast already shown by signUp()
    } finally {
      setSubmitting(false);
    }
  }

  const idValid = !errors.idNumber && fields.idNumber.length === 13;

  return (
    <>
      <h2 className="text-2xl font-display font-bold text-primary">Create Your Profile</h2>
      <p className="text-sm text-muted mt-1 mb-6">Join the Samsung Nexus alumni network</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Full Name" error={shouldShowError('name') ? errors.name : null}>
          <input
            value={fields.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => markTouched('name')}
            placeholder="Nomvula Ndlovu"
            className={inputClass(shouldShowError('name'))}
          />
        </Field>

        <Field label="Email" error={shouldShowError('email') ? errors.email : null}>
          <input
            type="email"
            value={fields.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={() => markTouched('email')}
            placeholder="you@alumni.samsung.com"
            className={inputClass(shouldShowError('email'))}
          />
        </Field>

        <Field
          label="South African ID Number"
          error={shouldShowError('idNumber') ? errors.idNumber : null}
          hint="13 digits — used to verify you're a genuine Samsung Innovation Campus graduate."
        >
          <div className="relative">
            <IdCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              inputMode="numeric"
              maxLength={13}
              value={fields.idNumber}
              onChange={(e) => setField('idNumber', e.target.value.replace(/\D/g, ''))}
              onBlur={() => markTouched('idNumber')}
              placeholder="e.g. 0102285009087"
              className={`${inputClass(shouldShowError('idNumber'))} pl-9 pr-9`}
            />
            {idValid && <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-emerald" />}
          </div>
        </Field>

        <Field label="Password" error={shouldShowError('password') ? errors.password : null}>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={fields.password}
              onChange={(e) => setField('password', e.target.value)}
              onBlur={() => markTouched('password')}
              placeholder="At least 8 characters"
              className={`${inputClass(shouldShowError('password'))} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Field label="Confirm Password" error={shouldShowError('confirmPassword') ? errors.confirmPassword : null}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={fields.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            onBlur={() => markTouched('confirmPassword')}
            placeholder="Re-enter your password"
            className={inputClass(shouldShowError('confirmPassword'))}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {submitting ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : 'Create Profile'}
        </button>
      </form>

      <p className="text-center text-xs text-muted mt-6">
        Already have an account?{' '}
        <button type="button" onClick={onBackToSignIn} className="text-samsung-blue hover:text-cyan-glow font-medium">
          Sign in
        </button>
      </p>
    </>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg bg-card-alt border px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 transition-colors ${
    hasError ? 'border-red-500/60 focus:ring-red-500/60' : 'border-hairline focus:ring-samsung-blue'
  }`;
}

function Field({ label, error, hint, children }: { label: string; error?: string | null; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.6 5.1C9.6 39.7 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.6 5.6C41.5 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}
