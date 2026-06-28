'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function ErrorModal({ isOpen, title = "Erreur", message, onClose }: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <style>{`
        @keyframes modalScale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(239, 68, 68, 0.1)',
        width: '90%',
        maxWidth: '480px',
        padding: '24px',
        position: 'relative',
        animation: 'modalScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid var(--border)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger)',
              padding: '8px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
        }}>
          {message}
        </p>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--danger)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-light)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--danger)'}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
