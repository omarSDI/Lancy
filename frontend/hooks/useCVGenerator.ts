/**
 * Lansy.ai — Custom Hooks: useCVGenerator
 */

'use client';

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useCVGeneratorStore, useTokenStore } from '@/lib/store';
import { analyzeOffer, generateCV } from '@/lib/api';
import type { GenerationStatus } from '@/types';

export function useCVGenerator() {
  const store = useCVGeneratorStore();
  const { optimisticDeduct, setBalance } = useTokenStore();
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeOffer = useCallback(async () => {
    if (!store.offerText || store.offerText.length < 50) {
      setError("Veuillez coller une offre d'emploi d'au moins 50 caractères.");
      return;
    }

    try {
      store.setGenerationStatus('analyzing');
      const analysis = await analyzeOffer(store.offerText);
      store.setOfferAnalysis(analysis);
      store.setGenerationStatus('idle');
      toast.success(
        `Offre analysée : ${analysis.job_title} — ${analysis.ats_keywords.length} mots-clés ATS détectés`
      );
    } catch {
      store.setGenerationStatus('idle');
      setError("Erreur lors de l'analyse de l'offre.");
    }
  }, [store]);

  const handleGenerate = useCallback(async () => {
    const statuses: GenerationStatus[] = ['analyzing', 'optimizing', 'generating', 'formatting'];
    let currentIndex = 0;

    // Progress simulation
    const progressInterval = setInterval(() => {
      currentIndex++;
      if (currentIndex < statuses.length) {
        store.setGenerationStatus(statuses[currentIndex]);
      }
    }, 2000);

    try {
      store.setGenerationStatus('analyzing');
      optimisticDeduct(1);

      const result = await generateCV({
        offer_text: store.offerText,
        offer_analysis: store.offerAnalysis,
        personal_info: store.personalInfo,
        education: store.education,
        experience: store.experience,
        skills: store.skills,
        languages: store.languages,
        template_id: store.templateId,
        language: store.language,
        save_profile: store.saveProfile,
      });

      clearInterval(progressInterval);

      store.setResult(result.generated_cv, result.ats_details, result.session_id);
      setBalance({
        balance: result.tokens_remaining,
        lifetime_used: 0, // Will be updated on next fetch
      });

      toast.success(`CV généré avec succès ! Score ATS : ${result.ats_score}/100`);
    } catch (err: any) {
      clearInterval(progressInterval);
      // Restore the token that was optimistically deducted
      optimisticDeduct(-1);
      store.setGenerationStatus('idle');
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        'Erreur lors de la génération du CV. Veuillez réessayer.';
      console.error('[useCVGenerator] Generation failed:', err?.response?.data || err);
      setError(detail);
    }
  }, [store, optimisticDeduct, setBalance]);

  return {
    ...store,
    error,
    setError,
    analyzeOffer: handleAnalyzeOffer,
    generate: handleGenerate,
  };
}
