import logging

logger = logging.getLogger(__name__)

def _escape_html(text: str) -> str:
    """Escape HTML special characters."""
    if not text:
        return ""
    return (
        str(text).replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#x27;")
    )

def _generate_canva_1_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Olivia Wilson style: elegant top header with circle photo, 2 columns below."""
    name = _escape_html(personal_info.get("name", "Name"))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    address = _escape_html(personal_info.get("address", ""))
    summary = _escape_html(cv_data.get("professional_summary", ""))
    
    # Left column: Experience, Reference
    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(f"<li>{_escape_html(bp)}</li>" for bp in exp.get("bullet_points", []))
        exp_html += f'''
        <div class="exp-item">
            <div class="exp-date">{_escape_html(exp.get("start_date", ""))} - {_escape_html(exp.get("end_date", ""))}</div>
            <div class="exp-company">{_escape_html(exp.get("company", ""))}</div>
            <div class="exp-title">{_escape_html(exp.get("title", ""))}</div>
            <ul>{bullets}</ul>
        </div>'''
        
    # Right column: Education, Skills, Languages
    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f'''
        <div class="edu-item">
            <div class="edu-date">{_escape_html(edu.get("start_date", ""))} - {_escape_html(edu.get("end_date", ""))} | {_escape_html(edu.get("institution", ""))}</div>
            <div class="edu-degree">{_escape_html(edu.get("degree", ""))}</div>
            <div class="edu-field">{_escape_html(edu.get("field", ""))}</div>
        </div>'''
        
    skills_html = "".join(f"<li>{_escape_html(s)}</li>" for s in cv_data.get("technical_skills", []))
    langs_html = "".join(f"<li>{_escape_html(l.get('language', ''))} ({_escape_html(l.get('level', ''))})</li>" for l in cv_data.get("languages", []))
    
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{ size: A4; margin: 0; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Georgia', serif; font-size: 10pt; color: #333; background: #fff; }}
        .header {{ padding: 50px; display: flex; align-items: center; border-bottom: 2px solid #ddd; }}
        .photo-placeholder {{ width: 150px; height: 150px; border-radius: 50%; background: #ccc; margin-right: 40px; }}
        .header-content h1 {{ font-size: 32pt; text-transform: uppercase; letter-spacing: 3px; font-weight: normal; margin-bottom: 10px; }}
        .header-content h2 {{ font-size: 16pt; color: #555; font-weight: normal; margin-bottom: 15px; letter-spacing: 1px; }}
        .contact {{ font-family: 'Arial', sans-serif; font-size: 9pt; color: #555; }}
        .contact span {{ display: inline-block; margin-right: 20px; }}
        .summary {{ padding: 40px 50px; text-align: center; font-style: italic; color: #666; line-height: 1.6; border-bottom: 2px solid #ddd; width: 80%; margin: 0 auto; }}
        .main {{ display: flex; padding: 40px 50px; gap: 40px; }}
        .col-left {{ width: 60%; }}
        .col-right {{ width: 40%; }}
        h3 {{ text-transform: uppercase; letter-spacing: 2px; font-size: 12pt; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 20px; color: #444; font-family: 'Arial', sans-serif; font-weight: normal; }}
        .exp-item, .edu-item {{ margin-bottom: 25px; }}
        .exp-date, .edu-date {{ font-family: 'Arial', sans-serif; font-weight: bold; font-size: 9pt; color: #555; margin-bottom: 5px; }}
        .exp-company {{ font-weight: bold; font-size: 11pt; color: #444; }}
        .exp-title, .edu-degree {{ font-weight: bold; font-size: 11pt; color: #444; margin-bottom: 8px; }}
        .edu-field {{ color: #666; }}
        ul {{ padding-left: 20px; margin-top: 8px; font-family: 'Arial', sans-serif; font-size: 9pt; line-height: 1.5; color: #555; }}
        .skills-list, .langs-list {{ list-style-type: disc; margin-bottom: 30px; }}
    </style>
</head>
<body>
    <div class="header">
        {f'<img src="{personal_info.get("photo_url")}" class="photo-placeholder" style="object-fit: cover;" alt="Profile Photo"/>' if personal_info.get("photo_url") else '<div class="photo-placeholder"></div>'}
        <div class="header-content">
            <h1>{name}</h1>
            <h2>Professionnel</h2>
            <div class="contact">
                <span>{phone}</span>
                <span>{email}</span>
                <span>{address}</span>
            </div>
        </div>
    </div>
    <div class="summary">{summary}</div>
    <div class="main">
        <div class="col-left">
            <h3>Expérience</h3>
            {exp_html}
        </div>
        <div class="col-right">
            <h3>Formation</h3>
            {edu_html}
            <h3>Compétences</h3>
            <ul class="skills-list">{skills_html}</ul>
            <h3>Langues</h3>
            <ul class="langs-list">{langs_html}</ul>
        </div>
    </div>
</body>
</html>"""

