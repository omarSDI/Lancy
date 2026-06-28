"""
Lansy.ai — Gemini AI Service
Handles job offer analysis and CV generation using Google Gemini.
"""

import asyncio
import json
import logging

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


# --- Prompts ---

OFFER_ANALYSIS_PROMPT = """
Tu es un expert RH tunisien. Analyse cette offre d'emploi et extrais:
1. Le titre du poste exact
2. Les compétences techniques requises (liste)
3. Les compétences soft skills requises (liste)
4. Le niveau d'expérience requis (junior/mid/senior)
5. Les mots-clés ATS importants (liste de 15-20 mots)
6. Le secteur d'activité
7. Les responsabilités principales (liste)
8. Les qualifications requises (diplômes, certifications)

Offre d'emploi:
{offer_text}

Réponds UNIQUEMENT en JSON valide avec ces clés:
job_title, technical_skills, soft_skills, experience_level, ats_keywords, sector, responsibilities, qualifications
"""

CV_GENERATION_PROMPT = """
Tu es un expert en rédaction de CV pour le marché tunisien et européen.
En utilisant le profil du candidat et l'analyse de l'offre, génère un CV professionnel en {language}.

PROFIL DU CANDIDAT:
{user_profile}

ANALYSE DE L'OFFRE:
{offer_analysis}

EXEMPLES DE BONNES FORMULATIONS (contexte RAG):
{rag_context}

RÈGLES STRICTES POUR L'OPTIMISATION ATS (Applicant Tracking System) :
- COMPATIBILITÉ ATS MAXIMALE : Injecte EXACTEMENT les mots-clés de l'offre dans tes descriptions. N'utilise pas de jargon générique.
- RÉSUMÉ PROFESSIONNEL : Si l'utilisateur a fourni un `summary` dans son profil, utilise-le comme base, mais RÉÉCRIS-LE pour qu'il inclut le titre exact du poste visé et les mots-clés de l'offre. S'il n'y a pas de `summary`, crée-en un percutant.
- EXPÉRIENCES : Adapte CHAQUE bullet point pour correspondre aux mots-clés de l'offre.
- VERBES D'ACTION : Utilise des verbes d'action forts (développé, conçu, optimisé, dirigé...).
- QUANTIFICATION : Quantifie les réalisations quand c'est possible (ex: "réduit le temps de chargement de 40%").
- MOTS-CLÉS : Intègre naturellement ces mots-clés ATS: {ats_keywords}
- PERTINENCE : Ordonne les compétences selon leur pertinence pour CE poste.
- SECTEUR : Adapte le niveau de langage au secteur: {sector}

Réponds en JSON avec cette structure exacte:
{{
  "professional_summary": "string",
  "experience": [
    {{
      "company": "string",
      "title": "string",
      "start_date": "string",
      "end_date": "string",
      "bullet_points": ["string"]
    }}
  ],
  "education": [
    {{
      "institution": "string",
      "degree": "string",
      "field": "string",
      "start_date": "string",
      "end_date": "string"
    }}
  ],
  "technical_skills": ["string"],
  "soft_skills": ["string"],
  "languages": [
    {{
      "language": "string",
      "level": "string"
    }}
  ],
  "certifications": ["string"]
}}
"""

# Language mapping for prompts
LANGUAGE_MAP = {
    "fr": "français",
    "en": "English",
    "ar": "العربية",
}


def _get_model():
    """Get the Gemini model instance."""
    return genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=GenerationConfig(
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            max_output_tokens=4096,
            response_mime_type="application/json",
        ),
    )


def _parse_json_response(text: str) -> dict:
    """Parse JSON from Gemini response, handling potential formatting issues."""
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to extract JSON from markdown code blocks
    if "```json" in text:
        json_str = text.split("```json")[1].split("```")[0].strip()
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

    if "```" in text:
        json_str = text.split("```")[1].split("```")[0].strip()
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

    # Try to find JSON-like structure
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Impossible de parser la réponse JSON de Gemini: {text[:200]}")


