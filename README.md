# 🚀 SkillSync Career Coach
### AI-Powered Career Readiness & Skill Gap Analysis Platform

**Know your skills. Identify your gaps. Build your future.**

SkillSync Career Coach is an intelligent, responsive career guidance and skill readiness platform built with **Python and Flask**. It helps candidates evaluate their technical readiness for specific job roles by comparing resume competencies against industry-relevant skill requirements.

The platform provides transparent skill gap analysis, personalized learning priorities, actionable mini-project recommendations, and a structured three-stage learning roadmap to help candidates move closer to their career goals.

---

## ✨ Key Features

### 1. 🎯 Career Readiness Analyzer
- Analyze resume skills against targeted job descriptions.
- Calculate keyword overlap and skill match scores.
- Identify matched, missing, and additional competencies.
- Interactive radial SVG progress visualization.
- Quick-select career role presets.
- Drag-and-drop resume upload functionality.
- Actionable diagnostic insights to understand skill gaps.

### 2. 🗺️ Personalized Learning Roadmap
A dedicated learning dashboard available at `/roadmap`.

- Automatically generates a structured three-stage learning roadmap.
- Prioritizes missing skills based on career relevance.
- Categorizes learning priorities into High, Medium, and Explore.
- Provides actionable mini-project blueprints for practical learning.
- Includes relevant documentation and learning resources.
- Interactive progress tracking with automatically recalculated completion percentages.
- Search and filter learning tasks by skill priority and category.

### 3. 📊 Interactive Progress Tracking
- Track completed and pending learning milestones.
- Real-time progress bar updates.
- Persistent checklist state using browser `localStorage`.
- Resume your learning journey across browser sessions.
- Monitor overall roadmap completion.

### 4. 🎨 Modern UI & User Experience
- Enterprise-inspired dashboard design.
- Modern glassmorphism and gradient accents.
- Refined typography using Plus Jakarta Sans, Inter, and JetBrains Mono.
- Seamless Dark Mode and Light Mode switching.
- Responsive desktop sidebar navigation.
- Mobile-friendly navigation drawer.
- Smooth transitions and interactive animations.
- Clean, accessible, and intuitive layouts.

### 5. 📤 Export & Portability
- Export the complete learning roadmap as Markdown.
- Copy learning plans directly into Notion, Obsidian, or GitHub.
- Print-ready layouts with custom print stylesheets.
- Generate PDF reports using the browser's print functionality.

### 6. 🔒 Privacy-First Architecture
- Resume content is processed in memory.
- No permanent server-side resume storage.
- No database dependency.
- Learning checklist progress is stored locally in the browser.
- No external tracking infrastructure.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Backend | Python, Flask |
| Frontend | HTML5, CSS3, JavaScript |
| UI Design | Glassmorphism, Responsive Design, CSS Animations |
| Typography | Plus Jakarta Sans, Inter, JetBrains Mono |
| Data Processing | Python Regex, Custom Skill Taxonomy |
| Resume Parsing | PDF, DOCX, TXT, Markdown |
| Visualization | SVG, CSS Progress Indicators |
| Client Storage | Browser localStorage |
| Testing | Pytest |
| Version Control | Git, GitHub |

---

## 🏗️ System Architecture

SkillSync follows a modular Flask architecture that separates application routing, business logic, resume processing, and frontend presentation.

```text
SkillSync-Career-Coach/
│
├── app.py
│
├── services/
│   ├── coach.py
│   └── resume_parser.py
│
├── templates/
│   ├── base.html
│   ├── index.html
│   └── roadmap.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
├── tests/
│   ├── test_coach.py
│   └── test_app.py
│
├── docs/
│   ├── project_report.md
│   └── viva_questions.md
│
├── requirements.txt
└── README.md
```

### Core Components

- **`app.py`** – Flask application, page routing, and REST API endpoints.
- **`services/coach.py`** – Skill taxonomy, keyword extraction, matching algorithms, scoring, and roadmap generation.
- **`services/resume_parser.py`** – Resume text extraction, multi-format document processing, and candidate career phase personas.
- **`templates/`** – Shared application layout, career analyzer, and dedicated learning roadmap.
- **`static/`** – Frontend styling, animations, themes, and JavaScript interactions.
- **`tests/`** – Unit tests, API tests, and application integration tests.
- **`docs/`** – Project documentation and viva preparation materials.