def _generate_canva_2_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Seema Chaudhry style: Dark blue top right block, white background."""
    name = _escape_html(personal_info.get("name", "Name"))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    address = _escape_html(personal_info.get("address", ""))
    summary = _escape_html(cv_data.get("professional_summary", ""))
    
    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(f"<li>{_escape_html(bp)}</li>" for bp in exp.get("bullet_points", []))
        exp_html += f'''
        <div class="exp-item">
            <div class="exp-header">
                <strong>{_escape_html(exp.get("company", ""))} - {_escape_html(exp.get("title", ""))}</strong>
                <span class="date">{_escape_html(exp.get("start_date", ""))} - {_escape_html(exp.get("end_date", ""))}</span>
            </div>
            <ul>{bullets}</ul>
        </div>'''
        
    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f'''
        <div class="edu-item">
            <div class="edu-header">
                <strong>{_escape_html(edu.get("institution", ""))} - {_escape_html(edu.get("start_date", ""))} - {_escape_html(edu.get("end_date", ""))}</strong>
            </div>
            <ul><li>{_escape_html(edu.get("degree", ""))} - {_escape_html(edu.get("field", ""))}</li></ul>
        </div>'''
        
    skills_html = "".join(f"<li>{_escape_html(s)}</li>" for s in cv_data.get("technical_skills", []))
    langs_html = "".join(f"<li>{_escape_html(l.get('language', ''))}</li>" for l in cv_data.get("languages", []))
    
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{ size: A4; margin: 0; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Arial', sans-serif; font-size: 10pt; color: #222; background: #fff; }}
        .header {{ display: flex; justify-content: space-between; margin-bottom: 30px; position: relative; }}
        .blue-block {{ position: absolute; top: 0; right: 40px; width: 120px; height: 30px; background: #0A2540; }}
        .header-content {{ padding: 50px 50px 0; width: 70%; }}
        h1 {{ font-size: 28pt; color: #0A2540; margin-bottom: 5px; }}
        .subtitle {{ font-size: 14pt; color: #ccc; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px; font-weight: bold; }}
        .contact {{ font-size: 9pt; font-weight: bold; color: #444; }}
        .contact span {{ display: inline-block; margin-right: 20px; }}
        .photo-placeholder {{ width: 120px; height: 120px; background: #ddd; margin-top: 50px; margin-right: 50px; border-radius: 50%; object-fit: cover; }}
        .section {{ padding: 0 50px; margin-bottom: 30px; }}
        h3 {{ text-transform: uppercase; color: #0A2540; font-size: 11pt; border-bottom: 2px solid #0A2540; padding-bottom: 5px; margin-bottom: 15px; }}
        p.summary {{ line-height: 1.5; color: #444; font-size: 9.5pt; }}
        .exp-item, .edu-item {{ margin-bottom: 20px; }}
        .exp-header, .edu-header {{ display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 10pt; color: #0A2540; }}
        ul {{ padding-left: 20px; line-height: 1.6; font-size: 9.5pt; color: #444; }}
        .skills-langs {{ display: flex; gap: 50px; }}
        .skills-langs div {{ flex: 1; }}
        .skills-langs ul {{ list-style-type: disc; padding-left: 20px; }}
        .skills-langs li {{ display: inline-block; width: 45%; margin-bottom: 8px; vertical-align: top; }}
    </style>
</head>
<body>
    <div class="header">
        <div class="blue-block"></div>
        <div class="header-content">
            <h1>{name}</h1>
            <div class="subtitle">Professionnel</div>
            <div class="contact">
                <span>{phone}</span>
                <span>{address}</span>
                <span>{email}</span>
            </div>
        </div>
        {f'<img src="{personal_info.get("photo_url")}" class="photo-placeholder" alt="Profile Photo"/>' if personal_info.get("photo_url") else '<div class="photo-placeholder"></div>'}
    </div>
    
    <div class="section">
        <h3>À Propos</h3>
        <p class="summary">{summary}</p>
    </div>
    
    <div class="section">
        <h3>Formation</h3>
        {edu_html}
    </div>
    
    <div class="section">
        <h3>Expérience Professionnelle</h3>
        {exp_html}
    </div>
    
    <div class="section skills-langs">
        <div>
            <h3>Compétences</h3>
            <ul>{skills_html}</ul>
        </div>
        <div>
            <h3>Langues</h3>
            <ul>{langs_html}</ul>
        </div>
    </div>
</body>
</html>"""

