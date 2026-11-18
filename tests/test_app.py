import io
import zipfile
import pytest
from app import app
from services.coach import extract_skills, get_role_analysis_default, analyze_career_readiness, SAMPLE_ROLES
from services.resume_parser import SAMPLE_PERSONAS, parse_resume_file

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_index_route(client):
    res = client.get("/")
    assert res.status_code == 200
    assert b"SkillSync" in res.data
    assert b"Career Analyzer" in res.data

def test_roadmap_route(client):
    res = client.get("/roadmap")
    assert res.status_code == 200
    assert b"Learning Roadmap" in res.data
    assert b"Skill Priorities" in res.data

def test_roadmap_alias_route(client):
    res = client.get("/learning-roadmap")
    assert res.status_code == 200
    assert b"Learning Roadmap" in res.data

def test_roadmap_with_role_param(client):
    res = client.get("/roadmap?role=Frontend+Developer")
    assert res.status_code == 200
    assert b"Frontend Developer" in res.data

def test_api_roles(client):
    res = client.get("/api/roles")
    assert res.status_code == 200
    json_data = res.get_json()
    assert "roles" in json_data
    assert "Backend Developer" in json_data["roles"]

def test_api_sample_resumes(client):
    res = client.get("/api/sample-resumes")
    assert res.status_code == 200
    json_data = res.get_json()
    assert "personas" in json_data
    assert "fresher" in json_data["personas"]
    assert "mid_backend" in json_data["personas"]
    assert len(json_data["personas"]) >= 5

def test_api_upload_resume_txt(client):
    data = {
        "resume_file": (io.BytesIO(b"Experienced in Python, PostgreSQL, Docker, Git."), "test_resume.txt")
    }
    res = client.post("/api/upload-resume", data=data, content_type="multipart/form-data")
    assert res.status_code == 200
    json_data = res.get_json()
    assert "Python" in json_data["text"]
    assert json_data["filename"] == "test_resume.txt"
    assert json_data["words"] == 6

def test_api_upload_resume_docx(client):
    bio = io.BytesIO()
    with zipfile.ZipFile(bio, "w") as z:
        doc_xml = b'<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Engineering Resume: React, TypeScript, Next.js</w:t></w:r></w:p></w:body></w:document>'
        z.writestr("word/document.xml", doc_xml)
    bio.seek(0)

    data = {
        "resume_file": (bio, "candidate.docx")
    }
    res = client.post("/api/upload-resume", data=data, content_type="multipart/form-data")
    assert res.status_code == 200
    json_data = res.get_json()
    assert "React" in json_data["text"]
    assert "TypeScript" in json_data["text"]

def test_api_role_roadmap(client):
    res = client.get("/api/roadmap/Backend%20Developer")
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["role"] == "Backend Developer"
    assert "roadmap" in json_data
    assert len(json_data["roadmap"]) == 3

def test_api_role_roadmap_not_found(client):
    res = client.get("/api/roadmap/NonExistentRole")
    assert res.status_code == 404

def test_api_analyze_success(client):
    payload = {
        "resume": "Experienced in Python, Flask, SQL, and Git.",
        "job_description": "We need Python, Flask, SQL, Git, Docker, and Linux.",
        "role": "Backend Developer"
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["score"] > 0
    assert "Docker" in json_data["missing"]
    assert "Linux" in json_data["missing"]
    assert "Python" in json_data["matched"]
    assert len(json_data["roadmap"]) == 3
    assert len(json_data["recommendations"]) == 2

def test_api_analyze_missing_resume(client):
    res = client.post("/api/analyze", json={"resume": "", "job_description": "Python"})
    assert res.status_code == 400
    assert "resume text" in res.get_json()["error"]

def test_api_analyze_missing_job(client):
    res = client.post("/api/analyze", json={"resume": "Python", "job_description": ""})
    assert res.status_code == 400
    assert "job description" in res.get_json()["error"]

def test_new_skills_extraction():
    skills = extract_skills("Proficient in TypeScript, Next.js, Tailwind CSS, Kubernetes, and MongoDB.")
    assert "TypeScript" in skills
    assert "Next.js" in skills
    assert "Tailwind CSS" in skills
    assert "Kubernetes" in skills
    assert "MongoDB" in skills

def test_persona_career_phases():
    fresher_resume = SAMPLE_PERSONAS["fresher"]["resume"]
    mid_resume = SAMPLE_PERSONAS["mid_backend"]["resume"]
    job = SAMPLE_ROLES["Backend Developer"]

    fresher_result = analyze_career_readiness(fresher_resume, job, "Backend Developer")
    mid_result = analyze_career_readiness(mid_resume, job, "Backend Developer")

    # Fresher has fewer matches and more gaps
    assert fresher_result["score"] < mid_result["score"]
    assert len(fresher_result["missing"]) > len(mid_result["missing"])
    assert "Docker" in fresher_result["missing"]
    # Mid-level has Docker matched
    assert "Docker" in mid_result["matched"]
