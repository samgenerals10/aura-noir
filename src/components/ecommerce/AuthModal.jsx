/**
 * AuthModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles user authentication using Firebase Auth.
 * 
 * KEY FIXES:
 * 1. Uses Firebase Auth instead of fake simulation
 * 2. Saves user to localStorage so they stay logged in after refresh
 * 3. Admin panel button is always visible — clicking it prompts login if needed
 *
 * CONNECTIONS:
 *   → src/firebase/firebase.js  (Firebase Auth instance)
 *   → src/store/useStore.js     (state.user, dispatch)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { X, Mail, Lock, User, Shield, LogOut, Loader2 } from 'lucide-react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { validateInviteToken, markInviteUsed } from '@/lib/staff_invites';
import { getApproximateLocation } from '@/lib/location';

const AuthModal = () => {
  const { state, dispatch } = useStore();
  
  const [isLogin, setIsLogin]   = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  
  // Detection for invitation token from URL
  // Usage: ?invite=TOKEN
  const searchParams = new URLSearchParams(window.location.search);
  const inviteToken = searchParams.get('invite');

  // Don't render anything if modal is closed
  if (!state.isAuthOpen) return null;

  // ── IF ALREADY LOGGED IN → SHOW PROFILE ────────────────────────────────────
  if (state.user) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" onClick={() => dispatch({ type: 'TOGGLE_AUTH' })}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div
          className="relative w-full max-w-sm bg-black border border-white/10 rounded-3xl p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => dispatch({ type: 'TOGGLE_AUTH' })}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-sm bg-black border border-gold flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{state.user.name}</h2>
            <p className="text-white/50 text-sm">{state.user.email}</p>
            <span className="inline-flex items-center space-x-1 mt-2 px-3 py-1 rounded-full bg-black border border-gold text-gold text-xs font-medium">
              <Shield className="w-3 h-3" />
              <span className="capitalize">{state.user.role}</span>
            </span>
          </div>

          <div className="space-y-3">
            {/* Admin panel button — only shows if user is actually an admin */}
            {state.user.role === 'admin' && (
              <button
                onClick={() => {
                  dispatch({ type: 'SET_VIEW', view: 'admin' });
                  dispatch({ type: 'TOGGLE_AUTH' });
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-black border border-gold rounded-xl text-gold hover:text-white hover:border-gold/80 transition-all"
              >
                <Shield className="w-4 h-4" />
                <span>Go to Admin Panel</span>
              </button>
            )}

            {/* Sign out button */}
            <button
              onClick={async () => {
                try {
                  await firebaseSignOut(auth); // sign out of Firebase
                  localStorage.removeItem('luxestore_user'); // clear from localStorage
                  dispatch({ type: 'SET_USER', user: null }); // clear from state
                  dispatch({ type: 'SET_VIEW', view: 'shop' }); // go back to shop view
                  toast.success('Logged out successfully');
                } catch (err) {
                  console.error('Sign out error:', err);
                  toast.error('Failed to sign out');
                }
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SIGN IN / SIGN UP FORM ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!isLogin && !form.name) {
      toast.error('Please enter your name');
      return;
    }
    if (!isLogin && form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // ── SIGN IN ──
        const credential = await signInWithEmailAndPassword(auth, form.email, form.password);
        
        // Build user object — role stored in Firebase displayName
        // Format: "Name|role" e.g. "Sam|admin" or "John|client"
        const displayName = credential.user.displayName || form.email.split('@')[0];
        const [name, role = 'client'] = displayName.split('|');

        const user = {
          id:    credential.user.uid,
          email: credential.user.email,
          name:  name,
          role:  role,
        };

        // Save to localStorage so it persists across page refreshes
        localStorage.setItem('luxestore_user', JSON.stringify(user));

        // Save to global state
        dispatch({ type: 'SET_USER', user });
        toast.success(`Welcome back, ${name}!`);

      } else {
        // ── SIGN UP ──
        let finalRole = 'client';
        let inviteData = null;

        // If an invite token is present, validate it
        if (inviteToken) {
          try {
            inviteData = await validateInviteToken(inviteToken);
            finalRole = 'admin';
          } catch {
            toast.error('Invalid or expired invitation. Signing up as client.');
            // Continue as client
          }
        }

        const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);

        // Set the display name in Firebase Auth
        // Format: "Name|role" so we can extract role later
        await updateProfile(credential.user, {
          displayName: `${form.name}|${finalRole}`,
        });

        // Mark invite as used if successful
        if (inviteData) {
          const usedLocation = await getApproximateLocation();
          await markInviteUsed(inviteData.id, credential.user.uid, form.email, usedLocation);
          // Clear URL param after use (subtle cleanup)
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const user = {
          id:    credential.user.uid,
          email: credential.user.email,
          name:  form.name,
          role:  finalRole,
        };

        // Save to localStorage
        localStorage.setItem('luxestore_user', JSON.stringify(user));

        // Save to global state
        dispatch({ type: 'SET_USER', user });
        toast.success(`Welcome, ${form.name}${finalRole === 'admin' ? ' (Admin)' : ''}!`);
      }

      // Reset form
      setForm({ name: '', email: '', password: '', role: 'client' });

    } catch (err) {
      console.error('Auth error:', err);
      
      // Firebase error messages are quite technical — translate them for users
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with that email');
      } else if (err.code === 'auth/wrong-password') {
        toast.error('Incorrect password');
      } else if (err.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists');
      } else if (err.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters');
      } else {
        toast.error(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // ── FORGOT PASSWORD ────────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, form.email);
      toast.success('Password reset email sent! Check your inbox.');
      setIsForgotPassword(false);
      setIsLogin(true);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else if (err.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else {
        toast.error(err.message || 'Failed to send reset email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => dispatch({ type: 'TOGGLE_AUTH' })}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-black border border-white/10 rounded-3xl p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch({ type: 'TOGGLE_AUTH' })}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-sm bg-black border border-gold flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {isForgotPassword 
              ? 'Enter your email to receive a reset link' 
              : isLogin ? 'Sign in to your account' : (inviteToken ? 'Join the Staff Team' : 'Join LUXESTORE today')}
          </p>
          {inviteToken && !isLogin && !isForgotPassword && (
            <div className="mt-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full inline-block">
              <span className="text-[10px] text-gold font-bold uppercase tracking-wider">Staff Invitation Detected</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
          {/* Name field — only for signup */}
          {!isLogin && !isForgotPassword && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-gold/50 transition-all"
            />
          </div>

          {/* Password — hidden for forgot password */}
          {!isForgotPassword && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-gold/50 transition-all"
              />
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gold hover:text-gold/80 transition-colors uppercase tracking-widest font-bold"
                >
                  Forgot?
                </button>
              )}
            </div>
          )}

          {/* Role Selector — REMOVED PUBLIC ACCESS (Default to client) */}
          {/* Admin role can only be obtained via invitation token */}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-black rounded-xl text-white font-semibold hover:bg-black/90 transition-all border border-gold/30 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isForgotPassword ? 'Sending...' : isLogin ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Toggle between views */}
        <div className="text-center text-sm text-white/40 mt-6">
          {isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-gold hover:text-gold/80 font-medium transition-colors"
            >
              Back to Login
            </button>
          ) : (
            <>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsForgotPassword(false);
                }}
                className="text-gold hover:text-gold/80 font-medium transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;