def _generate_canva_3_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Sacha Dubois style: Grey sidebar left, Dark blue header right."""
    name = _escape_html(personal_info.get("name", "Name"))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    address = _escape_html(personal_info.get("address", ""))
    
    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(f"<li>{_escape_html(bp)}</li>" for bp in exp.get("bullet_points", []))
        exp_html += f'''
        <div class="timeline-item">
            <div class="title">{_escape_html(exp.get("title", ""))} <span class="date">{_escape_html(exp.get("start_date", ""))} - {_escape_html(exp.get("end_date", ""))}</span></div>
            <div class="company">{_escape_html(exp.get("company", ""))}</div>
            <ul>{bullets}</ul>
        </div>'''
        
    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f'''
        <div class="timeline-item">
            <div class="title">{_escape_html(edu.get("degree", ""))} <span class="date">{_escape_html(edu.get("start_date", ""))} - {_escape_html(edu.get("end_date", ""))}</span></div>
            <div class="company">{_escape_html(edu.get("institution", ""))}</div>
        </div>'''
        
    skills_html = "".join(f"<div class='skill-item'>{_escape_html(s)}</div>" for s in cv_data.get("technical_skills", []))
    langs_html = "".join(f"<div class='skill-item'>{_escape_html(l.get('language', ''))}</div>" for l in cv_data.get("languages", []))
    
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{ size: A4; margin: 0; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Arial', sans-serif; font-size: 10pt; background: #fff; display: flex; height: 297mm; }}
        .sidebar {{ width: 33%; background: #E5E7EB; padding: 40px 30px; display: flex; flex-direction: column; }}
        .main {{ width: 67%; display: flex; flex-direction: column; }}
        .header {{ background: #0F3057; color: white; padding: 60px 40px; height: 180px; display: flex; flex-direction: column; justify-content: center; }}
        .content {{ padding: 40px; }}
        .photo-placeholder {{ width: 100%; height: 200px; background: #ccc; border: 5px solid white; margin-bottom: 40px; object-fit: cover; border-radius: 10px; }}
        h1 {{ font-size: 28pt; margin-bottom: 10px; font-weight: bold; }}
        .subtitle {{ font-size: 14pt; font-style: italic; opacity: 0.9; }}
        .sidebar-section {{ margin-bottom: 30px; color: #0F3057; }}
        .sidebar-section h3 {{ font-size: 12pt; margin-bottom: 15px; border-bottom: 2px solid #0F3057; padding-bottom: 5px; }}
        .contact-item {{ margin-bottom: 10px; font-size: 9pt; font-weight: bold; }}
        .skill-item {{ margin-bottom: 8px; font-size: 9pt; color: #333; }}
        .content-section {{ margin-bottom: 30px; }}
        .content-section h3 {{ color: #0F3057; font-size: 14pt; margin-bottom: 20px; }}
        .timeline-item {{ margin-bottom: 20px; border-left: 2px solid #0F3057; padding-left: 15px; position: relative; }}
        .timeline-item::before {{ content: ''; position: absolute; left: -6px; top: 5px; width: 10px; height: 10px; background: #0F3057; border-radius: 50%; }}
        .title {{ font-size: 11pt; font-weight: bold; color: #0F3057; display: flex; justify-content: space-between; margin-bottom: 4px; }}
        .date {{ font-size: 9pt; font-style: italic; color: #666; font-weight: normal; }}
        .company {{ font-size: 10pt; font-style: italic; color: #444; margin-bottom: 8px; }}
        ul {{ padding-left: 20px; line-height: 1.5; font-size: 9.5pt; color: #444; }}
    </style>
</head>
<body>
    <div class="sidebar">
        {f'<img src="{personal_info.get("photo_url")}" class="photo-placeholder" alt="Profile Photo"/>' if personal_info.get("photo_url") else '<div class="photo-placeholder"></div>'}
        <div class="sidebar-section">
            <h3>Coordonnées</h3>
            <div class="contact-item">{phone}</div>
            <div class="contact-item">{email}</div>
            <div class="contact-item">{address}</div>
        </div>
        <div class="sidebar-section">
            <h3>Langues</h3>
            {langs_html}
        </div>
        <div class="sidebar-section">
            <h3>Compétences</h3>
            {skills_html}
        </div>
    </div>
    <div class="main">
        <div class="header">
            <h1>{name}</h1>
            <div class="subtitle">Professionnel</div>
        </div>
        <div class="content">
            <div class="content-section">
                <h3>Formation</h3>
                {edu_html}
            </div>
            <div class="content-section">
                <h3>Expérience Professionnelle</h3>
                {exp_html}
            </div>
        </div>
    </div>
</body>
</html>"""

