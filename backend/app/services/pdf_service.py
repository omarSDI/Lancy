"""
Lansy.ai — PDF Generation Service
Server-side PDF generation using WeasyPrint with HTML templates.
"""

import logging
from io import BytesIO

logger = logging.getLogger(__name__)


def _escape_html(text: str) -> str:
    """Escape HTML special characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#x27;")
    )


def _generate_modern_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Generate Modern template HTML — 2-column layout."""
    name = _escape_html(personal_info.get("name", ""))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    address = _escape_html(personal_info.get("address", ""))
    linkedin = _escape_html(personal_info.get("linkedin", ""))
    github = _escape_html(personal_info.get("github", ""))
    summary = _escape_html(cv_data.get("professional_summary", ""))

    # Skills HTML
    skills_html = ""
    for skill in cv_data.get("technical_skills", []):
        skills_html += f'<span class="skill-tag">{_escape_html(skill)}</span>'

    # Languages HTML
    langs_html = ""
    for lang in cv_data.get("languages", []):
        langs_html += f'<div class="lang-item"><strong>{_escape_html(lang.get("language", ""))}</strong><br/>{_escape_html(lang.get("level", ""))}</div>'

    # Experience HTML
    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(
            f"<li>{_escape_html(bp)}</li>"
            for bp in exp.get("bullet_points", [])
        )
        exp_html += f"""
        <div class="entry">
            <div class="entry-header">
                <strong>{_escape_html(exp.get('title', ''))}</strong>
                <span class="date">{_escape_html(exp.get('start_date', ''))} — {_escape_html(exp.get('end_date', ''))}</span>
            </div>
            <div class="company">{_escape_html(exp.get('company', ''))}</div>
            <ul>{bullets}</ul>
        </div>
        """

    # Education HTML
    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f"""
        <div class="entry">
            <div class="entry-header">
                <strong>{_escape_html(edu.get('degree', ''))}</strong>
                <span class="date">{_escape_html(edu.get('start_date', ''))} — {_escape_html(edu.get('end_date', ''))}</span>
            </div>
            <div class="company">{_escape_html(edu.get('institution', ''))}</div>
            <div class="field">{_escape_html(edu.get('field', ''))}</div>
        </div>
        """

    # Certifications HTML
    certs_html = ""
    for cert in cv_data.get("certifications", []):
        certs_html += f"<li>{_escape_html(cert)}</li>"

    dir_attr = 'dir="rtl"' if language == "ar" else ""

    return f"""
    <!DOCTYPE html>
    <html {dir_attr}>
    <head>
        <meta charset="UTF-8"/>
        <style>
            @page {{ size: A4; margin: 0; }}
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #333; }}
            .container {{ display: flex; min-height: 297mm; }}
            .sidebar {{
                width: 30%; background: #1E3A5F; color: white; padding: 30px 20px;
            }}
            .main {{ width: 70%; padding: 30px 25px; }}
            .name {{ font-size: 22pt; font-weight: 700; margin-bottom: 5px; }}
            .contact-item {{ margin: 6px 0; font-size: 9pt; opacity: 0.9; }}
            .section-title {{
                font-size: 12pt; font-weight: 700; margin: 20px 0 10px;
                text-transform: uppercase; letter-spacing: 1px;
            }}
            .sidebar .section-title {{ color: #7CB9E8; border-bottom: 2px solid #7CB9E8; padding-bottom: 4px; }}
            .main .section-title {{ color: #1E3A5F; border-bottom: 2px solid #1E3A5F; padding-bottom: 4px; }}
            .skill-tag {{
                display: inline-block; background: rgba(255,255,255,0.15); padding: 3px 10px;
                border-radius: 12px; margin: 3px 2px; font-size: 9pt;
            }}
            .lang-item {{ margin: 6px 0; font-size: 9.5pt; }}
            .summary {{ font-size: 10pt; line-height: 1.5; color: #555; margin-bottom: 15px; font-style: italic; }}
            .entry {{ margin-bottom: 14px; }}
            .entry-header {{ display: flex; justify-content: space-between; align-items: baseline; }}
            .date {{ font-size: 9pt; color: #888; }}
            .company {{ font-size: 9.5pt; color: #1E3A5F; margin: 2px 0; }}
            .field {{ font-size: 9pt; color: #666; }}
            ul {{ margin: 4px 0 0 18px; }}
            li {{ margin: 2px 0; font-size: 9.5pt; line-height: 1.4; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="sidebar">
                {f'<div style="text-align: center; margin-bottom: 20px;"><img src="{personal_info.get("photo_url")}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.2);" alt="Profile Photo"/></div>' if personal_info.get("photo_url") else ''}
                <div class="name">{name}</div>
                <div class="contact-item">📧 {email}</div>
                <div class="contact-item">📱 {phone}</div>
                {'<div class="contact-item">📍 ' + address + '</div>' if address else ''}
                {'<div class="contact-item">🔗 ' + linkedin + '</div>' if linkedin else ''}
                {'<div class="contact-item">💻 ' + github + '</div>' if github else ''}

                <div class="section-title">Compétences</div>
                {skills_html}

                <div class="section-title">Langues</div>
                {langs_html}

                {"<div class='section-title'>Certifications</div><ul>" + certs_html + "</ul>" if certs_html else ""}
            </div>
            <div class="main">
                <div class="section-title">Profil</div>
                <div class="summary">{summary}</div>

                <div class="section-title">Expérience</div>
                {exp_html}

                <div class="section-title">Formation</div>
                {edu_html}
            </div>
        </div>
    </body>
    </html>
    """


