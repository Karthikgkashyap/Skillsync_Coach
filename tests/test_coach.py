from services.coach import analyze_career_readiness, extract_skills

def test_aliases_and_case():
    assert extract_skills("PYTHON, JS, RESTful APIs, Postgres") == ["Python", "JavaScript", "REST APIs", "PostgreSQL"]

def test_no_java_substring_in_javascript():
    assert "Java" not in extract_skills("javascript projects")

def test_full_match():
    r = analyze_career_readiness("Python SQL Git", "Python SQL Git", "Backend Developer")
    assert r["score"] == 100 and not r["missing"]

def test_partial_match():
    r = analyze_career_readiness("Python SQL", "Python SQL Flask Docker", "Backend Developer")
    assert r["score"] == 50 and r["missing"] == ["Flask", "Docker"]

def test_no_detected_job_skills():
    r = analyze_career_readiness("Python SQL", "motivated graduate", "Backend Developer")
    assert r["score"] == 0 and r["job_skills"] == []