def _generate_canva_4_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Marianne Girard style: Beige/brown accents, elegant timeline."""
    name = _escape_html(personal_info.get("name", "Name"))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    address = _escape_html(personal_info.get("address", ""))
    summary = _escape_html(cv_data.get("professional_summary", ""))
    
    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(f"<li>{_escape_html(bp)}</li>" for bp in exp.get("bullet_points", []))
        exp_html += f'''
        <div class="flex-row">
            <div class="side-date">
                <span class="dot"></span>{_escape_html(exp.get("start_date", ""))} - {_escape_html(exp.get("end_date", ""))}
                <br><strong>{_escape_html(exp.get("company", ""))}</strong>
            </div>
            <div class="main-content">
                <div class="title">{_escape_html(exp.get("title", ""))}</div>
                <ul>{bullets}</ul>
            </div>
        </div>'''
        
    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f'''
        <div class="flex-row">
            <div class="side-date">
                <span class="dot"></span>{_escape_html(edu.get("start_date", ""))} - {_escape_html(edu.get("end_date", ""))}
                <br><strong>{_escape_html(edu.get("institution", ""))}</strong>
            </div>
            <div class="main-content">
                <div class="title">{_escape_html(edu.get("degree", ""))}</div>
                <div style="font-size: 9.5pt; color: #555;">{_escape_html(edu.get("field", ""))}</div>
            </div>
        </div>'''
        
    skills_html = "".join(f"<li>{_escape_html(s)}</li>" for s in cv_data.get("technical_skills", []))
    langs_html = "".join(f"<li>{_escape_html(l.get('language', ''))}</li>" for l in cv_data.get("languages", []))
    
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{ size: A4; margin: 0; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Trebuchet MS', sans-serif; font-size: 10pt; color: #333; background: #fff; padding: 40px; }}
        .header {{ display: flex; align-items: center; margin-bottom: 20px; }}
        .photo-placeholder {{ width: 140px; height: 140px; border-radius: 50%; background: #ccc; margin-right: 30px; object-fit: cover; }}
        .header-content h1 {{ font-size: 26pt; color: #111; letter-spacing: 2px; margin-bottom: 8px; text-transform: uppercase; }}
        .subtitle {{ font-size: 14pt; color: #BFA588; margin-bottom: 15px; }}
        .contact {{ font-size: 9pt; color: #555; }}
        .contact span {{ display: inline-block; margin-right: 20px; }}
        .summary {{ font-size: 9pt; line-height: 1.5; color: #444; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #E5E5E5; }}
        h3 {{ color: #BFA588; text-transform: uppercase; font-size: 11pt; letter-spacing: 2px; margin-bottom: 20px; margin-top: 10px; }}
        .flex-row {{ display: flex; margin-bottom: 20px; }}
        .side-date {{ width: 25%; font-size: 8pt; color: #888; text-transform: uppercase; padding-right: 20px; position: relative; }}
        .side-date strong {{ color: #444; font-size: 9pt; display: block; margin-top: 5px; }}
        .dot {{ position: absolute; left: -8px; top: 3px; width: 4px; height: 4px; background: #BFA588; border-radius: 50%; display: none; }}
        .main-content {{ width: 75%; border-left: 1px solid #E5E5E5; padding-left: 20px; }}
        .title {{ font-size: 10pt; font-weight: bold; color: #222; text-transform: uppercase; margin-bottom: 5px; }}
        ul {{ padding-left: 15px; font-size: 9pt; line-height: 1.5; color: #444; list-style-type: square; }}
        .bottom-grid {{ display: flex; justify-content: space-between; border-top: 1px solid #E5E5E5; padding-top: 20px; margin-top: 20px; }}
        .bottom-col {{ width: 30%; }}
        .bottom-col ul {{ list-style-type: none; padding: 0; }}
        .bottom-col li {{ font-size: 9pt; margin-bottom: 5px; color: #444; }}
        .skill-list-inline li {{ display: inline-block; margin-right: 15px; margin-bottom: 8px; }}
    </style>
</head>
<body>
    <div class="header">
        {f'<img src="{personal_info.get("photo_url")}" class="photo-placeholder" alt="Profile Photo"/>' if personal_info.get("photo_url") else '<div class="photo-placeholder"></div>'}
        <div class="header-content">
            <h1>{name}</h1>
            <div class="subtitle">Professionnel</div>
            <div class="contact">
                <span>{email}</span>
                <span>{phone}</span>
                <span>{address}</span>
            </div>
        </div>
    </div>
    
    <div class="summary">{summary}</div>
    
    <h3>Expériences Professionnelles</h3>
    {exp_html}
    
    <h3>Parcours Scolaire</h3>
    {edu_html}
    
    <div class="bottom-grid">
        <div class="bottom-col">
            <h3>Langues</h3>
            <ul>{langs_html}</ul>
        </div>
        <div class="bottom-col" style="width: 60%">
            <h3>Compétences</h3>
            <ul class="skill-list-inline">
                {skills_html}
            </ul>
        </div>
    </div>
</body>
</html>"""

