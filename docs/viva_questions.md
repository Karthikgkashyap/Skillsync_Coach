# SkillSync Career Coach — Viva Questions

1. **What is SkillSync?** A web app that compares resume skills with a job description and suggests next learning steps.
2. **What problem does it solve?** It helps students identify detected skill gaps and focus their practice.
3. **Which technologies are used?** HTML, CSS, JavaScript, Python, Flask, and pytest.
4. **What is Flask?** A lightweight Python web framework.
5. **What is a route?** A URL mapped to a server-side function.
6. **How does the frontend send data?** JavaScript sends JSON using a POST request to `/api/analyze`.
7. **What is JSON?** A format for exchanging structured data.
8. **How are skills detected?** The backend searches normalized text for known names and aliases.
9. **Why use word boundaries?** To reduce accidental matches inside unrelated words.
10. **How is the score calculated?** Matched detected job skills divided by all detected job skills, multiplied by 100.
11. **What if no job skills are detected?** The score safely returns 0 and the interface explains the issue.
12. **Is this machine learning?** No. This version uses deterministic dictionary-based rules.
13. **Why is the score not a hiring probability?** It measures keyword overlap only.
14. **What is a skill gap?** A job skill not detected in the resume text.
15. **What is a mini-project recommendation?** A practical exercise connected to a missing skill.
16. **What does the roadmap do?** Organizes tasks into Foundation, Build, and Validate stages.
17. **Why is resume text not stored?** To reduce unnecessary retention of personal data.
18. **How can it be tested?** Run `pytest -q` and manually test the browser workflow.
19. **What is an API endpoint?** A URL through which a client and server exchange data.
20. **What are the limitations?** Dictionary coverage, context understanding, and simple priority heuristics.
21. **What can be added later?** PDF parsing, semantic matching, accounts, and saved progress.
22. **How is the interface responsive?** CSS media queries adapt the layout to screen size.
23. **How are resources selected?** The dictionary maps skills to known documentation links.
24. **What happens when input is empty?** The app validates input and shows an error.
25. **What is the main contribution?** It turns detected gaps into explanations, practice ideas, and a roadmap.
