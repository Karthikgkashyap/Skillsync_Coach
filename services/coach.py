import re

SKILLS = {
 "Python": (["python", "python3", "python 3", "py3"], "Programming", "Python is common in backend services and automation.", "Build an expense tracker with validation and persistent storage.", "Python Tutorial", "https://docs.python.org/3/tutorial/"),
 "JavaScript": (["javascript", "js", "ecmascript", "es6"], "Programming", "JavaScript powers interactive web interfaces and server-side apps.", "Build a searchable task board with filters.", "MDN JavaScript Guide", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"),
 "Java": (["java", "core java", "java 8", "java 11", "java 17", "java 21", "jvm"], "Programming", "Java is widely used in enterprise backend systems.", "Create a library manager with CRUD operations.", "Dev.java Learn", "https://dev.java/learn/"),
 "HTML": (["html", "html5", "semantic html"], "Frontend", "HTML structures accessible web pages.", "Build a semantic portfolio page with an accessible form.", "MDN HTML", "https://developer.mozilla.org/en-US/docs/Web/HTML"),
 "CSS": (["css", "css3", "responsive design", "sass", "scss"], "Frontend", "CSS creates consistent, responsive interfaces.", "Build a mobile-first dashboard with reusable cards.", "MDN CSS", "https://developer.mozilla.org/en-US/docs/Web/CSS"),
 "React": (["react", "react.js", "reactjs", "react native"], "Frontend", "React helps build reusable component-based interfaces.", "Build a job-search dashboard using reusable components.", "React Learn", "https://react.dev/learn"),
 "Node.js": (["node.js", "nodejs", "node", "express", "express.js", "expressjs"], "Backend", "Node.js enables JavaScript-based server development.", "Build a JSON API with validation and error handling.", "Node.js Learn", "https://nodejs.org/en/learn"),
 "Flask": (["flask", "flask framework", "python flask", "flask api"], "Backend", "Flask is a lightweight framework for Python web apps and APIs.", "Create a CRUD notes API with clear HTTP status codes.", "Flask Documentation", "https://flask.palletsprojects.com/"),
 "Django": (["django", "django rest framework", "drf"], "Backend", "Django provides integrated tools for data-driven web applications.", "Build an event registration site with forms.", "Django Tutorial", "https://docs.djangoproject.com/en/stable/intro/tutorial01/"),
 "REST APIs": (["rest api", "rest apis", "restful api", "restful apis", "api development", "restful", "rest", "fastapi", "api design", "web services", "apis"], "Backend", "REST APIs let applications exchange data through HTTP interfaces.", "Design a CRUD API with filtering and consistent JSON responses.", "MDN HTTP overview", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"),
 "SQL": (["sql", "structured query language", "mysql", "mssql", "sql server", "rdbms", "database queries"], "Database", "SQL is essential for querying relational data.", "Create a sales database and answer questions with joins.", "SQLBolt", "https://sqlbolt.com/"),
 "SQLite": (["sqlite", "sqlite3"], "Database", "SQLite is a lightweight database for local applications.", "Add persistent storage to a task tracker.", "SQLite Documentation", "https://www.sqlite.org/docs.html"),
 "PostgreSQL": (["postgresql", "postgres", "psql"], "Database", "PostgreSQL is a feature-rich production database.", "Build an inventory schema with constraints and indexes.", "PostgreSQL Tutorial", "https://www.postgresql.org/docs/current/tutorial.html"),
 "Git": (["git", "version control", "github", "gitlab", "bitbucket"], "Tools", "Git tracks changes and supports collaboration.", "Practise branches, commits, and resolving a merge conflict.", "Pro Git Book", "https://git-scm.com/book/en/v2"),
 "Docker": (["docker", "containerization", "containers", "docker compose", "dockerfile", "dockerized"], "DevOps", "Docker packages an app and its dependencies reproducibly.", "Containerize a small Flask app.", "Docker Get Started", "https://docs.docker.com/get-started/"),
 "AWS": (["aws", "amazon web services", "ec2", "s3", "lambda", "cloudwatch"], "Cloud", "Cloud fundamentals help developers deploy applications.", "Document a simple cloud web-app architecture.", "AWS Skill Builder", "https://skillbuilder.aws/"),
 "Linux": (["linux", "bash", "shell scripting", "ubuntu", "unix", "debian", "centos", "redhat", "shell scripts"], "Tools", "Linux and shell basics help with server troubleshooting.", "Write a shell script that backs up a folder and logs results.", "The Linux Command Line", "https://linuxcommand.org/tlcl.php"),
 "Testing": (["testing", "unit testing", "pytest", "automated testing", "unit tests", "integration tests", "integration testing", "tdd", "test cases", "test coverage", "jest"], "Quality", "Testing catches regressions and builds confidence.", "Test API success, invalid input, and missing records.", "pytest Documentation", "https://docs.pytest.org/"),
 "Data Structures": (["data structures", "dsa", "algorithms", "problem solving"], "Fundamentals", "Data structures and algorithms strengthen problem solving.", "Implement and compare search methods on a small dataset.", "VisuAlgo", "https://visualgo.net/"),
 "Machine Learning": (["machine learning", "ml", "scikit-learn", "deep learning", "ai", "artificial intelligence", "nlp"], "Data & AI", "Machine learning learns patterns from data.", "Train and evaluate a simple regression model.", "scikit-learn Tutorials", "https://scikit-learn.org/stable/tutorial/index.html"),
 "Pandas": (["pandas", "dataframe", "numpy"], "Data & AI", "Pandas supports data cleaning and analysis in Python.", "Clean a CSV dataset and write a short exploratory analysis.", "Pandas Getting Started", "https://pandas.pydata.org/docs/getting_started/index.html"),
 "Communication": (["communication", "communication skills", "written communication", "verbal communication", "leadership", "collaboration", "teamwork", "stakeholder management"], "Professional", "Clear communication helps teams collaborate and explain decisions.", "Prepare a two-minute walkthrough of a project.", "Career interview guides", "https://careers.uw.edu/"),
 "TypeScript": (["typescript", "ts"], "Programming", "TypeScript adds static typing to JavaScript for maintainable, enterprise applications.", "Refactor a JavaScript project to TypeScript with strict interfaces.", "TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"),
 "Next.js": (["next.js", "nextjs", "next"], "Frontend", "Next.js powers full-stack React web apps with server-side rendering and routing.", "Build a fast portfolio or blog with the Next.js App Router.", "Next.js Learn", "https://nextjs.org/learn"),
 "Tailwind CSS": (["tailwind", "tailwindcss"], "Frontend", "Tailwind CSS provides utility-first CSS styling for modern, rapid UI building.", "Build a responsive landing page with dark mode using Tailwind utilities.", "Tailwind CSS Docs", "https://tailwindcss.com/docs"),
 "Kubernetes": (["kubernetes", "k8s"], "DevOps", "Kubernetes automates deployment, scaling, and operations of containerized apps.", "Deploy a containerized web application to a local Kubernetes cluster.", "Kubernetes Basics", "https://kubernetes.io/docs/tutorials/kubernetes-basics/"),
 "CI/CD": (["ci/cd", "ci cd", "continuous integration", "github actions"], "DevOps", "CI/CD automates testing and deployment pipelines to keep software shipping smoothly.", "Create a GitHub Actions workflow to run automated unit tests on every pull request.", "GitHub Actions Docs", "https://docs.github.com/en/actions"),
 "MongoDB": (["mongodb", "mongo", "nosql"], "Database", "MongoDB is a document-oriented NoSQL database for flexible data schemas.", "Build a document storage API for user profiles and product catalogs.", "MongoDB Learn", "https://learn.mongodb.com/"),
 "Redis": (["redis", "caching"], "Database", "Redis provides in-memory key-value caching and blazing fast query performance.", "Implement an API rate limiter or cache layer using Redis.", "Redis Getting Started", "https://redis.io/docs/latest/develop/get-started/"),
 "GraphQL": (["graphql"], "Backend", "GraphQL allows client applications to request precisely the data they need.", "Build a GraphQL schema with queries and mutations for an e-commerce API.", "GraphQL Learn", "https://graphql.org/learn/"),
 "System Design": (["system design", "distributed systems", "microservices"], "Fundamentals", "System design helps engineers architect scalable, resilient distributed systems.", "Design a URL shortener service detailing caching, load balancing, and storage.", "System Design Primer", "https://github.com/donnemartin/system-design-primer")
}

SAMPLE_ROLES = {
 "Backend Developer": "Build backend services and REST APIs. Required skills: Python, Flask, SQL, REST APIs, Git, testing, Docker, Linux.",
 "Frontend Developer": "Build responsive interfaces. Required skills: HTML, CSS, JavaScript, React, Git, testing, REST APIs.",
 "Full Stack Developer": "Develop end-to-end web applications. Required skills: JavaScript, React, Node.js, HTML, CSS, SQL, REST APIs, Git, Docker, testing.",
 "Python Developer": "Develop Python applications. Required skills: Python, SQL, Flask, Git, testing, REST APIs, Docker.",
 "Data Analyst": "Clean datasets and communicate insights. Required skills: SQL, Python, Pandas, machine learning, communication.",
 "Cloud / DevOps Intern": "Support deployment and automation. Required skills: Linux, Git, Docker, AWS, Python, testing.",
 "AI / Machine Learning Engineer": "Build machine learning models and intelligent workflows. Required skills: Python, machine learning, Pandas, Data Structures, SQL, Git, testing."
}

def extract_skills(text):
    text = re.sub(r"\s+", " ", text.lower()).strip()
    found = []
    for name, (aliases, *_rest) in SKILLS.items():
        for alias in sorted(aliases, key=len, reverse=True):
            pattern = r"(?<![a-z0-9])" + re.escape(alias.lower()) + r"(?![a-z0-9])"
            if re.search(pattern, text):
                found.append(name)
                break
    return found

def analyze_career_readiness(resume, job_description, role="Backend Developer"):
    resume_skills = extract_skills(resume)
    job_skills = extract_skills(job_description)
    resume_set = set(resume_skills)
    matched = [s for s in job_skills if s in resume_set]
    missing = [s for s in job_skills if s not in resume_set]
    additional = [s for s in resume_skills if s not in set(job_skills)]
    score = round(len(matched) / len(job_skills) * 100) if job_skills else 0
    recommendations = []
    for i, skill in enumerate(missing):
        aliases, category, why, project, resource, url = SKILLS[skill]
        priority = "High" if i < max(1, round(len(missing)*.34)) else ("Medium" if i < max(2, round(len(missing)*.70)) else "Explore")
        recommendations.append({
            "skill": skill,
            "category": category,
            "priority": priority,
            "why": why,
            "project": project,
            "resource": resource,
            "url": url,
            "duration": "3–5 focused hours" if i < 2 else "2–4 focused hours"
        })
    if missing:
        foundation = [f"Learn the fundamentals and core concepts of {s}" for s in missing[:2]]
        build = [f"Complete a practical mini-project using {s}" for s in missing[2:4]] or ["Combine your target-role skills into a cohesive mini-project"]
    else:
        foundation = ["Review the role requirements and validate your portfolio evidence"]
        build = ["Build a capstone project that demonstrates end-to-end mastery of these skills"]
    roadmap = [
      {"name":"Foundation","tag":"Understand","description":"Review concepts, architecture, and syntax behind your highest-priority gaps.","tasks":foundation},
      {"name":"Build","tag":"Apply","description":"Practise with small, concrete deliverables and real-world code.","tasks":build},
      {"name":"Validate","tag":"Demonstrate","description":"Check edge cases, write unit tests, and prepare to explain your design decisions.","tasks":["Test your project thoroughly and document edge cases","Prepare a 2-minute architectural walkthrough and interview talking points"]}
    ]
    return {
        "role": role,
        "score": score,
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "matched": matched,
        "missing": missing,
        "additional": additional,
        "recommendations": recommendations,
        "roadmap": roadmap,
        "summary": f"You matched {len(matched)} of {len(job_skills)} detected job skills." if job_skills else "No supported skills were detected in the job description. Add specific technologies and analyse again.",
        "score_note": "This score measures detected skill overlap only. It is not a hiring probability or a validated measure of overall employability."
    }

def get_role_analysis_default(role="Backend Developer"):
    """Returns a full roadmap and prioritized skills for a target role."""
    job_desc = SAMPLE_ROLES.get(role, list(SAMPLE_ROLES.values())[0])
    return analyze_career_readiness("", job_desc, role)