def _generate_canva_5_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Dominique Marchet style: Black and white elegant, 2 cols (small left, wide right)."""
    name = _escape_html(personal_info.get("name", "Name"))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    address = _escape_html(personal_info.get("address", ""))
    summary = _escape_html(cv_data.get("professional_summary", ""))
    
    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(f"<li>{_escape_html(bp)}</li>" for bp in exp.get("bullet_points", []))
        exp_html += f'''
        <div class="item">
            <div class="title">{_escape_html(exp.get("title", ""))}</div>
            <div class="meta">{_escape_html(exp.get("company", ""))} | {_escape_html(exp.get("start_date", ""))} - {_escape_html(exp.get("end_date", ""))}</div>
            <ul>{bullets}</ul>
        </div>'''
        
    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f'''
        <div class="item">
            <div class="title">{_escape_html(edu.get("degree", ""))}</div>
            <div class="meta">{_escape_html(edu.get("institution", ""))}</div>
            <div class="meta">{_escape_html(edu.get("start_date", ""))} - {_escape_html(edu.get("end_date", ""))}</div>
        </div>'''
        
    skills_html = "".join(f"<div class='skill'>{_escape_html(s)}</div>" for s in cv_data.get("technical_skills", []))
    langs_html = "".join(f"<div class='skill'>{_escape_html(l.get('language', ''))}</div>" for l in cv_data.get("languages", []))
    
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{ size: A4; margin: 0; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Verdana', sans-serif; font-size: 9.5pt; color: #111; background: #fff; padding: 40px; }}
        .header {{ display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }}
        .photo-placeholder {{ width: 120px; height: 140px; background: #333; margin-right: 30px; object-fit: cover; border-radius: 10px; }}
        .header-main {{ flex: 1; }}
        h1 {{ font-size: 28pt; text-transform: uppercase; line-height: 1.1; margin-bottom: 5px; }}
        .subtitle {{ font-size: 11pt; text-transform: uppercase; letter-spacing: 2px; }}
        .header-contact {{ width: 250px; font-size: 8.5pt; line-height: 1.6; text-align: left; padding-left: 20px; border-left: 1px solid #ccc; }}
        .section-header {{ text-transform: uppercase; font-size: 11pt; letter-spacing: 1px; margin-bottom: 15px; margin-top: 25px; font-weight: bold; }}
        .summary {{ font-size: 9pt; line-height: 1.6; border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 20px; }}
        .cols {{ display: flex; gap: 40px; }}
        .col-left {{ width: 35%; border-right: 1px solid #ccc; padding-right: 40px; }}
        .col-right {{ width: 65%; }}
        .item {{ margin-bottom: 20px; }}
        .title {{ font-weight: bold; text-transform: uppercase; font-size: 9pt; margin-bottom: 3px; }}
        .meta {{ font-size: 8.5pt; color: #444; margin-bottom: 8px; }}
        ul {{ padding-left: 15px; font-size: 9pt; line-height: 1.5; }}
        .skill {{ font-size: 9pt; margin-bottom: 5px; font-weight: bold; }}
    </style>
</head>
<body>
    <div class="header">
        {f'<img src="{personal_info.get("photo_url")}" class="photo-placeholder" alt="Profile Photo"/>' if personal_info.get("photo_url") else '<div class="photo-placeholder"></div>'}
        <div class="header-main">
            <h1>{name}</h1>
            <div class="subtitle">Professionnel</div>
        </div>
        <div class="header-contact">
            <div>{email}</div>
            <div>{phone}</div>
            <div>{address}</div>
        </div>
    </div>
    
    <div class="section-header">Profil</div>
    <div class="summary">{summary}</div>
    
    <div class="cols">
        <div class="col-left">
            <div class="section-header">Formation</div>
            {edu_html}
            
            <div class="section-header">Compétences</div>
            {skills_html}
            
            <div class="section-header">Langues</div>
            {langs_html}
        </div>
        <div class="col-right">
            <div class="section-header">Expérience</div>
            {exp_html}
        </div>
    </div>
</body>
</html>"""

