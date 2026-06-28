/**
 * Lansy.ai — Profile Page
 * Save user data for pre-filling CV forms.
 */

'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '@/lib/api';
import type { PersonalInfo, EducationEntry, ExperienceEntry, Skills, LanguageEntry } from '@/types';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '', email: '', phone: '', address: '', linkedin: '', github: '', summary: '', photo_url: '',
  });
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [skills, setSkills] = useState<Skills>({ technical: [], certifications: [] });
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProfile()
      .then((profile) => {
        if (profile) {
          if (profile.personal_info) setPersonalInfo(profile.personal_info);
          if (profile.education) setEducation(profile.education);
          if (profile.experience) setExperience(profile.experience);
          if (profile.skills) setSkills(profile.skills);
          if (profile.languages) setLanguages(profile.languages);
        }
      })
      .catch(() => setError('Impossible de charger le profil. Veuillez réessayer.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("L'image est trop grande (max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo({ ...personalInfo, photo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        personal_info: personalInfo,
        education,
        experience,
        skills,
        languages,
      });
      toast.success('Profil sauvegardé !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 60, marginTop: 40 }}>
        <div style={{ display: 'inline-flex', padding: 16, background: 'var(--danger-50)', borderRadius: 'var(--radius-full)', marginBottom: 16 }}>
          <Loader2 size={32} color="var(--danger)" style={{ display: 'none' }} />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Erreur</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Mon Profil</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        Ces informations seront pré-remplies lors de la génération de vos CVs
      </p>

      {/* Personal Info */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Informations personnelles</h2>
        
        {/* Photo Upload */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {personalInfo.photo_url ? (
              <img src={personalInfo.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 24, color: 'var(--text-muted)' }}>📸</span>
            )}
          </div>
          <div>
            <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
              Changer la photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Format carré recommandé (Max 2 MB)</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { key: 'name', label: 'Nom complet', placeholder: 'Ahmed Ben Ali' },
            { key: 'email', label: 'Email', placeholder: 'ahmed@email.com' },
            { key: 'phone', label: 'Téléphone', placeholder: '+216 XX XXX XXX' },
            { key: 'address', label: 'Adresse', placeholder: 'Tunis, Tunisie' },
            { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
            { key: 'github', label: 'GitHub', placeholder: 'github.com/...' },
          ].map((field) => (
            <div key={field.key}>
              <label className="label">{field.label}</label>
              <input
                className="input"
                placeholder={field.placeholder}
                value={(personalInfo as any)[field.key] || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, [field.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div style={{ marginTop: 16 }}>
          <label className="label">Résumé Professionnel (Objectif, accroche)</label>
          <textarea
            className="input"
            rows={4}
            placeholder="Je suis un ingénieur logiciel passionné..."
            value={personalInfo.summary || ''}
            onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
            style={{ resize: 'vertical' }}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            💡 Lors de la génération de votre CV, notre IA améliorera ce résumé et y injectera les mots-clés de l'offre d'emploi pour passer les systèmes ATS.
          </p>
        </div>
      </div>

      {/* Education */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Formation</h2>
        {education.map((edu, i) => (
          <div key={i} style={{ padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label className="label">Établissement</label><input className="input" placeholder="INSAT, ENIT..." value={edu.institution} onChange={(e) => { const u = [...education]; u[i] = { ...edu, institution: e.target.value }; setEducation(u); }} /></div>
              <div><label className="label">Diplôme</label><input className="input" placeholder="Ingénieur, Master..." value={edu.degree} onChange={(e) => { const u = [...education]; u[i] = { ...edu, degree: e.target.value }; setEducation(u); }} /></div>
              <div><label className="label">Domaine</label><input className="input" placeholder="Informatique" value={edu.field} onChange={(e) => { const u = [...education]; u[i] = { ...edu, field: e.target.value }; setEducation(u); }} /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}><label className="label">Début</label><input className="input" placeholder="2020" value={edu.start_date} onChange={(e) => { const u = [...education]; u[i] = { ...edu, start_date: e.target.value }; setEducation(u); }} /></div>
                <div style={{ flex: 1 }}><label className="label">Fin</label><input className="input" placeholder="2024" value={edu.end_date} onChange={(e) => { const u = [...education]; u[i] = { ...edu, end_date: e.target.value }; setEducation(u); }} /></div>
              </div>
            </div>
            <button onClick={() => setEducation(education.filter((_, j) => j !== i))} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }}>Supprimer</button>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => setEducation([...education, { institution: '', degree: '', field: '', start_date: '', end_date: '' }])}>
          + Ajouter une formation
        </button>
      </div>

      {/* Experience */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Expérience</h2>
        {experience.map((exp, i) => (
          <div key={i} style={{ padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label className="label">Entreprise</label><input className="input" value={exp.company} onChange={(e) => { const u = [...experience]; u[i] = { ...exp, company: e.target.value }; setExperience(u); }} /></div>
              <div><label className="label">Poste</label><input className="input" value={exp.title} onChange={(e) => { const u = [...experience]; u[i] = { ...exp, title: e.target.value }; setExperience(u); }} /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}><label className="label">Début</label><input className="input" value={exp.start_date} onChange={(e) => { const u = [...experience]; u[i] = { ...exp, start_date: e.target.value }; setExperience(u); }} /></div>
                <div style={{ flex: 1 }}><label className="label">Fin</label><input className="input" placeholder="Présent" value={exp.end_date} onChange={(e) => { const u = [...experience]; u[i] = { ...exp, end_date: e.target.value }; setExperience(u); }} /></div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Réalisations (une par ligne)</label>
              <textarea
                className="input"
                style={{ minHeight: 80 }}
                value={exp.bullet_points.join('\n')}
                onChange={(e) => { const u = [...experience]; u[i] = { ...exp, bullet_points: e.target.value.split('\n').filter(Boolean) }; setExperience(u); }}
              />
            </div>
            <button onClick={() => setExperience(experience.filter((_, j) => j !== i))} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }}>Supprimer</button>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => setExperience([...experience, { company: '', title: '', start_date: '', end_date: '', bullet_points: [] }])}>
          + Ajouter une expérience
        </button>
      </div>

      {/* Skills & Languages */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Compétences & Langues</h2>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Compétences techniques (séparées par des virgules)</label>
          <input
            className="input"
            placeholder="React, Python, Docker, SQL..."
            value={skills.technical.join(', ')}
            onChange={(e) => setSkills({ ...skills, technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            {skills.technical.map((s) => (
              <span key={s} className="tag tag-primary">{s}</span>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Langues</label>
          {languages.map((lang, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Français" value={lang.language} onChange={(e) => { const u = [...languages]; u[i] = { ...lang, language: e.target.value }; setLanguages(u); }} />
              <select className="input" style={{ width: 160 }} value={lang.level} onChange={(e) => { const u = [...languages]; u[i] = { ...lang, level: e.target.value }; setLanguages(u); }}>
                <option value="">Niveau</option>
                <option value="Natif">Natif</option>
                <option value="Courant">Courant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Débutant">Débutant</option>
              </select>
              <button onClick={() => setLanguages(languages.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
          ))}
          <button className="btn btn-outline btn-sm" onClick={() => setLanguages([...languages, { language: '', level: '' }])}>
            + Ajouter une langue
          </button>
        </div>
      </div>

      {/* Save button (bottom) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
          {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
        </button>
      </div>
    </div>
  );
}
