/**
 * Lansy.ai — Login Page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn, signInWithProvider } from '@/lib/auth';
import { syncUser } from '@/lib/api';
import { supabase } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await signIn(email, password);
      if (user) {
        await syncUser({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
        });
        toast.success('Connexion réussie !');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      await signInWithProvider(provider);
    } catch (err: any) {
      toast.error(err?.message || "Erreur d'authentification");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%)' }}>
      {/* Background shapes */}
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', filter: 'blur(100px)' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', filter: 'blur(80px)' }} />

      <div className="animate-scale-in glass" style={{ width: '100%', maxWidth: 440, borderRadius: 'var(--radius-xl)', padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 8 }}>
            <Image src="/logo.png" alt="Lansy.ai Logo" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
              Lansy<span style={{ color: 'var(--primary)' }}>.ai</span>
            </span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
            Connectez-vous à votre compte
          </p>
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <button onClick={() => handleOAuth('google')} className="btn btn-outline" style={{ width: '100%', fontSize: 14, padding: '12px', justifyContent: 'center' }} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
          <button onClick={() => handleOAuth('github')} className="btn btn-outline" style={{ width: '100%', fontSize: 14, padding: '12px', justifyContent: 'center' }} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            Continuer avec GitHub
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ou par email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="login-email">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="login-email"
                type="email"
                className="input"
                style={{ paddingLeft: 38 }}
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="label" htmlFor="login-password">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                style={{ paddingLeft: 38, paddingRight: 38 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