def _generate_canva_6_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Estelle Darcy style: Blue lines, centered text, professional."""
    name = _escape_html(personal_info.get("name", "Name"))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    address = _escape_html(personal_info.get("address", ""))
    summary = _escape_html(cv_data.get("professional_summary", ""))
    
    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(f"<li>{_escape_html(bp)}</li>" for bp in exp.get("bullet_points", []))
        exp_html += f'''
        <div class="item">
            <div class="item-header">
                <strong>{_escape_html(exp.get("title", ""))} - {_escape_html(exp.get("company", ""))}</strong>
                <span>{_escape_html(exp.get("start_date", ""))} - {_escape_html(exp.get("end_date", ""))}</span>
            </div>
            <ul>{bullets}</ul>
        </div>'''
        
    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f'''
        <div class="item">
            <div class="item-header">
                <strong>{_escape_html(edu.get("degree", ""))}</strong>
                <span>{_escape_html(edu.get("start_date", ""))} - {_escape_html(edu.get("end_date", ""))}</span>
            </div>
            <div class="meta">{_escape_html(edu.get("institution", ""))}</div>
            <div class="meta">{_escape_html(edu.get("field", ""))}</div>
        </div>'''
        
    skills = " | ".join(f"{_escape_html(s)}" for s in cv_data.get("technical_skills", []))
    langs = ", ".join(f"{_escape_html(l.get('language', ''))}" for l in cv_data.get("languages", []))
    
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{ size: A4; margin: 0; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Helvetica', sans-serif; font-size: 10pt; color: #111; background: #fff; padding: 50px; }}
        .header {{ text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 15px; }}
        h1 {{ font-size: 24pt; margin-bottom: 5px; text-transform: uppercase; font-weight: bold; }}
        .subtitle {{ font-size: 14pt; color: #0056b3; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }}
        .contact {{ font-size: 9.5pt; color: #444; }}
        h3 {{ color: #0056b3; text-transform: uppercase; font-size: 11pt; border-bottom: 1px solid #0056b3; padding-bottom: 3px; margin-bottom: 10px; margin-top: 20px; }}
        .summary {{ font-size: 9.5pt; line-height: 1.5; margin-bottom: 20px; }}
        .item {{ margin-bottom: 15px; }}
        .item-header {{ display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 3px; }}
        .meta {{ font-size: 9.5pt; color: #444; margin-bottom: 3px; }}
        .skills-list {{ font-size: 9.5pt; line-height: 1.6; margin-bottom: 20px; }}
        .photo-placeholder {{ width: 120px; height: 120px; border-radius: 50%; background: #ccc; margin: 0 auto 15px; object-fit: cover; display: block; border: 2px solid #0056b3; }}
    </style>
</head>
<body>
    <div class="header">
        {f'<img src="{personal_info.get("photo_url")}" class="photo-placeholder" alt="Profile Photo"/>' if personal_info.get("photo_url") else ''}
        <h1>{name}</h1>
        <div class="subtitle">Professionnel</div>
        <div class="contact">{address} | {email} | {phone}</div>
    </div>
    
    <h3>Summary</h3>
    <div class="summary">{summary}</div>
    
    <h3>Professional Experience</h3>
    {exp_html}
    
    <h3>Skills</h3>
    <div class="skills-list">{skills}</div>
    
    <h3>Education</h3>
    {edu_html}
    
    <h3>Languages</h3>
    <div class="skills-list">{langs}</div>
</body>
</html>"""

