/**
 * Lansy.ai — CV Generator Page (4-Step Wizard)
 */

'use client';

import { useState } from 'react';
import {
  FileSearch, User, Palette, Rocket, ChevronLeft, ChevronRight,
  CheckCircle, Loader2, AlertCircle, Sparkles, Download, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCVGenerator } from '@/hooks/useCVGenerator';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { downloadCVPdf } from '@/lib/api';
import { getATSColor, getATSLabel } from '@/lib/utils';
import { ErrorModal } from '@/components/ErrorModal';
import InteractiveCVEditor from '@/components/InteractiveCVEditor';
import type { WizardStep, TemplateId, CVLanguage } from '@/types';

const STEPS = [
  { num: 1 as WizardStep, label: "Offre d'emploi", icon: FileSearch },
  { num: 2 as WizardStep, label: 'Vos Informations', icon: User },
  { num: 3 as WizardStep, label: 'Template & Langue', icon: Palette },
  { num: 4 as WizardStep, label: 'Génération', icon: Rocket },
];

export default function GeneratePage() {
  const gen = useCVGenerator();
  const { balance } = useTokenBalance();
  const [previewOpen, setPreviewOpen] = useState(false);

  const canProceed = () => {
    switch (gen.currentStep) {
      case 1: return gen.offerText.length >= 50 && gen.offerAnalysis !== null;
      case 2: return gen.personalInfo.name && gen.personalInfo.email;
      case 3: return true;
      default: return false;
    }
  };

  const handleDownload = async () => {
    if (!gen.sessionId) return;
    try {
      await downloadCVPdf(gen.sessionId, 'lansy_cv.pdf');
      toast.success('CV téléchargé !');
    } catch {
      gen.setError('Erreur lors du téléchargement.');
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Générer un CV</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        4 étapes pour un CV optimisé ATS
      </p>

      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = gen.currentStep === step.num;
          const isDone = gen.currentStep > step.num || gen.generationStatus === 'complete';
          return (
            <div key={step.num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDone ? 'var(--accent)' : isActive ? 'var(--primary)' : 'var(--border)',
                color: isDone || isActive ? 'white' : 'var(--text-muted)',
                transition: 'all 0.3s ease',
              }}>
                {isDone ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span style={{ fontSize: 12, color: isActive ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isActive ? 600 : 400, textAlign: 'center' }}>
                {step.label}
              </span>
              <div style={{ width: '100%', height: 3, borderRadius: 2, background: isDone ? 'var(--accent)' : isActive ? 'var(--primary)' : 'var(--border)', transition: 'all 0.3s ease' }} />
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        {/* Step 1: Offer */}
        {gen.currentStep === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Collez votre offre d&apos;emploi</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Copiez le texte complet de l&apos;offre d&apos;emploi qui vous intéresse
            </p>
            <textarea
              className="input"
              style={{ minHeight: 200, fontSize: 14, lineHeight: 1.6 }}
              placeholder="Collez ici le texte complet de l'offre d'emploi..."
              value={gen.offerText}
              onChange={(e) => gen.setOfferText(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 13, color: gen.offerText.length >= 50 ? 'var(--accent)' : 'var(--text-muted)' }}>
                {gen.offerText.length} caractères {gen.offerText.length < 50 && '(minimum 50)'}
              </span>
              <button
                className="btn btn-primary"
                disabled={gen.offerText.length < 50 || gen.generationStatus === 'analyzing'}
                onClick={gen.analyzeOffer}
              >
                {gen.generationStatus === 'analyzing' ? (
                  <><Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Analyse en cours...</>
                ) : (
                  <><FileSearch size={16} /> Analyser l&apos;offre</>
                )}
              </button>
            </div>

            {/* Analysis Results */}
            {gen.offerAnalysis && (
              <div className="animate-fade-in-up" style={{ marginTop: 24, padding: 20, background: 'var(--primary-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary-100)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={18} color="var(--accent)" />
                  {gen.offerAnalysis.job_title}
                </h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {gen.offerAnalysis.ats_keywords.map((kw) => (
                    <span key={kw} className="tag tag-primary">{kw}</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Niveau: <strong>{gen.offerAnalysis.experience_level}</strong> · Secteur: <strong>{gen.offerAnalysis.sector}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: User Info */}
        {gen.currentStep === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Vos Informations</h2>

            {/* Personal Info Section */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Informations Personnelles</h3>
              
              {/* Photo Upload */}
              <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {gen.personalInfo.photo_url ? (
                    <img src={gen.personalInfo.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 24, color: 'var(--text-muted)' }}>📸</span>
                  )}
                </div>
                <div>
                  <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
                    Changer la photo
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) return toast.error("Max 2MB");
                        const reader = new FileReader();
                        reader.onloadend = () => gen.setPersonalInfo({ ...gen.personalInfo, photo_url: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {[
                  { key: 'name', label: 'Nom complet *', placeholder: 'Ahmed Ben Ali' },
                  { key: 'email', label: 'Email *', placeholder: 'ahmed@email.com', type: 'email' },
                  { key: 'phone', label: 'Téléphone', placeholder: '+216 XX XXX XXX' },
                  { key: 'address', label: 'Adresse', placeholder: 'Tunis, Tunisie' },
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/votre-profil' },
                  { key: 'github', label: 'GitHub', placeholder: 'github.com/votre-profil' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="label">{field.label}</label>
                    <input
                      className="input"
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={(gen.personalInfo as any)[field.key] || ''}
                      onChange={(e) => gen.setPersonalInfo({ ...gen.personalInfo, [field.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ marginTop: 16 }}>
                <label className="label">Résumé Professionnel (Objectif, accroche)</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Je suis un ingénieur logiciel passionné..."
                  value={gen.personalInfo.summary || ''}
                  onChange={(e) => gen.setPersonalInfo({ ...gen.personalInfo, summary: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  💡 Notre IA améliorera automatiquement ce résumé et y injectera les mots-clés de l'offre pour garantir un score ATS élevé.
                </p>
              </div>
            </div>

            {/* Education Section */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Formations</h3>
              <div>
                {gen.education.map((edu, i) => (
                  <div key={i} className="card" style={{ marginBottom: 12, padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label className="label">Établissement</label>
                        <input className="input" placeholder="INSAT, ENIT..." value={edu.institution} onChange={(e) => { const updated = [...gen.education]; updated[i] = { ...edu, institution: e.target.value }; gen.setEducation(updated); }} />
                      </div>
                      <div>
                        <label className="label">Diplôme</label>
                        <input className="input" placeholder="Ingénieur, Master..." value={edu.degree} onChange={(e) => { const updated = [...gen.education]; updated[i] = { ...edu, degree: e.target.value }; gen.setEducation(updated); }} />
                      </div>
                      <div>
                        <label className="label">Domaine</label>
                        <input className="input" placeholder="Informatique..." value={edu.field} onChange={(e) => { const updated = [...gen.education]; updated[i] = { ...edu, field: e.target.value }; gen.setEducation(updated); }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}><label className="label">Début</label><input className="input" placeholder="2020" value={edu.start_date} onChange={(e) => { const updated = [...gen.education]; updated[i] = { ...edu, start_date: e.target.value }; gen.setEducation(updated); }} /></div>
                        <div style={{ flex: 1 }}><label className="label">Fin</label><input className="input" placeholder="2024" value={edu.end_date} onChange={(e) => { const updated = [...gen.education]; updated[i] = { ...edu, end_date: e.target.value }; gen.setEducation(updated); }} /></div>
                      </div>
                    </div>
                    <button onClick={() => gen.setEducation(gen.education.filter((_, j) => j !== i))} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }}>
                      Supprimer
                    </button>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => gen.setEducation([...gen.education, { institution: '', degree: '', field: '', start_date: '', end_date: '' }])}>
                  + Ajouter une formation
                </button>
              </div>
            </div>

            {/* Experience Section */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Expériences Professionnelles</h3>
              <div>
                {gen.experience.map((exp, i) => (
                  <div key={i} className="card" style={{ marginBottom: 12, padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><label className="label">Entreprise</label><input className="input" placeholder="Société..." value={exp.company} onChange={(e) => { const updated = [...gen.experience]; updated[i] = { ...exp, company: e.target.value }; gen.setExperience(updated); }} /></div>
                      <div><label className="label">Poste</label><input className="input" placeholder="Développeur..." value={exp.title} onChange={(e) => { const updated = [...gen.experience]; updated[i] = { ...exp, title: e.target.value }; gen.setExperience(updated); }} /></div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}><label className="label">Début</label><input className="input" placeholder="Jan 2022" value={exp.start_date} onChange={(e) => { const updated = [...gen.experience]; updated[i] = { ...exp, start_date: e.target.value }; gen.setExperience(updated); }} /></div>
                        <div style={{ flex: 1 }}><label className="label">Fin</label><input className="input" placeholder="Présent" value={exp.end_date} onChange={(e) => { const updated = [...gen.experience]; updated[i] = { ...exp, end_date: e.target.value }; gen.setExperience(updated); }} /></div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label className="label">Réalisations (une par ligne)</label>
                      <textarea
                        className="input"
                        style={{ minHeight: 80 }}
                        placeholder="Développé une API REST avec FastAPI&#10;Réduit le temps de chargement de 40%"
                        value={exp.bullet_points.join('\n')}
                        onChange={(e) => { const updated = [...gen.experience]; updated[i] = { ...exp, bullet_points: e.target.value.split('\n').filter(Boolean) }; gen.setExperience(updated); }}
                      />
                    </div>
                    <button onClick={() => gen.setExperience(gen.experience.filter((_, j) => j !== i))} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }}>
                      Supprimer
                    </button>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => gen.setExperience([...gen.experience, { company: '', title: '', start_date: '', end_date: '', bullet_points: [] }])}>
                  + Ajouter une expérience
                </button>
              </div>
            </div>

            {/* Skills Section */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Compétences et Langues</h3>
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label className="label">Compétences techniques (séparées par des virgules)</label>
                  <input
                    className="input"
                    placeholder="React, Python, Docker, SQL..."
                    value={gen.skills.technical.join(', ')}
                    onChange={(e) => gen.setSkills({ ...gen.skills, technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  />
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {gen.skills.technical.map((s) => (
                      <span key={s} className="tag tag-primary">{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="label">Langues</label>
                  {gen.languages.map((lang, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input className="input" style={{ flex: 1 }} placeholder="Français" value={lang.language} onChange={(e) => { const updated = [...gen.languages]; updated[i] = { ...lang, language: e.target.value }; gen.setLanguages(updated); }} />
                      <select className="input" style={{ width: 160 }} value={lang.level} onChange={(e) => { const updated = [...gen.languages]; updated[i] = { ...lang, level: e.target.value }; gen.setLanguages(updated); }}>
                        <option value="">Niveau</option>
                        <option value="Natif">Natif</option>
                        <option value="Courant">Courant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Débutant">Débutant</option>
                      </select>
                      <button onClick={() => gen.setLanguages(gen.languages.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }}>×</button>
                    </div>
                  ))}
                  <button className="btn btn-outline btn-sm" onClick={() => gen.setLanguages([...gen.languages, { language: '', level: '' }])}>
                    + Ajouter une langue
                  </button>
                </div>
              </div>
            </div>

            {/* Save profile checkbox */}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="save-profile" checked={gen.saveProfile} onChange={(e) => gen.setSaveProfile(e.target.checked)} style={{ width: 16, height: 16 }} />
              <label htmlFor="save-profile" style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Sauvegarder mon profil pour les prochaines générations
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Template */}
        {gen.currentStep === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Choisissez votre template</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              {([
                { id: 'modern' as TemplateId, name: 'Modern', desc: 'Deux colonnes, sidebar colorée', color: '#1E3A5F', image: null },
                { id: 'classic' as TemplateId, name: 'Classic', desc: 'Traditionnel, une colonne', color: '#333', image: null },
                { id: 'minimal' as TemplateId, name: 'Minimal', desc: 'Épuré, tech/startup', color: '#999', image: null },
                { id: 'canva_1' as TemplateId, name: 'Modèle Olivia', desc: 'Élégant, noir et blanc', color: '#2C3E50', image: '/templates/canva_1.png' },
                { id: 'canva_2' as TemplateId, name: 'Modèle Seema', desc: 'Bleu et blanc, épuré', color: '#E74C3C', image: '/templates/canva_2.png' },
                { id: 'canva_3' as TemplateId, name: 'Modèle Sacha', desc: 'Sidebar grise, pro', color: '#8E44AD', image: '/templates/canva_3.png' },
                { id: 'canva_4' as TemplateId, name: 'Modèle Marianne', desc: 'Beige, minimaliste', color: '#16A085', image: '/templates/canva_4.png' },
                { id: 'canva_5' as TemplateId, name: 'Modèle Dominique', desc: 'Asymétrique, élégant', color: '#F39C12', image: '/templates/canva_5.png' },
                { id: 'canva_6' as TemplateId, name: 'Modèle Estelle', desc: 'Classique, lignes bleues', color: '#D35400', image: '/templates/canva_6.png' },
              ]).map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => gen.setTemplateId(tmpl.id)}
                  className="card"
                  style={{
                    textAlign: 'center', cursor: 'pointer', padding: 16,
                    border: gen.templateId === tmpl.id ? '2px solid var(--primary)' : '2px solid var(--border)',
                    background: gen.templateId === tmpl.id ? 'var(--primary-50)' : 'white',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tmpl.image ? (
                    <div style={{ width: '100%', height: 200, marginBottom: 12, borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tmpl.image} alt={tmpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: 200, borderRadius: 4, background: tmpl.color, margin: '0 auto 12px', opacity: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{color: tmpl.color, opacity: 1, fontWeight: 'bold'}}>{tmpl.name}</span>
                    </div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{tmpl.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tmpl.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="label">Langue du CV</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([
                  { id: 'fr' as CVLanguage, label: '🇫🇷 Français' },
                  { id: 'en' as CVLanguage, label: '🇬🇧 English' },
                  { id: 'ar' as CVLanguage, label: '🇹🇳 العربية' },
                ]).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => gen.setLanguage(lang.id)}
                    className="btn"
                    style={{
                      background: gen.language === lang.id ? 'var(--primary)' : 'var(--bg)',
                      color: gen.language === lang.id ? 'white' : 'var(--text-secondary)',
                      border: '1px solid ' + (gen.language === lang.id ? 'var(--primary)' : 'var(--border)'),
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Generation */}
        {gen.currentStep === 4 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            {gen.generationStatus === 'idle' && (
              <>
                <Sparkles size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Prêt à générer votre CV</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Coût : <strong>1 token</strong> · Votre solde : <strong style={{ color: balance > 0 ? 'var(--accent)' : 'var(--danger)' }}>{balance} tokens</strong>
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  disabled={balance < 1}
                  onClick={gen.generate}
                  style={{ marginTop: 16 }}
                >
                  <Sparkles size={18} /> Générer mon CV
                </button>
                {balance < 1 && (
                  <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: 12 }}>
                    Solde insuffisant. <a href="/tokens" style={{ color: 'var(--primary)' }}>Acheter des tokens</a>
                  </p>
                )}
              </>
            )}

            {/* Generation Progress */}
            {['analyzing', 'optimizing', 'generating', 'formatting'].includes(gen.generationStatus) && (
              <div style={{ maxWidth: 350, margin: '0 auto' }}>
                <Loader2 size={40} color="var(--primary)" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Génération en cours...</h2>
                {[
                  { key: 'analyzing', label: "Analyse de l'offre..." },
                  { key: 'optimizing', label: 'Optimisation ATS...' },
                  { key: 'generating', label: 'Génération du contenu...' },
                  { key: 'formatting', label: 'Mise en page PDF...' },
                ].map((s) => {
                  const statusOrder = ['analyzing', 'optimizing', 'generating', 'formatting'];
                  const currentIdx = statusOrder.indexOf(gen.generationStatus);
                  const stepIdx = statusOrder.indexOf(s.key);
                  const isDone = stepIdx < currentIdx;
                  const isCurrent = stepIdx === currentIdx;

                  return (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, textAlign: 'left' }}>
                      {isDone ? <CheckCircle size={18} color="var(--accent)" /> : isCurrent ? <Loader2 size={18} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 18, height: 18, borderRadius: 'var(--radius-full)', border: '2px solid var(--border)' }} />}
                      <span style={{ fontSize: 14, color: isDone ? 'var(--accent)' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isCurrent ? 600 : 400 }}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Results */}
            {gen.generationStatus === 'complete' && gen.generatedCV && gen.atsDetails && (
              <div className="animate-fade-in" style={{ textAlign: 'left' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <CheckCircle size={48} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>CV Généré avec Succès !</h2>
                </div>

                {/* ATS Score Card */}
                <div className="card" style={{ marginBottom: 24, padding: 24, border: `2px solid ${getATSColor(gen.atsDetails.score)}20` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Score ATS</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 32, fontWeight: 800, color: getATSColor(gen.atsDetails.score) }}>{gen.atsDetails.score}</span>
                      <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-full)', height: 10, marginBottom: 16, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 'var(--radius-full)', width: `${gen.atsDetails.score}%`, background: getATSColor(gen.atsDetails.score), transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <CheckCircle size={14} color="var(--accent)" />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Mots-clés trouvés ({gen.atsDetails.matched_keywords.length})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
                    {gen.atsDetails.matched_keywords.map((kw) => (
                      <span key={kw} className="tag tag-accent">{kw}</span>
                    ))}
                  </div>
                  {gen.atsDetails.missing_keywords.length > 0 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <AlertCircle size={14} color="var(--warning)" />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>Mots-clés manquants ({gen.atsDetails.missing_keywords.length})</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {gen.atsDetails.missing_keywords.map((kw) => (
                          <span key={kw} className="tag tag-warning">{kw}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn btn-primary btn-lg" onClick={() => setPreviewOpen(true)}>
                    <Eye size={18} /> Aperçu du CV
                  </button>
                  <button className="btn btn-outline btn-lg" onClick={handleDownload}>
                    <Download size={18} /> Télécharger
                  </button>
                  <button className="btn btn-ghost btn-lg" onClick={() => gen.reset()}>
                    Nouveau CV
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {gen.generationStatus === 'error' && (
              <div>
                <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Erreur de Génération</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Une erreur est survenue. Votre token n&apos;a pas été débité.
                </p>
                <button className="btn btn-primary" onClick={() => gen.setGenerationStatus('idle')}>
                  Réessayer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {gen.generationStatus !== 'complete' && !['analyzing', 'optimizing', 'generating', 'formatting'].includes(gen.generationStatus) && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            className="btn btn-ghost"
            disabled={gen.currentStep === 1}
            onClick={() => gen.setStep((gen.currentStep - 1) as WizardStep)}
          >
            <ChevronLeft size={16} /> Précédent
          </button>
          {gen.currentStep < 4 && (
            <button
              className="btn btn-primary"
              disabled={!canProceed()}
              onClick={() => gen.setStep((gen.currentStep + 1) as WizardStep)}
            >
              Suivant <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}

      <ErrorModal
        isOpen={!!gen.error}
        message={gen.error || ''}
        onClose={() => gen.setError(null)}
      />

      {/* Interactive Editor Modal */}
      {previewOpen && gen.generationStatus === 'complete' && gen.sessionId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: 24, animation: 'fadeIn 0.2s ease' }}>
          <div className="card" style={{ width: '100%', maxWidth: 1000, height: '95vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
            <InteractiveCVEditor sessionId={gen.sessionId} onClose={() => setPreviewOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
