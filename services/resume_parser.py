import io
import re
import zipfile
import zlib
import xml.etree.ElementTree as ET

def parse_docx_bytes(file_bytes):
    """Extract full plain text from docx, including paragraphs and tables."""
    # 1. Try python-docx for high-fidelity extraction
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        chunks = []
        for p in doc.paragraphs:
            if p.text.strip():
                chunks.append(p.text.strip())
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    ctext = cell.text.strip()
                    if ctext and ctext not in chunks:
                        chunks.append(ctext)
        result = "\n".join(chunks).strip()
        if len(result) >= 10:
            return result
    except Exception:
        pass

    # 2. Fallback to direct XML parsing via built-in zipfile
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as docx_zip:
            xml_content = docx_zip.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            text_nodes = tree.findall(".//w:t", ns)
            texts = [node.text for node in text_nodes if node.text]
            return "\n".join(texts)
    except Exception:
        return ""

def parse_pdf_bytes(file_bytes):
    """Extract complete text from PDF using pypdf with robust fallback."""
    # 1. Primary extractor: pypdf (handles font encodings, CMaps, object streams)
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages_text = []
        for page in reader.pages:
            try:
                txt = page.extract_text()
                if txt and txt.strip():
                    pages_text.append(txt.strip())
            except Exception:
                pass
        extracted = "\n\n".join(pages_text).strip()
        if len(extracted) >= 15:
            return extracted
    except Exception:
        pass

    # 2. Fallback: zlib stream decompression
    try:
        text_pieces = []
        stream_matches = re.finditer(rb"stream[\r\n]+(.*?)[\r\n]+endstream", file_bytes, re.DOTALL)
        for m in stream_matches:
            raw = m.group(1)
            try:
                decompressed = zlib.decompress(raw)
            except Exception:
                decompressed = raw

            strings = re.findall(rb"\((.*?)\)\s*T[jJ]", decompressed)
            for s in strings:
                try:
                    decoded = s.decode("latin1", errors="ignore")
                    if decoded.strip():
                        text_pieces.append(decoded)
                except Exception:
                    pass

            bracket_blocks = re.findall(rb"\[(.*?)\]\s*TJ", decompressed)
            for block in bracket_blocks:
                sub_strings = re.findall(rb"\((.*?)\)", block)
                for s in sub_strings:
                    try:
                        decoded = s.decode("latin1", errors="ignore")
                        if decoded.strip():
                            text_pieces.append(decoded)
                    except Exception:
                        pass

        extracted = " ".join(text_pieces).strip()
        if len(extracted) >= 20:
            return extracted

        # 3. Last-resort fallback: extract printable character sequences
        ascii_strings = re.findall(rb"[A-Za-z0-9 ,.\-_:;()/@\n]{4,}", file_bytes)
        decoded_chunks = [c.decode("latin1", errors="ignore").strip() for c in ascii_strings if len(c.strip()) > 3]
        return "\n".join(decoded_chunks)
    except Exception:
        return ""

def parse_resume_file(filename, file_bytes):
    """Parses an uploaded resume file (.txt, .md, .docx, .pdf, .rtf) and returns extracted text."""
    lower_name = (filename or "").lower()
    text = ""

    if lower_name.endswith(".docx"):
        text = parse_docx_bytes(file_bytes)
    elif lower_name.endswith(".pdf"):
        text = parse_pdf_bytes(file_bytes)
    else:
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text = file_bytes.decode("latin1")
            except Exception:
                text = ""

    # Clean up formatting, normalize whitespace and unicode quotes/dashes
    clean_text = text.replace("\r\n", "\n").replace("\r", "\n")
    clean_text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", " ", clean_text)
    clean_text = re.sub(r"\n{3,}", "\n\n", clean_text).strip()

    words = len(clean_text.split()) if clean_text else 0
    return {
        "filename": filename,
        "text": clean_text,
        "chars": len(clean_text),
        "words": words
    }

