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
} from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

const AuthModal = () => {
  const { state, dispatch } = useStore();
  
  const [isLogin, setIsLogin]   = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });

  // Don't render anything if modal is closed
  if (!state.isAuthOpen) return null;

  // ── IF ALREADY LOGGED IN → SHOW PROFILE ────────────────────────────────────
  if (state.user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => dispatch({ type: 'TOGGLE_AUTH' })}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div
          className="relative w-full max-w-sm bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-3xl p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => dispatch({ type: 'TOGGLE_AUTH' })}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{state.user.name}</h2>
            <p className="text-white/50 text-sm">{state.user.email}</p>
            <span className="inline-flex items-center space-x-1 mt-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 text-pink-300 text-xs font-medium">
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
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-xl text-pink-300 hover:text-white hover:border-pink-400/50 transition-all"
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
        const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);

        // Set the display name in Firebase Auth
        // Format: "Name|role" so we can extract role later
        await updateProfile(credential.user, {
          displayName: `${form.name}|${form.role}`,
        });

        const user = {
          id:    credential.user.uid,
          email: credential.user.email,
          name:  form.name,
          role:  form.role,
        };

        // Save to localStorage
        localStorage.setItem('luxestore_user', JSON.stringify(user));

        // Save to global state
        dispatch({ type: 'SET_USER', user });
        toast.success(`Welcome, ${form.name}!`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => dispatch({ type: 'TOGGLE_AUTH' })}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-3xl p-8 shadow-2xl"
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
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-white/50 text-sm mt-1">
            {isLogin ? 'Sign in to your account' : 'Join LUXESTORE today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field — only for signup */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50 transition-all"
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
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50 transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-500/50 transition-all"
            />
          </div>

          {/* Role Selector — only for signup */}
          {!isLogin && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'client' })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  form.role === 'client'
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'admin' })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  form.role === 'admin'
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 rounded-xl text-white font-semibold hover:from-pink-600 hover:via-red-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Toggle between sign in / sign up */}
        <p className="text-center text-sm text-white/40 mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;