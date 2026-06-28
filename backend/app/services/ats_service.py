"""
Lansy.ai — ATS Scoring Service
Calculates ATS (Applicant Tracking System) compatibility scores.
"""

import logging

logger = logging.getLogger(__name__)


def calculate_ats_score(cv_text: str, offer_analysis: dict) -> dict:
    """
    Calculate ATS compatibility score by matching CV text against
    extracted offer keywords.

    Returns:
        {
            "score": int (0-100),
            "matched_keywords": list[str],
            "missing_keywords": list[str],
            "recommendations": list[str]
        }
    """
    ats_keywords = offer_analysis.get("ats_keywords", [])

    if not ats_keywords:
        return {
            "score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "recommendations": ["Aucun mot-clé ATS détecté dans l'offre."],
        }

    cv_lower = cv_text.lower()

    matched = [kw for kw in ats_keywords if kw.lower() in cv_lower]
    missing = [kw for kw in ats_keywords if kw.lower() not in cv_lower]

    score = int((len(matched) / len(ats_keywords)) * 100)

    recommendations = generate_recommendations(missing, score)

    logger.info(
        f"ATS Score: {score}/100 — "
        f"Matched: {len(matched)}/{len(ats_keywords)}"
    )

    return {
        "score": score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "recommendations": recommendations,
    }


def generate_recommendations(missing_keywords: list[str], score: int) -> list[str]:
    """Generate actionable recommendations based on missing keywords and score."""
    recommendations = []

    if score >= 80:
        recommendations.append(
            "✅ Excellent score ATS ! Votre CV est bien optimisé pour cette offre."
        )
    elif score >= 60:
        recommendations.append(
            "⚠️ Bon score ATS, mais il peut être amélioré. "
            "Essayez d'intégrer les mots-clés manquants dans vos descriptions d'expérience."
        )
    else:
        recommendations.append(
            "❌ Score ATS faible. Votre CV manque de plusieurs mots-clés importants. "
            "Restructurez vos descriptions d'expérience pour inclure ces termes."
        )

    if missing_keywords:
        # Group missing keywords by category (heuristic)
        tech_keywords = []
        soft_keywords = []
        other_keywords = []

        tech_indicators = [
            "python", "java", "react", "node", "sql", "docker", "kubernetes",
            "aws", "azure", "api", "git", "linux", "ci/cd", "agile", "scrum",
            "html", "css", "javascript", "typescript", "fastapi", "django",
            "mongodb", "redis", "kafka", "spark", "tensorflow", "pytorch",
        ]
        soft_indicators = [
            "communication", "leadership", "teamwork", "gestion", "management",
            "autonomie", "rigueur", "adaptabilité", "créativité", "organisation",
        ]

        for kw in missing_keywords:
            kw_lower = kw.lower()
            if any(tech in kw_lower for tech in tech_indicators):
                tech_keywords.append(kw)
            elif any(soft in kw_lower for soft in soft_indicators):
                soft_keywords.append(kw)
            else:
                other_keywords.append(kw)

        if tech_keywords:
            recommendations.append(
                f"💡 Ajoutez ces compétences techniques: {', '.join(tech_keywords)}"
            )
        if soft_keywords:
            recommendations.append(
                f"💡 Mentionnez ces soft skills: {', '.join(soft_keywords)}"
            )
        if other_keywords:
            recommendations.append(
                f"💡 Intégrez ces termes dans vos descriptions: {', '.join(other_keywords)}"
            )

        if len(missing_keywords) > 5:
            recommendations.append(
                "🔄 Conseil: Vous pouvez régénérer votre CV en ajoutant "
                "ces mots-clés à vos compétences ou descriptions d'expérience."
            )

    return recommendations