# Six Diverse Real-World Resumes for Testing Across Different Career Phases
SAMPLE_PERSONAS = {
    "fresher": {
        "title": "College Fresher (Foundation Phase)",
        "phase": "Early Foundation",
        "description": "BCA / CS Graduate with academic fundamentals in Python, SQL, HTML, and Git. Ideal for testing entry-level skill gaps.",
        "recommended_role": "Backend Developer",
        "resume": """Rohan Verma — Computer Applications Graduate
Bengaluru, India | github.com/rohan-verma-dev

CAREER OBJECTIVE:
Motivated BCA graduate seeking an entry-level software engineering role. Strong foundation in core programming, relational databases, and clean code principles. Eager to contribute to web services and APIs.

EDUCATION:
Bachelor of Computer Applications (BCA) — CGPA 8.4/10 (2024)

TECHNICAL SKILLS:
- Programming Languages: Python, JavaScript, HTML, CSS, SQL
- Version Control: Git, GitHub
- Databases: SQLite, MySQL basics
- Core Concepts: Data Structures, Algorithms, Object-Oriented Programming

ACADEMIC PROJECTS:
1. Student Performance Analytics Portal
- Built a database-backed student tracking system using Python and SQLite.
- Executed SQL queries with table joins to generate semester grade reports.
- Used Git for version control and issue tracking.

2. Personal Portfolio Website
- Developed a responsive personal website using HTML, CSS, and basic JavaScript.
- Deployed on GitHub Pages with clean semantic structure.

EXTRA-CURRICULAR:
- Active participant in college coding hackathons.
- Solved 100+ Data Structures problems on LeetCode."""
    },

    "mid_backend": {
        "title": "Backend Developer (Applied Build Phase)",
        "phase": "Experienced / Job-Ready",
        "description": "2+ years experience building web services with Python, Flask, Django, SQL, PostgreSQL, REST APIs, Git, and Docker.",
        "recommended_role": "Backend Developer",
        "resume": """Alex Morgan — Backend Software Engineer
Austin, TX | github.com/alexmorgan-dev

PROFESSIONAL SUMMARY:
Results-driven Backend Engineer with 2+ years of experience designing robust RESTful APIs, scalable microservices, and database schemas. Proficient in Python, Flask, Django, SQL, PostgreSQL, Docker, and Linux environments.

TECHNICAL COMPETENCIES:
- Languages: Python, SQL, JavaScript
- Frameworks & Libraries: Flask, Django, REST APIs, pytest
- Databases: PostgreSQL, SQLite
- DevOps & Tools: Docker, Linux, Git, GitHub Actions, CI/CD
- Testing: Unit testing, automated testing with pytest

WORK EXPERIENCE:
Software Engineer — CloudScale Technologies (2023 – Present)
- Architected and deployed 12+ REST APIs using Python and Flask, handling 50k+ daily HTTP requests.
- Integrated PostgreSQL schemas with indexed query optimizations, reducing latency by 35%.
- Containerized development and staging environments using Docker and Docker Compose.
- Authored automated testing suites using pytest, achieving 88% test coverage across core modules.
- Managed Linux production instances via SSH and automated bash deployment scripts.

EDUCATION:
B.S. in Computer Science — University of Texas at Austin"""
    },

    "frontend_lead": {
        "title": "Frontend & UI Engineer (Specialist Phase)",
        "phase": "Frontend Specialist",
        "description": "Strong interface developer specializing in React, Next.js, TypeScript, Tailwind CSS, HTML, CSS, and REST APIs.",
        "recommended_role": "Frontend Developer",
        "resume": """Priya Sharma — Senior Frontend Engineer
Seattle, WA | github.com/priyasharma-ui

SUMMARY:
Frontend Engineer passionate about building accessible, responsive, and blazing-fast user interfaces. Specialized in React, Next.js, TypeScript, and modern component systems.

CORE TECHNICAL SKILLS:
- Frontend Core: HTML, HTML5, CSS, CSS3, JavaScript, TypeScript
- Frameworks: React, React.js, Next.js, Tailwind CSS
- Tooling: Git, REST APIs, Vite, Jest, automated testing
- UI/UX: Responsive design, web accessibility (WCAG), performance optimization

PROJECTS & EXPERIENCE:
Frontend Developer — Nexa Interfaces (2022 – 2024)
- Developed customer-facing dashboard features using React, Next.js, and TypeScript.
- Styled responsive design components using Tailwind CSS, reducing CSS bundle size by 40%.
- Integrated REST APIs for live data streaming, user authentication, and error boundaries.
- Implemented unit testing and snapshot tests to prevent UI regressions.
- Managed version control workflows in Git with code reviews and branch management."""
    },

    "data_analyst": {
        "title": "Data Analyst (Analytics Phase)",
        "phase": "Data & Insights Specialist",
        "description": "Strong analytical background with SQL, Python, Pandas, Machine Learning, and executive communication.",
        "recommended_role": "Data Analyst",
        "resume": """David Chen — Data Analyst & BI Specialist
Chicago, IL | linkedin.com/in/davidchen-data

SUMMARY:
Data Analyst with expertise in querying complex relational datasets, building Python data pipelines, and translating business metrics into actionable executive dashboards.

TECHNICAL CAPABILITIES:
- Languages & Analysis: SQL, Python, Pandas, Machine Learning basics, Data Structures
- Visualization & BI: Tableau, PowerBI, exploratory data analysis
- Professional Skills: Written communication, verbal communication, stakeholder reporting
- Databases: PostgreSQL, SQL Server, SQLite

EXPERIENCE:
Business Intelligence Analyst — Apex Retail Group (2023 – Present)
- Wrote advanced SQL queries involving multi-table joins, window functions, and CTEs to analyze $10M+ in annual sales.
- Developed automated Python data cleaning scripts using Pandas to clean and reconcile messy CSV and JSON feeds.
- Built a predictive customer churn machine learning regression model with scikit-learn.
- Delivered weekly verbal communication presentations and executive summaries to department leads."""
    },

    "devops_cloud": {
        "title": "Cloud & DevOps Apprentice (Infrastructure Phase)",
        "phase": "Cloud & Infrastructure",
        "description": "Infrastructure enthusiast with Linux, Git, Docker, Kubernetes, AWS, CI/CD, and Python automation.",
        "recommended_role": "Cloud / DevOps Intern",
        "resume": """Marcus Wright — Cloud & DevOps Associate
New York, NY | github.com/marcus-clouddev

SUMMARY:
Cloud and DevOps engineer focused on reproducible infrastructure, container orchestration, and continuous integration pipelines.

TECHNICAL SKILLS:
- Cloud & Infrastructure: AWS (EC2, S3, IAM, CloudWatch), Linux, Bash, Shell scripting
- Containers & CI/CD: Docker, Kubernetes, CI/CD with GitHub Actions
- Programming: Python for automation, testing
- Tools: Git, version control, automated testing

KEY PROJECTS:
1. Automated Cloud CI/CD Pipeline
- Configured a GitHub Actions CI/CD workflow to run automated unit testing and build Docker container images.
- Automated deployment to AWS ECS using Python automation scripts and bash.

2. Linux Server Hardening & Monitoring
- Administered Ubuntu Linux server environments with user permission controls, SSH keys, and firewall configurations.
- Containerized full-stack applications with Docker and deployed multi-pod clusters on Kubernetes."""
    },

    "career_switcher": {
        "title": "Career Switcher / Transitioning into Tech (Ground Zero Phase)",
        "phase": "Career Pivot",
        "description": "Background in customer operations and project management with introductory HTML and communication skills.",
        "recommended_role": "Frontend Developer",
        "resume": """Elena Rostova — Career Transition Candidate
Denver, CO | linkedin.com/in/elena-rostova

PROFESSIONAL SUMMARY:
Experienced Customer Operations Manager transitioning into software engineering. Strong strengths in stakeholder communication, project coordination, and analytical problem-solving. Currently completing web development fundamentals.

CORE SKILLS:
- Technical Skills: HTML, HTML5 basics, Git basics, SQL introductory queries
- Professional Competencies: Written communication, verbal communication, cross-functional collaboration, documentation
- Ongoing Learning: JavaScript, responsive design with CSS, Python basics

RELEVANT EXPERIENCE:
Operations Coordinator — Horizon Logistics (2021 – 2024)
- Managed communication across 20+ vendors and technical support engineers.
- Maintained departmental intranet documentation using HTML.
- Queried customer shipment databases using basic SQL to resolve account discrepancies.
- Documented standard operating procedures and prepared executive walkthroughs."""
    }
}
