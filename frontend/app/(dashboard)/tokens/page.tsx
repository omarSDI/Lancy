/**
 * Lansy.ai — Tokens Page
 * Buy tokens with Konnect payment + view transaction history.
 */

'use client';

import { useEffect, useState } from 'react';
import { Coins, Star, Crown, GraduationCap, Package, ArrowUpRight, ArrowDownLeft, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { purchaseTokens, getTokenHistory } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { TokenTransaction } from '@/types';

const PACKAGES = [
  { id: 'starter', name: 'Starter', tokens: 10, price: 5, icon: Package, description: '10 générations de CV' },
  { id: 'pro', name: 'Pro', tokens: 35, price: 15, icon: Star, popular: true, description: '35 générations de CV' },
  { id: 'premium', name: 'Premium', tokens: '∞', price: 35, icon: Crown, monthly: true, description: 'Générations illimitées' },
  { id: 'student', name: 'Étudiant', tokens: 20, price: 8, icon: GraduationCap, discount: 20, description: '20 générations · -20%' },
];

export default function TokensPage() {
  const { balance, lifetimeUsed, refetch } = useTokenBalance();
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    getTokenHistory(1, 20)
      .then((data) => setTransactions(data.items))
      .catch(() => {});
  }, []);

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      const result = await purchaseTokens(packageId);
      // Redirect to Konnect payment page
      window.location.href = result.payment_url;
    } catch {
      toast.error("Erreur lors de l'initiation du paiement");
      setPurchasing(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Tokens</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        Gérez vos tokens et achetez des packs
      </p>

      {/* Balance Card */}
      <div className="card gradient-card" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Solde actuel</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--primary)' }}>{balance}</span>
            <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>tokens</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total utilisés</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)' }}>{lifetimeUsed}</div>
        </div>
      </div>

      {/* Packages */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Acheter des tokens</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
        {PACKAGES.map((pkg, i) => {
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.id}
              className="card card-interactive animate-fade-in-up"
              style={{
                animationDelay: `${i * 80}ms`, animationFillMode: 'both',
                textAlign: 'center', padding: 28, position: 'relative',
                border: pkg.popular ? '2px solid var(--primary)' : undefined,
              }}
            >
              {pkg.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '4px 16px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  <Star size={12} /> Populaire
                </div>
              )}
              {pkg.discount && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', padding: '4px 16px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  🎓 -{pkg.discount}%
                </div>
              )}

              <Icon size={28} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{pkg.name}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{pkg.description}</div>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 800 }}>{pkg.price}</span>
                <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 4 }}>DT{pkg.monthly ? '/mois' : ''}</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={purchasing === pkg.id}
                onClick={() => handlePurchase(pkg.id)}
              >
                {purchasing === pkg.id ? 'Redirection...' : 'Acheter'}
                <ExternalLink size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Transaction History */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Historique des transactions</h2>
      {transactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <Clock size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Aucune transaction pour le moment</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {transactions.map((tx, i) => (
            <div key={tx.id} className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-full)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: tx.amount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                }}>
                  {tx.amount > 0 ? <ArrowDownLeft size={16} color="var(--accent)" /> : <ArrowUpRight size={16} color="var(--danger)" />}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.description || tx.type}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(tx.created_at)}</div>
                </div>
              </div>
              <span style={{
                fontWeight: 700, fontSize: 15,
                color: tx.amount > 0 ? 'var(--accent)' : 'var(--danger)',
              }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
