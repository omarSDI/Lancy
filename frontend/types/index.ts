/**
 * Lansy.ai — TypeScript Type Definitions
 * Mirrors all backend Pydantic schemas.
 */

// --- User ---

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSync {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// --- Profile ---

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  photo_url?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  current?: boolean;
  bullet_points: string[];
}

export interface Skills {
  technical: string[];
  certifications: string[];
}

export interface LanguageEntry {
  language: string;
  level: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  personal_info: PersonalInfo | null;
  education: EducationEntry[] | null;
  experience: ExperienceEntry[] | null;
  skills: Skills | null;
  languages: LanguageEntry[] | null;
  updated_at: string;
}

// --- Offer Analysis ---

export interface OfferAnalysis {
  job_title: string;
  technical_skills: string[];
  soft_skills: string[];
  experience_level: string;
  ats_keywords: string[];
  sector: string;
  responsibilities: string[];
  qualifications: string[];
}

// --- CV Generation ---

export interface CVGenerateRequest {
  offer_text: string;
  offer_analysis?: OfferAnalysis | null;
  personal_info: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: Skills;
  languages: LanguageEntry[];
  template_id: string;
  language: string;
  save_profile: boolean;
}

export interface GeneratedCV {
  professional_summary: string;
  experience: {
    company: string;
    title: string;
    start_date: string;
    end_date: string;
    bullet_points: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    start_date: string;
    end_date: string;
  }[];
  technical_skills: string[];
  soft_skills: string[];
  languages: { language: string; level: string }[];
  certifications: string[];
}

export interface ATSDetails {
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
}

export interface CVGenerateResponse {
  session_id: string;
  generated_cv: GeneratedCV;
  ats_score: number;
  ats_details: ATSDetails;
  offer_analysis: OfferAnalysis;
  template_id: string;
  language: string;
  tokens_remaining: number;
}

// --- CV Session ---

export interface CVSession {
  id: string;
  offer_text: string;
  offer_analysis: OfferAnalysis | null;
  generated_cv: GeneratedCV | null;
  generated_cv_text: string | null;
  ats_score: number | null;
  ats_details: ATSDetails | null;
  template_id: string | null;
  pdf_url: string | null;
  tokens_used: number;
  language: string;
  created_at: string;
}

export interface CVSessionListItem {
  id: string;
  job_title: string | null;
  ats_score: number | null;
  template_id: string | null;
  language: string;
  created_at: string;
}

export interface CVHistoryResponse {
  items: CVSessionListItem[];
  total: number;
  page: number;
  per_page: number;
}

// --- Tokens ---

export interface TokenBalance {
  balance: number;
  lifetime_used: number;
}

export interface TokenTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  payment_ref: string | null;
  created_at: string;
}

export interface TokenHistoryResponse {
  items: TokenTransaction[];
  total: number;
  page: number;
  per_page: number;
}

export interface TokenPurchaseResponse {
  payment_url: string;
  payment_ref: string;
  package_id: string;
  tokens: number;
  amount_dt: number;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number | string;
  amount_dt: number;
  popular?: boolean;
  monthly?: boolean;
  discount?: number;
  icon: string;
}

// --- Generator Wizard ---

export type WizardStep = 1 | 2 | 3 | 4;

export type TemplateId = 'modern' | 'classic' | 'minimal' | 'canva_1' | 'canva_2' | 'canva_3' | 'canva_4' | 'canva_5' | 'canva_6';

export type CVLanguage = 'fr' | 'en' | 'ar';

export type GenerationStatus =
  | 'idle'
  | 'analyzing'
  | 'optimizing'
  | 'generating'
  | 'formatting'
  | 'complete'
  | 'error';
