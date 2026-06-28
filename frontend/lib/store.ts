/**
 * Lansy.ai — Global State Store (Zustand)
 */

import { create } from 'zustand';
import type {
  User,
  TokenBalance,
  OfferAnalysis,
  GeneratedCV,
  ATSDetails,
  PersonalInfo,
  EducationEntry,
  ExperienceEntry,
  Skills,
  LanguageEntry,
  WizardStep,
  TemplateId,
  CVLanguage,
  GenerationStatus,
} from '@/types';

// --- Auth Store ---

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));

// --- Token Store ---

interface TokenState {
  balance: number;
  lifetimeUsed: number;
  isLoading: boolean;
  setBalance: (balance: TokenBalance) => void;
  optimisticDeduct: (amount: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  balance: 0,
  lifetimeUsed: 0,
  isLoading: true,
  setBalance: ({ balance, lifetime_used }) =>
    set({ balance, lifetimeUsed: lifetime_used, isLoading: false }),
  optimisticDeduct: (amount) =>
    set((state) => ({
      balance: Math.max(0, state.balance - amount),
      lifetimeUsed: state.lifetimeUsed + amount,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// --- CV Generator Store ---

interface CVGeneratorState {
  // Wizard state
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;

  // Step 1: Offer
  offerText: string;
  offerAnalysis: OfferAnalysis | null;
  setOfferText: (text: string) => void;
  setOfferAnalysis: (analysis: OfferAnalysis | null) => void;

  // Step 2: User info
  personalInfo: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: Skills;
  languages: LanguageEntry[];
  saveProfile: boolean;
  setPersonalInfo: (info: PersonalInfo) => void;
  setEducation: (edu: EducationEntry[]) => void;
  setExperience: (exp: ExperienceEntry[]) => void;
  setSkills: (skills: Skills) => void;
  setLanguages: (langs: LanguageEntry[]) => void;
  setSaveProfile: (save: boolean) => void;

  // Step 3: Template
  templateId: TemplateId;
  language: CVLanguage;
  setTemplateId: (id: TemplateId) => void;
  setLanguage: (lang: CVLanguage) => void;

  // Step 4: Generation
  generationStatus: GenerationStatus;
  generatedCV: GeneratedCV | null;
  atsDetails: ATSDetails | null;
  sessionId: string | null;
  setGenerationStatus: (status: GenerationStatus) => void;
  setResult: (cv: GeneratedCV, ats: ATSDetails, sessionId: string) => void;

  // Reset
  reset: () => void;
}

const defaultPersonalInfo: PersonalInfo = {
  name: '',
  email: '',
  phone: '',
  address: '',
  linkedin: '',
  github: '',
};

const defaultSkills: Skills = {
  technical: [],
  certifications: [],
};

export const useCVGeneratorStore = create<CVGeneratorState>((set) => ({
  // Wizard
  currentStep: 1,
  setStep: (currentStep) => set({ currentStep }),

  // Step 1
  offerText: '',
  offerAnalysis: null,
  setOfferText: (offerText) => set({ offerText }),
  setOfferAnalysis: (offerAnalysis) => set({ offerAnalysis }),

  // Step 2
  personalInfo: defaultPersonalInfo,
  education: [],
  experience: [],
  skills: defaultSkills,
  languages: [],
  saveProfile: false,
  setPersonalInfo: (personalInfo) => set({ personalInfo }),
  setEducation: (education) => set({ education }),
  setExperience: (experience) => set({ experience }),
  setSkills: (skills) => set({ skills }),
  setLanguages: (languages) => set({ languages }),
  setSaveProfile: (saveProfile) => set({ saveProfile }),

  // Step 3
  templateId: 'modern',
  language: 'fr',
  setTemplateId: (templateId) => set({ templateId }),
  setLanguage: (language) => set({ language }),

  // Step 4
  generationStatus: 'idle',
  generatedCV: null,
  atsDetails: null,
  sessionId: null,
  setGenerationStatus: (generationStatus) => set({ generationStatus }),
  setResult: (generatedCV, atsDetails, sessionId) =>
    set({ generatedCV, atsDetails, sessionId, generationStatus: 'complete' }),

  // Reset
  reset: () =>
    set({
      currentStep: 1,
      offerText: '',
      offerAnalysis: null,
      personalInfo: defaultPersonalInfo,
      education: [],
      experience: [],
      skills: defaultSkills,
      languages: [],
      saveProfile: false,
      templateId: 'modern',
      language: 'fr',
      generationStatus: 'idle',
      generatedCV: null,
      atsDetails: null,
      sessionId: null,
    }),
}));