def _generate_canva_7_html(cv_data: dict, personal_info: dict, language: str = "fr") -> str:
    """Yassin Mekni style: Orange background right sidebar, white left main."""
    name = _escape_html(personal_info.get("name", "Name"))
    email = _escape_html(personal_info.get("email", ""))
    phone = _escape_html(personal_info.get("phone", ""))
    address = _escape_html(personal_info.get("address", ""))
    summary = _escape_html(cv_data.get("professional_summary", ""))
    
    exp_html = ""
    for exp in cv_data.get("experience", []):
        bullets = "".join(f"<li>{_escape_html(bp)}</li>" for bp in exp.get("bullet_points", []))
        exp_html += f'''
        <div class="item">
            <div class="item-header">
                <span class="title">{_escape_html(exp.get("title", ""))}</span>
                <span class="date">{_escape_html(exp.get("start_date", ""))} - {_escape_html(exp.get("end_date", ""))}</span>
            </div>
            <div class="meta"><strong>{_escape_html(exp.get("company", ""))}</strong></div>
            <ul>{bullets}</ul>
        </div>'''
        
    edu_html = ""
    for edu in cv_data.get("education", []):
        edu_html += f'''
        <div class="item">
            <div class="item-header">
                <span class="title">{_escape_html(edu.get("degree", ""))}</span>
                <span class="date">{_escape_html(edu.get("start_date", ""))} - {_escape_html(edu.get("end_date", ""))}</span>
            </div>
            <div class="meta"><strong>{_escape_html(edu.get("institution", ""))}</strong></div>
            <div class="meta">{_escape_html(edu.get("field", ""))}</div>
        </div>'''
        
    skills_html = "".join(f"<div class='skill-box'>{_escape_html(s)}</div>" for s in cv_data.get("technical_skills", []))
    langs_html = "".join(f"<div class='skill-box'>{_escape_html(l.get('language', ''))}</div>" for l in cv_data.get("languages", []))
    
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{ size: A4; margin: 0; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Arial', sans-serif; font-size: 10pt; color: #333; display: flex; height: 297mm; margin: 0; }}
        .main {{ width: 60%; padding: 40px; background: white; }}
        .sidebar {{ width: 40%; background: #D35400; color: white; padding: 40px; }}
        h1 {{ font-size: 32pt; margin-bottom: 20px; line-height: 1; font-weight: bold; }}
        .contact div {{ font-size: 10pt; margin-bottom: 5px; }}
        h3.main-h3 {{ color: #D35400; font-size: 16pt; border-bottom: 2px solid #D35400; padding-bottom: 5px; margin-bottom: 15px; margin-top: 25px; }}
        h3.side-h3 {{ color: white; font-size: 16pt; border-bottom: 2px solid white; padding-bottom: 5px; margin-bottom: 15px; margin-top: 30px; }}
        .summary {{ font-size: 10pt; line-height: 1.5; margin-bottom: 20px; }}
        .item {{ margin-bottom: 20px; }}
        .item-header {{ display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }}
        .title {{ font-size: 12pt; font-weight: bold; color: #333; width: 75%; }}
        .date {{ font-size: 9pt; color: #888; text-align: right; width: 25%; }}
        .meta {{ font-size: 10pt; margin-bottom: 5px; color: #111; }}
        .skill-box {{ background: rgba(255,255,255,0.2); border-radius: 4px; padding: 10px; margin-bottom: 10px; font-size: 9pt; border: 1px solid rgba(255,255,255,0.4); }}
        .photo-placeholder {{ width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,0.3); margin: 0 auto 20px; object-fit: cover; display: block; border: 4px solid white; }}
    </style>
</head>
<body>
    <div class="main">
        <h3 class="main-h3">Profil</h3>
        <div class="summary">{summary}</div>
        
        <h3 class="main-h3">Expérience Professionnelle</h3>
        {exp_html}
        
        <h3 class="main-h3">Formation</h3>
        {edu_html}
    </div>
    <div class="sidebar">
        {f'<img src="{personal_info.get("photo_url")}" class="photo-placeholder" alt="Profile Photo"/>' if personal_info.get("photo_url") else ''}
        <h1>{name}</h1>
        <div class="contact">
            <div>{email}</div>
            <div>{phone}</div>
            <div>{address}</div>
        </div>
        
        <h3 class="side-h3">Compétences</h3>
        {skills_html}
        
        <h3 class="side-h3">Langues</h3>
        {langs_html}
    </div>
</body>
</html>"""
