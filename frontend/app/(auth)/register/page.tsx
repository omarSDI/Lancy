/**
 * Lansy.ai — Register Page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Gift } from 'lucide-react';
import { supabase } from '@/lib/auth';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      // Call our backend (uses Supabase Admin API — no SMTP/email confirmation needed)
      const { data } = await api.post<{
        access_token: string;
        refresh_token: string;
        user_id: string;
        email: string;
        full_name: string | null;
      }>('/auth/register', {
        email,
        password,
        full_name: fullName,
      });

      // Set the session in Supabase client so auth state updates
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      toast.success('Compte créé ! 🎉 3 tokens offerts.');
      router.push('/dashboard');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(detail || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%)' }}>
      <div style={{ position: 'fixed', top: '15%', right: '15%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', filter: 'blur(80px)' }} />

      <div className="animate-scale-in glass" style={{ width: '100%', maxWidth: 440, borderRadius: 'var(--radius-xl)', padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 8 }}>
            <Sparkles size={28} color="var(--primary)" />
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
              Lansy<span style={{ color: 'var(--primary)' }}>.ai</span>
            </span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
            Créez votre compte gratuitement
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-full)', padding: '6px 14px', marginTop: 12, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
            <Gift size={14} />
            3 tokens offerts à l&apos;inscription
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="register-name">Nom complet</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="register-name"
                type="text"
                className="input"
                style={{ paddingLeft: 38 }}
                placeholder="Ahmed Ben Ali"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="register-email">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="register-email"
                type="email"
                className="input"
                style={{ paddingLeft: 38 }}
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="register-password">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                style={{ paddingLeft: 38, paddingRight: 38 }}
                placeholder="Minimum 6 caractères"
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

          <div style={{ marginBottom: 24 }}>
            <label className="label" htmlFor="register-confirm">Confirmer le mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="register-confirm"
                type="password"
                className="input"
                style={{ paddingLeft: 38 }}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Création...' : "Créer mon compte"}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
