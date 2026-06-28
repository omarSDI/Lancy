/**
 * Lansy.ai — CV History Page
 */

'use client';

import { useEffect, useState } from 'react';
import { FileText, Clock, Download, Eye, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCVHistory, downloadCVPdf } from '@/lib/api';
import { getATSColor, formatDate } from '@/lib/utils';
import type { CVSessionListItem } from '@/types';
import InteractiveCVEditor from '@/components/InteractiveCVEditor';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<CVSessionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewSessionId, setPreviewSessionId] = useState<string | null>(null);
  const perPage = 10;

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCVHistory(page, perPage)
      .then((data) => {
        setSessions(data.items);
        setTotal(data.total);
      })
      .catch(() => setError('Impossible de charger l\'historique. Veuillez réessayer.'))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / perPage);

  const handleDownload = async (sessionId: string, jobTitle: string) => {
    try {
      await downloadCVPdf(sessionId, `lansy_cv_${jobTitle || 'cv'}.pdf`);
      toast.success('CV téléchargé !');
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Historique des CVs</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        {total} CV{total !== 1 ? 's' : ''} généré{total !== 1 ? 's' : ''}
      </p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Erreur de chargement</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
          <button className="btn btn-primary" onClick={() => setPage(1)}>Réessayer</button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun CV généré</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Commencez par générer votre premier CV optimisé
          </p>
          <a href="/generate" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Générer un CV
          </a>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.map((session, i) => (
              <div key={session.id} className="card card-interactive animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{session.job_title || 'CV sans titre'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {formatDate(session.created_at)}
                      </span>
                      {session.template_id && (
                        <span className="tag tag-primary" style={{ fontSize: 11 }}>{session.template_id}</span>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{session.language.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {session.ats_score !== null && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: getATSColor(session.ats_score) }}>
                        {session.ats_score}%
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Score ATS</div>
                    </div>
                  )}
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setPreviewSessionId(session.id)}
                  >
                    <Eye size={14} /> Aperçu
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleDownload(session.id, session.job_title || 'cv')}
                  >
                    <Download size={14} /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32 }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} /> Précédent
              </button>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Page {page} / {totalPages}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Interactive Editor Modal */}
      {previewSessionId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: 24, animation: 'fadeIn 0.2s ease' }}>
          <div className="card" style={{ width: '100%', maxWidth: 1000, height: '95vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
            <InteractiveCVEditor sessionId={previewSessionId} onClose={() => setPreviewSessionId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
