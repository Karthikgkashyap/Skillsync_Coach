# SkillSync Career Coach — Feature Report

## Abstract
SkillSync Career Coach compares skills detected in a resume with those detected in a target job description. It shows an overlap score, matched and missing skills, practical mini-project ideas, learning resources, and a staged roadmap. The current version uses deterministic dictionary rules and does not require a paid AI service.

## Objectives
- Help students understand detected overlap between resume text and a job description.
- Explain missing skills clearly.
- Convert gaps into practical learning activities.
- Provide a responsive interface for a live project demonstration.

## Modules
1. Input module: resume text, job description, and sample roles.
2. Skill extraction: detects known skill names and aliases.
3. Matching: calculates overlap from detected job skills.
4. Recommendation: maps missing skills to rationale, a mini-project, and a resource.
5. Roadmap: groups tasks into Foundation, Build, and Validate.
6. Dashboard: displays analysis and lets users check off roadmap tasks.

## Algorithm
Normalize text; detect known skills; compare resume skills with job skills; calculate matched skills divided by detected job skills times 100; generate recommendations for gaps; return JSON for the frontend.

## Limitations
Dictionary matching may miss unknown terms and context. Priority labels are a simple heuristic. The score does not measure full ability or predict hiring outcomes.

## Future work
PDF extraction, semantic matching, PDF reports, persistent progress, and a larger role/skill library.
