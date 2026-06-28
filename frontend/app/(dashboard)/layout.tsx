/**
 * Lansy.ai — Dashboard Layout
 * Sidebar navigation, top bar with token balance, and auth guard.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles, LayoutDashboard, FileText, History,
  Coins, UserCircle, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/auth';
import { signOut } from '@/lib/auth';
import { syncUser } from '@/lib/api';
import { useAuthStore, useTokenStore } from '@/lib/store';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/generate', label: 'Générer un CV', icon: FileText },
  { href: '/history', label: 'Historique', icon: History },
  { href: '/tokens', label: 'Tokens', icon: Coins },
  { href: '/profile', label: 'Profil', icon: UserCircle },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading: authLoading, setUser, setLoading: setAuthLoading } = useAuthStore();
  const { balance } = useTokenBalance();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setAuthLoading(false);
          router.push('/login');
          return;
        }

        const supaUser = session.user;
        try {
          const syncedUser = await syncUser({
            id: supaUser.id,
            email: supaUser.email!,
            full_name: supaUser.user_metadata?.full_name,
            avatar_url: supaUser.user_metadata?.avatar_url,
          });
          setUser(syncedUser); // setUser already sets isLoading=false
        } catch {
          // syncUser failed but session is valid — set user from Supabase data
          setUser({
            id: supaUser.id,
            email: supaUser.email!,
            full_name: supaUser.user_metadata?.full_name || null,
            avatar_url: supaUser.user_metadata?.avatar_url || null,
            created_at: '',
            updated_at: '',
          });
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setAuthLoading(false);
        router.push('/login');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, setUser, setAuthLoading]);

  const handleLogout = async () => {
    await signOut();
    useAuthStore.getState().logout();
    toast.success('Déconnexion réussie');
    router.push('/');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="animate-pulse-glow" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles size={32} color="var(--primary)" />
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* --- Sidebar --- */}
      <aside
        style={{
          width: 260,
          background: 'var(--bg-sidebar)',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : -260,
          bottom: 0,
          zIndex: 40,
          transition: 'left 0.3s ease',
        }}
        className="sidebar-desktop"
      >
        {/* Logo */}
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Sparkles size={24} color="#7CB9E8" />
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
              Lansy<span style={{ color: '#7CB9E8' }}>.ai</span>
            </span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius)',
                  marginBottom: 4,
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                  background: isActive ? 'rgba(37, 99, 235, 0.3)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={18} />
                {item.label}
                {item.href === '/tokens' && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(37, 99, 235, 0.5)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {balance}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div style={{ padding: '0 12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: 'rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'Utilisateur'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: 'var(--radius)', fontSize: 14, transition: 'all 0.2s ease' }}>
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }}
        />
      )}

      {/* --- Main Content --- */}
      <main style={{ flex: 1, marginLeft: 260, minHeight: '100vh' }} className="main-content">
        {/* Top bar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 20, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }} className="glass">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mobile-menu-btn"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Token balance */}
            <Link href="/tokens" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--primary-50)', padding: '6px 14px', borderRadius: 'var(--radius-full)', textDecoration: 'none', transition: 'all 0.2s ease' }}>
              <Coins size={16} color="var(--primary)" />
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{balance}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>tokens</span>
            </Link>
          </div>
        </header>

        <div style={{ padding: 24 }}>
          {children}
        </div>
      </main>

      {/* Responsive CSS via inline style tag */}
      <style>{`
        @media (min-width: 769px) {
          .sidebar-desktop { left: 0 !important; }
        }
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}