async def analyze_offer(offer_text: str) -> dict:
    """
    Analyze a job offer using Gemini to extract structured information.
    Returns a dict with: job_title, technical_skills, soft_skills,
    experience_level, ats_keywords, sector, responsibilities, qualifications
    """
    try:
        model = _get_model()
        prompt = OFFER_ANALYSIS_PROMPT.format(offer_text=offer_text)

        # Run sync SDK in a thread to avoid blocking the event loop
        response = await asyncio.to_thread(model.generate_content, prompt)

        if not response.text:
            raise ValueError("Réponse vide de Gemini")

        result = _parse_json_response(response.text)

        # Validate required fields
        required_fields = [
            "job_title", "technical_skills", "soft_skills",
            "experience_level", "ats_keywords", "sector",
            "responsibilities", "qualifications",
        ]
        for field in required_fields:
            if field not in result:
                result[field] = [] if field not in ("job_title", "experience_level", "sector") else "Non spécifié"

        # Coerce list fields: Gemini sometimes returns a string instead of a list
        list_fields = ["technical_skills", "soft_skills", "ats_keywords", "responsibilities", "qualifications"]
        for field in list_fields:
            val = result.get(field)
            if isinstance(val, str):
                # Split on newlines or semicolons, or wrap as single-item list
                items = [v.strip() for v in val.replace(';', '\n').splitlines() if v.strip()]
                result[field] = items if items else [val]
            elif not isinstance(val, list):
                result[field] = []

        logger.info(f"Offer analyzed: {result.get('job_title', 'Unknown')}")
        return result

    except Exception as e:
        logger.error(f"Gemini offer analysis failed: {e}")
        raise ValueError(
            f"Erreur lors de l'analyse de l'offre. "
            f"Veuillez vérifier le texte de l'offre et réessayer. "
            f"Détails: {str(e)}"
        )


async def generate_cv(
    user_profile: dict,
    offer_analysis: dict,
    rag_context: str,
    language: str = "fr",
) -> dict:
    """
    Generate a tailored CV using Gemini based on user profile,
    offer analysis, and RAG context.
    Returns structured CV data as a dict.
    """
    try:
        model = _get_model()

        lang_name = LANGUAGE_MAP.get(language, "français")
        ats_keywords = ", ".join(offer_analysis.get("ats_keywords", []))
        sector = offer_analysis.get("sector", "Général")

        prompt = CV_GENERATION_PROMPT.format(
            language=lang_name,
            user_profile=json.dumps(user_profile, ensure_ascii=False, indent=2),
            offer_analysis=json.dumps(offer_analysis, ensure_ascii=False, indent=2),
            rag_context=rag_context,
            ats_keywords=ats_keywords,
            sector=sector,
        )

        # Run sync SDK in a thread to avoid blocking the event loop
        response = await asyncio.to_thread(model.generate_content, prompt)

        if not response.text:
            raise ValueError("Réponse vide de Gemini")

        result = _parse_json_response(response.text)

        # Validate required fields with defaults
        defaults = {
            "professional_summary": "",
            "experience": [],
            "education": [],
            "technical_skills": [],
            "soft_skills": [],
            "languages": [],
            "certifications": [],
        }
        for key, default in defaults.items():
            if key not in result:
                result[key] = default

        logger.info("CV generated successfully")
        return result

    except Exception as e:
        logger.error(f"Gemini CV generation failed: {e}")
        raise ValueError(
            f"Erreur lors de la génération du CV. "
            f"Veuillez réessayer. Détails: {str(e)}"
        )


def cv_to_text(cv_data: dict) -> str:
    """Convert structured CV data to plain text for ATS scoring."""
    parts = []

    if cv_data.get("professional_summary"):
        parts.append(cv_data["professional_summary"])

    for exp in cv_data.get("experience", []):
        parts.append(f"{exp.get('title', '')} - {exp.get('company', '')}")
        for bp in exp.get("bullet_points", []):
            parts.append(f"  - {bp}")

    for edu in cv_data.get("education", []):
        parts.append(f"{edu.get('degree', '')} - {edu.get('institution', '')}")
        if edu.get("field"):
            parts.append(f"  {edu['field']}")

    if cv_data.get("technical_skills"):
        parts.append("Compétences: " + ", ".join(cv_data["technical_skills"]))

    if cv_data.get("soft_skills"):
        parts.append("Soft Skills: " + ", ".join(cv_data["soft_skills"]))

    for lang in cv_data.get("languages", []):
        parts.append(f"{lang.get('language', '')} - {lang.get('level', '')}")

    if cv_data.get("certifications"):
        parts.append("Certifications: " + ", ".join(cv_data["certifications"]))

    return "\n".join(parts)
