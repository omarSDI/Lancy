/**
 * Lansy.ai — Landing Page
 * Marketing page with hero, features, pricing, and CTA.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, FileText, BarChart3, Zap, Globe, Shield,
  ChevronRight, Star, Users, CheckCircle, ArrowRight,
  Coins, GraduationCap, Crown, Package
} from 'lucide-react';

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: <Sparkles size={24} />,
      title: 'IA Avancée',
      desc: 'Google Gemini analyse votre offre et génère un CV parfaitement adapté.',
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Score ATS',
      desc: "Score de compatibilité ATS en temps réel avec les mots-clés de l'offre.",
    },
    {
      icon: <FileText size={24} />,
      title: '3 Templates',
      desc: 'Modern, Classic et Minimal — designs professionnels et ATS-friendly.',
    },
    {
      icon: <Zap size={24} />,
      title: '60 Secondes',
      desc: "De l'offre au PDF en moins d'une minute. Rapide et efficace.",
    },
    {
      icon: <Globe size={24} />,
      title: 'Multilingue',
      desc: 'Français, Anglais et Arabe. Adapté au marché tunisien et international.',
    },
    {
      icon: <Shield size={24} />,
      title: 'Sécurisé',
      desc: 'Vos données sont protégées. Aucune information partagée avec des tiers.',
    },
  ];

  const steps = [
    { num: '01', title: "Collez l'offre", desc: "Copiez-collez l'offre d'emploi qui vous intéresse." },
    { num: '02', title: 'Remplissez vos infos', desc: 'Ajoutez votre parcours, vos compétences et formations.' },
    { num: '03', title: 'IA génère votre CV', desc: "L'IA optimise et adapte votre CV à l'offre." },
    { num: '04', title: 'Téléchargez le PDF', desc: 'CV prêt à envoyer avec score ATS et conseils.' },
  ];

  const packages = [
    { id: 'starter', name: 'Starter', tokens: '10', price: '5', icon: <Package size={24} /> },
    { id: 'pro', name: 'Pro', tokens: '35', price: '15', icon: <Star size={24} />, popular: true },
    { id: 'premium', name: 'Premium', tokens: '∞', price: '35', icon: <Crown size={24} />, monthly: true },
    { id: 'student', name: 'Étudiant', tokens: '20', price: '8', icon: <GraduationCap size={24} />, discount: 20 },
  ];

  const testimonials = [
    {
      name: 'Amine B.',
      role: 'Ingénieur Logiciel',
      text: "Grâce à Lansy.ai, j'ai décroché un entretien chez une multinationale en Tunisie. Le score ATS m'a aidé à comprendre ce que les recruteurs cherchent.",
      score: 87,
    },
    {
      name: 'Fatma Z.',
      role: 'Chef de Projet Digital',
      text: "J'utilisais des templates génériques avant. Lansy.ai adapte chaque CV à l'offre spécifique. La différence est énorme !",
      score: 92,
    },
    {
      name: 'Mohamed K.',
      role: 'Data Scientist',
      text: "L'analyse de l'offre est incroyablement précise. Les mots-clés extraits sont exactement ceux que les ATS recherchent.",
      score: 85,
    },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* --- Navigation --- */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          padding: '16px 0',
          transition: 'all 0.3s ease',
        }}
        className="glass"
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Sparkles size={28} color="var(--primary)" />
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
              Lansy<span style={{ color: 'var(--primary)' }}>.ai</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/login" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
              Connexion
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Commencer Gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="gradient-hero" style={{ padding: '160px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.15)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(60px)' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(37, 99, 235, 0.3)', borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: 24 }}>
            <Sparkles size={14} color="#7CB9E8" />
            <span style={{ fontSize: 13, color: '#7CB9E8', fontWeight: 500 }}>Propulsé par Google Gemini AI</span>
          </div>

          <h1 className="animate-fade-in-up" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 20 }}>
            Votre CV, Adapté à Chaque Offre en{' '}
            <span style={{ background: 'linear-gradient(135deg, #7CB9E8, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              60 Secondes
            </span>
          </h1>

          <p className="animate-fade-in-up animate-delay-200" style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Collez une offre d&apos;emploi, remplissez votre profil, et l&apos;IA génère un CV professionnel optimisé ATS — prêt à impressionner les recruteurs tunisiens.
          </p>

          <div className="animate-fade-in-up animate-delay-300" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg animate-pulse-glow" style={{ textDecoration: 'none', fontSize: 16 }}>
              Essayer Gratuitement
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>
              Comment ça marche ?
            </a>
          </div>

          <div className="animate-fade-in-up animate-delay-400" style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Coins size={16} /> 3 tokens offerts
            </span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} /> Sans carte bancaire
            </span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} /> +2,000 utilisateurs
            </span>
          </div>
        </div>

        {/* ATS Score Preview */}
        <div className="animate-fade-in-up animate-delay-500" style={{ maxWidth: 380, margin: '60px auto 0', position: 'relative', zIndex: 1 }}>
          <div className="glass-dark" style={{ borderRadius: 'var(--radius-xl)', padding: 24, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Score ATS</span>
              <span style={{ color: '#10B981', fontWeight: 800, fontSize: 28 }}>87<span style={{ fontSize: 16, opacity: 0.6 }}>/100</span></span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', height: 8, marginBottom: 16 }}>
              <div style={{ background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: 'var(--radius-full)', height: 8, width: '87%', transition: 'width 2s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['React', 'Python', 'Docker', 'API REST', 'SQL'].map((kw) => (
                <span key={kw} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 500 }}>
                  ✅ {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- How It Works --- */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 className="section-title">Comment ça marche ?</h2>
          <p className="section-subtitle">4 étapes simples pour un CV parfait</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {steps.map((step, i) => (
            <div key={step.num} className="card animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both', textAlign: 'center', padding: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="section-title">Pourquoi Lansy.ai ?</h2>
            <p className="section-subtitle">Des fonctionnalités conçues pour le marché tunisien</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map((feat, i) => (
              <div key={feat.title} className="card card-interactive animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: 16 }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 className="section-title">Ils ont trouvé leur emploi</h2>
          <p className="section-subtitle">Témoignages de chercheurs d&apos;emploi tunisiens</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {testimonials.map((t, i) => (
            <div key={t.name} className="card animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.role}</div>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: 13 }}>
                  ATS {t.score}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Pricing --- */}
      <section id="pricing" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="section-title">Tarifs en Dinar Tunisien</h2>
            <p className="section-subtitle">Choisissez le forfait qui vous convient</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {packages.map((pkg, i) => (
              <div
                key={pkg.id}
                className="card card-interactive animate-fade-in-up"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'both',
                  textAlign: 'center',
                  padding: 28,
                  position: 'relative',
                  border: pkg.popular ? '2px solid var(--primary)' : undefined,
                }}
              >
                {pkg.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '4px 16px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} /> Populaire
                  </div>
                )}
                {pkg.discount && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', padding: '4px 16px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600 }}>
                    🎓 -{pkg.discount}%
                  </div>
                )}

                <div style={{ color: 'var(--primary)', marginBottom: 12 }}>{pkg.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{pkg.name}</h3>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                  {pkg.tokens} tokens
                </div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{pkg.price}</span>
                  <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 4 }}>DT{pkg.monthly ? '/mois' : ''}</span>
                </div>
                <Link href="/register" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
                  Choisir
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="gradient-hero" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 16 }}>
            Prêt à décrocher votre prochain emploi ?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 32, lineHeight: 1.6 }}>
            Rejoignez +2,000 chercheurs d&apos;emploi tunisiens qui utilisent Lansy.ai pour créer des CVs qui se démarquent.
          </p>
          <Link href="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Commencer Gratuitement — 3 Tokens Offerts
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer style={{ padding: '40px 24px', background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color="var(--primary)" />
            <span style={{ color: 'white', fontWeight: 700 }}>Lansy<span style={{ color: 'var(--primary)' }}>.ai</span></span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>Conditions d&apos;utilisation</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>Politique de confidentialité</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>Contact</Link>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            © 2024 Lansy.ai — Fait en 🇹🇳 Tunisie
          </div>
        </div>
      </footer>
    </div>
  );
}
