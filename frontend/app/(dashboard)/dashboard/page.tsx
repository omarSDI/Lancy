/**
 * Lansy.ai — Dashboard Page
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, TrendingUp, Coins, ArrowRight, BarChart3, Clock } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { getCVHistory } from '@/lib/api';
import { getATSColor, formatRelativeTime } from '@/lib/utils';
import type { CVSessionListItem } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { balance } = useTokenBalance();
  const [recentCVs, setRecentCVs] = useState<CVSessionListItem[]>([]);
  const [totalCVs, setTotalCVs] = useState(0);

  useEffect(() => {
    getCVHistory(1, 5)
      .then((data) => {
        setRecentCVs(data.items);
        setTotalCVs(data.total);
      })
      .catch(() => {});
  }, []);

  const avgScore = recentCVs.length > 0
    ? Math.round(recentCVs.reduce((sum, cv) => sum + (cv.ats_score || 0), 0) / recentCVs.length)
    : 0;

  const stats = [
    { label: 'CVs Générés', value: totalCVs, icon: FileText, color: 'var(--primary)' },
    { label: 'Score ATS Moyen', value: `${avgScore}%`, icon: TrendingUp, color: 'var(--accent)' },
    { label: 'Tokens Restants', value: balance, icon: Coins, color: '#F59E0B' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Bonjour, {user?.full_name?.split(' ')[0] || 'Utilisateur'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Bienvenue sur votre tableau de bord Lansy.ai
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-lg)', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action */}
      <div className="card gradient-card animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Générer un nouveau CV</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Collez une offre d&apos;emploi et obtenez un CV adapté en 60 secondes
          </p>
        </div>
        <Link href="/generate" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Commencer <ArrowRight size={16} />
        </Link>
      </div>

      {/* Recent CVs */}
      <div className="animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>CVs Récents</h2>
          {totalCVs > 0 && (
            <Link href="/history" style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Voir tout <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {recentCVs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 16 }}>
              Vous n&apos;avez pas encore généré de CV
            </p>
            <Link href="/generate" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Créer mon premier CV
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentCVs.map((cv) => (
              <Link key={cv.id} href={`/history`} className="card card-interactive" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                      {cv.job_title || 'CV sans titre'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {formatRelativeTime(cv.created_at)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {cv.ats_score !== null && (
                    <span style={{ fontWeight: 700, fontSize: 14, color: getATSColor(cv.ats_score) }}>
                      {cv.ats_score}%
                    </span>
                  )}
                  <ArrowRight size={16} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