def _generate_classic_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Generate Classic template HTML — single column, traditional layout."""
    name = _escape_html(personal_info.get("name", ""))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    address = _escape_html(personal_info.get("address", ""))
    linkedin = _escape_html(personal_info.get("linkedin", ""))
    summary = _escape_html(cv_data.get("professional_summary", ""))

    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(f"<li>{_escape_html(bp)}</li>" for bp in exp.get("bullet_points", []))
        exp_html += f"""
        <div class="entry">
            <div class="entry-header">
                <strong>{_escape_html(exp.get('title', ''))}</strong> — {_escape_html(exp.get('company', ''))}
                <span class="date">{_escape_html(exp.get('start_date', ''))} — {_escape_html(exp.get('end_date', ''))}</span>
            </div>
            <ul>{bullets}</ul>
        </div>
        """

    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f"""
        <div class="entry">
            <strong>{_escape_html(edu.get('degree', ''))}</strong> — {_escape_html(edu.get('institution', ''))}
            <span class="date">{_escape_html(edu.get('start_date', ''))} — {_escape_html(edu.get('end_date', ''))}</span>
            <div class="field">{_escape_html(edu.get('field', ''))}</div>
        </div>
        """

    skills = ", ".join(_escape_html(s) for s in cv_data.get("technical_skills", []))
    soft = ", ".join(_escape_html(s) for s in cv_data.get("soft_skills", []))
    langs = ", ".join(
        f"{_escape_html(l.get('language', ''))} ({_escape_html(l.get('level', ''))})"
        for l in cv_data.get("languages", [])
    )
    certs = ", ".join(_escape_html(c) for c in cv_data.get("certifications", []))

    dir_attr = 'dir="rtl"' if language == "ar" else ""

    return f"""
    <!DOCTYPE html>
    <html {dir_attr}>
    <head>
        <meta charset="UTF-8"/>
        <style>
            @page {{ size: A4; margin: 20mm 25mm; }}
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: 'Georgia', 'Times New Roman', serif; font-size: 10pt; color: #222; line-height: 1.5; }}
            .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 18px; }}
            .header-info {{ text-align: left; }}
            .name {{ font-size: 24pt; font-weight: 700; letter-spacing: 2px; }}
            .contact {{ font-size: 9pt; color: #555; margin-top: 6px; }}
            .section-title {{
                font-size: 12pt; font-weight: 700; text-transform: uppercase;
                border-bottom: 1px solid #999; padding-bottom: 3px; margin: 16px 0 10px;
                letter-spacing: 1.5px; color: #333;
            }}
            .summary {{ font-size: 10pt; line-height: 1.6; color: #444; margin-bottom: 10px; }}
            .entry {{ margin-bottom: 12px; }}
            .entry-header {{ display: flex; justify-content: space-between; }}
            .date {{ font-size: 9pt; color: #777; font-style: italic; }}
            .field {{ font-size: 9pt; color: #666; margin-top: 2px; }}
            ul {{ margin: 4px 0 0 20px; }}
            li {{ margin: 2px 0; font-size: 9.5pt; }}
            .skills-line {{ font-size: 9.5pt; margin: 4px 0; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="header-info">
                <div class="name">{name}</div>
                <div class="contact">{email} | {phone}{' | ' + address if address else ''}{' | ' + linkedin if linkedin else ''}</div>
            </div>
            {f'<img src="{personal_info.get("photo_url")}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd;" alt="Profile Photo"/>' if personal_info.get("photo_url") else ''}
        </div>

        <div class="section-title">Profil Professionnel</div>
        <div class="summary">{summary}</div>

        <div class="section-title">Expérience Professionnelle</div>
        {exp_html}

        <div class="section-title">Formation</div>
        {edu_html}

        <div class="section-title">Compétences</div>
        <div class="skills-line"><strong>Techniques:</strong> {skills}</div>
        <div class="skills-line"><strong>Interpersonnelles:</strong> {soft}</div>

        {"<div class='section-title'>Langues</div><div class='skills-line'>" + langs + "</div>" if langs else ""}
        {"<div class='section-title'>Certifications</div><div class='skills-line'>" + certs + "</div>" if certs else ""}
    </body>
    </html>
    """


def _generate_minimal_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Generate Minimal template HTML — maximum whitespace, tech/startup aesthetic."""
    name = _escape_html(personal_info.get("name", ""))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    linkedin = _escape_html(personal_info.get("linkedin", ""))
    github = _escape_html(personal_info.get("github", ""))
    summary = _escape_html(cv_data.get("professional_summary", ""))

    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(
            f'<div class="bullet">→ {_escape_html(bp)}</div>'
            for bp in exp.get("bullet_points", [])
        )
        exp_html += f"""
        <div class="entry">
            <div class="label">{_escape_html(exp.get('start_date', ''))} — {_escape_html(exp.get('end_date', ''))}</div>
            <div class="content">
                <strong>{_escape_html(exp.get('title', ''))}</strong> · {_escape_html(exp.get('company', ''))}
                {bullets}
            </div>
        </div>
        """

    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f"""
        <div class="entry">
            <div class="label">{_escape_html(edu.get('start_date', ''))} — {_escape_html(edu.get('end_date', ''))}</div>
            <div class="content">
                <strong>{_escape_html(edu.get('degree', ''))}</strong> · {_escape_html(edu.get('institution', ''))}
                <div class="bullet">→ {_escape_html(edu.get('field', ''))}</div>
            </div>
        </div>
        """

    skills = " · ".join(_escape_html(s) for s in cv_data.get("technical_skills", []))
    langs = " · ".join(
        f"{_escape_html(l.get('language', ''))} ({_escape_html(l.get('level', ''))})"
        for l in cv_data.get("languages", [])
    )

    dir_attr = 'dir="rtl"' if language == "ar" else ""

    return f"""
    <!DOCTYPE html>
    <html {dir_attr}>
    <head>
        <meta charset="UTF-8"/>
        <style>
            @page {{ size: A4; margin: 25mm 30mm; }}
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: 'Inter', 'Segoe UI', sans-serif; font-size: 9.5pt; color: #111; line-height: 1.5; }}
            .header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }}
            .name {{ font-size: 20pt; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }}
            .contact {{ font-size: 9pt; color: #888; margin-bottom: 30px; }}
            .section-label {{
                font-size: 9pt; text-transform: uppercase; letter-spacing: 2px;
                color: #aaa; margin: 25px 0 12px; font-weight: 600;
            }}
            .summary {{ font-size: 10.5pt; line-height: 1.6; color: #555; margin-bottom: 10px; }}
            .entry {{ display: flex; margin-bottom: 14px; gap: 20px; }}
            .label {{ width: 120px; flex-shrink: 0; font-size: 9pt; color: #999; padding-top: 2px; }}
            .content {{ flex: 1; font-size: 9.5pt; line-height: 1.5; }}
            .bullet {{ color: #666; margin: 3px 0; }}
            .skills {{ font-size: 9.5pt; color: #555; line-height: 1.8; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <div class="name">{name}</div>
                <div class="contact">{email} · {phone}{' · ' + linkedin if linkedin else ''}{' · ' + github if github else ''}</div>
            </div>
            {f'<img src="{personal_info.get("photo_url")}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;" alt="Profile Photo"/>' if personal_info.get("photo_url") else ''}
        </div>

        <div class="section-label">Profil</div>
        <div class="summary">{summary}</div>

        <div class="section-label">Expérience</div>
        {exp_html}

        <div class="section-label">Formation</div>
        {edu_html}

        <div class="section-label">Compétences</div>
        <div class="skills">{skills}</div>

        {"<div class='section-label'>Langues</div><div class='skills'>" + langs + "</div>" if langs else ""}
    </body>
    </html>
    """
from app.services.canva_templates import (
    _generate_canva_1_html,
    _generate_canva_2_html,
    _generate_canva_3_html,
    _generate_canva_4_html,
    _generate_canva_5_html,
    _generate_canva_6_html,
)

TEMPLATE_GENERATORS = {
    "modern": _generate_modern_html,
    "classic": _generate_classic_html,
    "minimal": _generate_minimal_html,
    "canva_1": _generate_canva_1_html,
    "canva_2": _generate_canva_2_html,
    "canva_3": _generate_canva_3_html,
    "canva_4": _generate_canva_4_html,
    "canva_5": _generate_canva_5_html,
    "canva_6": _generate_canva_6_html,
}


def generate_html(
    cv_data: dict,
    personal_info: dict,
    template_id: str = "modern",
    language: str = "fr",
) -> str:
    """
    Generate raw HTML string from structured CV data using a specific template.
    """
    generator = TEMPLATE_GENERATORS.get(template_id, _generate_modern_html)
    return generator(cv_data, personal_info, language)


async def generate_pdf_from_html(html_content: str) -> bytes:
    """
    Generate PDF bytes directly from a raw HTML string.
    """
    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except Exception as e:
        logger.error(f"Custom PDF generation failed: {e}")
        raise ValueError(f"Erreur lors de la génération du PDF: {str(e)}")


async def generate_pdf(
    cv_data: dict,
    personal_info: dict,
    template_id: str = "modern",
    language: str = "fr",
) -> bytes:
    """
    Generate a PDF from structured CV data using a specific template.
    Returns PDF as bytes.
    """
    html_content = generate_html(cv_data, personal_info, template_id, language)

    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()
        logger.info(f"PDF generated: template={template_id}, language={language}, size={len(pdf_bytes)} bytes")
        return pdf_bytes
    except ImportError:
        logger.warning("WeasyPrint not available, returning HTML as fallback")
        return html_content.encode("utf-8")
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise ValueError(f"Erreur lors de la génération du PDF: {str(e)}")