---

## ⚙️ Getting Started

Follow these instructions to run SkillSync locally.

### Prerequisites

Make sure you have installed:

- Python 3.10 or above
- pip (Python package manager)
- Git
- A modern web browser

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

```bash
cd SkillSync-Career-Coach
```

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

**Windows:**
```bash
.venv\Scripts\activate
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

### 5. Open in Your Browser

Once the Flask development server starts, visit:

| Page | URL |
|---|---|
| Career Analyzer | http://127.0.0.1:5000/ |
| Learning Roadmap | http://127.0.0.1:5000/roadmap |

**Congratulations!** SkillSync Career Coach is now running locally.

---

## 🔌 API Endpoints

SkillSync provides Flask-based API endpoints to support resume analysis, career role discovery, and roadmap generation.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Career Analyzer dashboard |
| GET | `/roadmap` | Learning Roadmap dashboard |
| GET | `/api/roles` | Retrieve available career roles |
| POST | `/api/analyze` | Analyze resume competencies |
| GET | `/api/roadmap/<role>` | Generate role-specific learning roadmap |
| POST | `/api/upload-resume` | Upload and extract resume content |
| GET | `/api/sample-resumes` | Retrieve sample resume options |

---

## 🧠 How SkillSync Works

The platform follows a structured skill assessment workflow:

**Step 1 — Resume Processing**

The candidate uploads a resume or provides resume text. The application extracts relevant text from supported document formats.

**Step 2 — Skill Extraction**

The skill extraction engine identifies recognized technical competencies using a predefined industry-oriented skill taxonomy.

**Step 3 — Career Role Selection**

The candidate selects a target career role, such as Backend Developer, Frontend Developer, or other supported positions.

**Step 4 — Skill Gap Analysis**

The matching engine compares the candidate's extracted skills with the target role's required competencies.

**Step 5 — Readiness Assessment**

The application calculates keyword overlap and presents matched, missing, and additional skills through an interactive dashboard.

**Step 6 — Personalized Learning Roadmap**

Missing competencies are converted into prioritized learning milestones, supported by practical mini-projects and documentation links.

**Step 7 — Progress Tracking**

Candidates complete learning activities and monitor their progress through the interactive roadmap dashboard.

---

## 🧪 Testing

SkillSync includes automated tests to validate its core functionality and application behavior.

Run the complete test suite:

```bash
python -m pytest -v
```

The test suite covers:

- Skill extraction and matching logic.
- Career readiness scoring.
- Roadmap generation.
- Flask application routing.
- API endpoint functionality.
- Application integration behavior.

---

## 🎯 Project Objectives

The primary objectives of SkillSync Career Coach are:

- Simplify the process of evaluating career readiness.
- Identify technical skill gaps between candidates and target job roles.
- Provide transparent and understandable skill matching results.
- Generate structured, actionable learning roadmaps.
- Encourage practical learning through mini-project recommendations.
- Help candidates track their learning progress.
- Provide a privacy-conscious career preparation experience.

---

## 🔮 Future Enhancements

Potential future improvements include:

- Integration with Large Language Models (LLMs) for contextual resume analysis.
- Semantic skill matching beyond exact keyword overlap.
- AI-powered resume improvement suggestions.
- Live integration with job listings and industry skill requirements.
- Personalized interview preparation and mock interview modules.
- User authentication and cloud-based progress synchronization.
- Advanced career analytics and skill readiness reports.

---

## 👨‍💻 Developer

**Karthik G Kashyap**

Aspiring Software Developer | Python | Java | Web Development | Backend Development

🔗 **Portfolio:** https://karthikgkportfolio.netlify.app/

---

## 📄 License

This project is developed for educational and portfolio purposes.

---

<p align="center">
  <b>SkillSync Career Coach</b><br>
  Build Skills. Bridge Gaps. Become Career Ready. 🚀
</p>