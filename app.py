from flask import Flask, render_template, request, jsonify
from services.coach import analyze_career_readiness, extract_skills, get_role_analysis_default, SAMPLE_ROLES, SKILLS
from services.resume_parser import parse_resume_file, SAMPLE_PERSONAS

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 4 * 1024 * 1024  # 4MB max for resume uploads

@app.get("/")
def index():
    return render_template("index.html", roles=SAMPLE_ROLES, personas=SAMPLE_PERSONAS)

@app.get("/roadmap")
@app.get("/learning-roadmap")
def roadmap():
    selected_role = request.args.get("role", "Backend Developer")
    if selected_role not in SAMPLE_ROLES:
        selected_role = "Backend Developer"
    default_data = get_role_analysis_default(selected_role)
    return render_template(
        "roadmap.html",
        roles=SAMPLE_ROLES,
        selected_role=selected_role,
        default_data=default_data
    )

@app.get("/api/roles")
def get_roles():
    return jsonify({
        "roles": SAMPLE_ROLES,
        "total_roles": len(SAMPLE_ROLES),
        "total_skills": len(SKILLS)
    })

@app.get("/api/sample-resumes")
def get_sample_resumes():
    return jsonify({
        "personas": SAMPLE_PERSONAS,
        "total": len(SAMPLE_PERSONAS)
    })

@app.get("/api/roadmap/<role_name>")
def get_role_roadmap(role_name):
    if role_name not in SAMPLE_ROLES:
        return jsonify({"error": f"Role '{role_name}' is not in the sample library."}), 404
    return jsonify(get_role_analysis_default(role_name))

@app.post("/api/upload-resume")
def upload_resume():
    if "resume_file" not in request.files:
        return jsonify({"error": "No file uploaded. Please select a resume file (.txt, .md, .docx, .pdf)."}), 400
    file = request.files["resume_file"]
    if not file or not file.filename:
        return jsonify({"error": "Selected file has an invalid or empty name."}), 400
    
    file_bytes = file.read()
    if not file_bytes:
        return jsonify({"error": "The uploaded file is empty."}), 400

    parsed = parse_resume_file(file.filename, file_bytes)
    if not parsed["text"].strip():
        return jsonify({
            "error": "Could not extract readable text from this file. If this was a scanned image or protected PDF, please copy & paste your resume text directly."
        }), 400

    parsed["detected_skills"] = extract_skills(parsed["text"])
    return jsonify(parsed)

@app.post("/api/analyze")
def analyze():
    data = request.get_json(silent=True) or {}
    resume = str(data.get("resume", ""))[:30000]
    job = str(data.get("job_description", ""))[:15000]
    role = str(data.get("role", "Backend Developer"))[:100]
    if not resume.strip():
        return jsonify({"error": "Add your resume text before running the analysis."}), 400
    if not job.strip():
        return jsonify({"error": "Add a job description or choose a sample role."}), 400
    return jsonify(analyze_career_readiness(resume, job, role))

if __name__ == "__main__":
    app.run(debug=True)
