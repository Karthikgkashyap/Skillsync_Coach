/**
 * SkillSync Career Coach — Core Application Logic
 * Supports Multi-Phase Resumes, File Uploads (.pdf, .docx, .txt), Career Analyzer,
 * Skill Acquisition Simulator, and Dedicated Roadmap & Skill Priorities
 */

(function () {
  "use strict";

  // Shared Constants & Storage Keys
  const STORAGE_KEYS = {
    ANALYSIS: "skillsync_analysis_v2",
    TASK_CHECKS: "skillsync_task_checks_v2",
    MASTERED: "skillsync_mastered_skills_v2",
    THEME: "skillsync_theme_v2"
  };

  const ROLES = window.SKILLSYNC_ROLES || {};
  const PERSONAS = window.SKILLSYNC_PERSONAS || {};

  // Utility DOM Selectors
  const $ = (id) => document.getElementById(id);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  // Toast Notification System
  function showToast(message, type = "info") {
    const container = $("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success" ? "✓" : type === "error" ? "⚠️" : "ℹ️";
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // Theme Management (Dark / Light)
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (systemPrefersDark ? "dark" : "dark");
    document.documentElement.setAttribute("data-theme", theme);

    const themeToggleBtn = $("theme-toggle");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "dark";
        const nextTheme = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nextTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
        showToast(`Switched to ${nextTheme} theme`);
      });
    }
  }

  // Mobile Menu Toggle
  function initMobileMenu() {
    const menuBtn = $("mobile-menu-toggle");
    const sidebar = $("sidebar");
    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
      });

      document.addEventListener("click", (e) => {
        if (sidebar.classList.contains("mobile-open") && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
          sidebar.classList.remove("mobile-open");
        }
      });
    }
  }

  // Sidebar Status Widget Synchronizer
  function updateSidebarWidget(analysisData) {
    const roleElem = $("sidebar-target-role");
    const scoreElem = $("sidebar-target-score");
    const barElem = $("sidebar-progress-bar");
    if (!roleElem || !scoreElem || !barElem) return;

    if (analysisData && analysisData.role) {
      roleElem.textContent = analysisData.role;
      const score = typeof analysisData.score === "number" ? analysisData.score : 0;
      scoreElem.textContent = `${score}%`;
      barElem.style.width = `${score}%`;
    } else {
      const selectedRole = ($("role") && $("role").value) || "Backend Developer";
      roleElem.textContent = selectedRole;
      scoreElem.textContent = "--%";
      barElem.style.width = "0%";
    }
  }

  // ==========================================================================
  // PAGE 1: CAREER ANALYZER LOGIC (index.html)
  // ==========================================================================
  function initAnalyzerPage() {
    const roleSelect = $("role");
    const resumeTextarea = $("resume");
    const jobTextarea = $("job-description");
    const resumeCountBadge = $("resume-count");
    const jobCountBadge = $("job-count");
    const form = $("analysis-form");
    const analyzeBtn = $("analyze-btn");
    const clearBtn = $("clear-btn");
    const loadSampleJobBtn = $("load-sample");
    const errorAlert = $("form-error");
    const dropZone = $("resume-drop-zone");

    // File Upload Elements
    const fileInput = $("resume-file-input");
    const fileIndicator = $("file-upload-indicator");
    const indicatorFilename = $("indicator-filename");
    const indicatorRemoveBtn = $("indicator-remove-btn");

    // Simulation Elements
    const simBanner = $("simulation-banner");
    const simTitle = $("sim-title");
    const simDesc = $("sim-desc");
    const resetSimBtn = $("reset-sim-btn");

    if (!form) return; // Not on the analyzer page

    // Active analysis state for simulation
    let baselineData = null;
    let simulatedSet = new Set();

    // Update text counters
    function updateCounters() {
      if (resumeTextarea && resumeCountBadge) {
        const chars = resumeTextarea.value.length;
        resumeCountBadge.textContent = `${chars.toLocaleString()} chars`;
      }
      if (jobTextarea && jobCountBadge) {
        const chars = jobTextarea.value.length;
        jobCountBadge.textContent = `${chars.toLocaleString()} chars`;
      }
    }

    if (resumeTextarea) resumeTextarea.addEventListener("input", updateCounters);
    if (jobTextarea) jobTextarea.addEventListener("input", updateCounters);

    // Load sample job description for selected role
    function setRoleSample(roleName) {
      if (!roleName) roleName = roleSelect.value;
      if (jobTextarea) {
        jobTextarea.value = ROLES[roleName] || "";
        updateCounters();
      }
    }

    // Role selector change
    if (roleSelect) {
      roleSelect.addEventListener("change", () => {
        const role = roleSelect.value;
        $$(".role-pill").forEach((pill) => {
          pill.classList.toggle("active", pill.dataset.role === role);
        });
        const currentJobVal = jobTextarea.value.trim();
        const matchesAnySample = Object.values(ROLES).some((v) => v.trim() === currentJobVal);
        if (!currentJobVal || matchesAnySample) {
          setRoleSample(role);
        }
      });
    }

    // Quick Role Preset Pills
    $$(".role-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        const role = pill.dataset.role;
        if (roleSelect) {
          roleSelect.value = role;
          roleSelect.dispatchEvent(new Event("change"));
        }
      });
    });

    // Persona / Phase Selector Chips
    $$(".persona-chip-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pKey = btn.dataset.persona;
        const pData = PERSONAS[pKey];
        if (!pData) return;

        $$(".persona-chip-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        if (resumeTextarea) {
          resumeTextarea.value = pData.resume;
        }

        if (pData.recommended_role && roleSelect) {
          roleSelect.value = pData.recommended_role;
          $$(".role-pill").forEach((pill) => {
            pill.classList.toggle("active", pill.dataset.role === pData.recommended_role);
          });
          setRoleSample(pData.recommended_role);
        }

        updateCounters();
        if (fileIndicator) fileIndicator.hidden = true;
        showToast(`Loaded ${pData.title}! Analyzing phase...`, "success");

        // Automatically trigger analysis so user immediately sees the phase in action!
        form.requestSubmit();
      });
    });

    // File Upload Handler (PDF, DOCX, TXT, MD)
    async function handleFileUpload(file) {
      if (!file) return;
      const ext = file.name.split(".").pop().toLowerCase();

      if (ext === "txt" || ext === "md") {
        const reader = new FileReader();
        reader.onload = (evt) => {
          resumeTextarea.value = evt.target.result;
          updateCounters();
          if (fileIndicator && indicatorFilename) {
            indicatorFilename.innerHTML = `<strong>${file.name}</strong> &bull; ${file.size.toLocaleString()} bytes`;
            fileIndicator.hidden = false;
          }
          showToast(`Loaded ${file.name}! Running analysis...`, "success");
          form.requestSubmit();
        };
        reader.readAsText(file);
        return;
      }

      // For PDF / DOCX, parse through the backend endpoint
      const formData = new FormData();
      formData.append("resume_file", file);
      showToast(`Extracting text from ${file.name}...`, "info");

      try {
        const res = await fetch("/api/upload-resume", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "File parsing failed.");

        resumeTextarea.value = data.text;
        updateCounters();
        if (fileIndicator && indicatorFilename) {
          const skillsList = data.detected_skills || [];
          const skillsCount = skillsList.length;
          indicatorFilename.innerHTML = `
            <strong>${data.filename}</strong> &bull; ${data.chars.toLocaleString()} chars
            ${skillsCount > 0 ? `<span class="badge-skills">(${skillsCount} skills detected: ${skillsList.slice(0, 4).join(", ")}${skillsCount > 4 ? "..." : ""})</span>` : ""}
          `;
          fileIndicator.hidden = false;
        }

        if (data.chars < 80) {
          showToast("Very little text extracted. If this PDF is an image scan, please paste the text directly into the box.", "error");
        } else {
          showToast(`Extracted ${data.chars.toLocaleString()} characters (${data.detected_skills ? data.detected_skills.length : 0} skills detected)! Running analysis...`, "success");
          form.requestSubmit();
        }
      } catch (err) {
        showToast(err.message, "error");
      }
    }

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        handleFileUpload(file);
      });
    }

    if (indicatorRemoveBtn) {
      indicatorRemoveBtn.addEventListener("click", () => {
        if (fileIndicator) fileIndicator.hidden = true;
        if (fileInput) fileInput.value = "";
        resumeTextarea.value = "";
        updateCounters();
        showToast("Loaded file removed");
      });
    }

    // Drag and drop PDF / DOCX / TXT files into resume area
    if (dropZone && resumeTextarea) {
      ["dragenter", "dragover"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.add("drag-active");
        });
      });
      ["dragleave", "drop"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.remove("drag-active");
        });
      });
      dropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0) {
          handleFileUpload(files[0]);
        }
      });
    }

    // Sample Job loader
    if (loadSampleJobBtn) {
      loadSampleJobBtn.addEventListener("click", () => {
        setRoleSample(roleSelect.value);
        showToast("Role sample loaded", "success");
      });
    }

    // Clear inputs
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (resumeTextarea) resumeTextarea.value = "";
        if (jobTextarea) jobTextarea.value = "";
        if (fileIndicator) fileIndicator.hidden = true;
        if (fileInput) fileInput.value = "";
        $$(".persona-chip-btn").forEach((b) => b.classList.remove("active"));
        updateCounters();
        if (errorAlert) errorAlert.hidden = true;
        showToast("Inputs cleared");
      });
    }

    // Helper: Render Chip List
    function renderChips(containerId, items, chipType, emptyMessage) {
      const container = $(containerId);
      if (!container) return;
      container.replaceChildren();

      if (!items || items.length === 0) {
        const emptySpan = document.createElement("span");
        emptySpan.className = "skill-chip";
        emptySpan.textContent = emptyMessage;
        container.appendChild(emptySpan);
        return;
      }

      items.forEach((item) => {
        const chip = document.createElement("span");
        chip.className = `skill-chip ${chipType}`;
        chip.textContent = item;
        container.appendChild(chip);
      });
    }

    // Helper: Render Missing Skills with '+ Test' Simulation Buttons
    function renderMissingChipsWithSimulation(items) {
      const container = $("missing-chips");
      if (!container) return;
      container.replaceChildren();

      if (!items || items.length === 0) {
        const emptySpan = document.createElement("span");
        emptySpan.className = "skill-chip good";
        emptySpan.textContent = "All job skills matched! 🎉";
        container.appendChild(emptySpan);
        return;
      }

      items.forEach((skill) => {
        const chip = document.createElement("span");
        chip.className = "skill-chip gap";
        chip.innerHTML = `
          <span>${skill}</span>
          <button type="button" class="chip-simulate-btn" data-skill="${skill}" title="Simulate what happens if you learn ${skill}">+ Test</button>
        `;

        const btn = chip.querySelector(".chip-simulate-btn");
        if (btn) {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            simulateSkillAcquisition(skill);
          });
        }
        container.appendChild(chip);
      });
    }

    // Live Skill Acquisition Simulator
    function simulateSkillAcquisition(skill) {
      if (!baselineData) return;
      simulatedSet.add(skill);

      const jobSkills = baselineData.job_skills || [];
      const newMatched = Array.from(new Set([...(baselineData.matched || []), ...simulatedSet])).filter((s) =>
        jobSkills.includes(s)
      );
      const newMissing = jobSkills.filter((s) => !newMatched.includes(s));
      const newScore = jobSkills.length ? Math.round((newMatched.length / jobSkills.length) * 100) : 0;

      const simulatedData = {
        ...baselineData,
        matched: newMatched,
        missing: newMissing,
        score: newScore,
        recommendations: (baselineData.recommendations || []).filter((r) => !simulatedSet.has(r.skill))
      };

      // Show Simulation Banner
      if (simBanner && simTitle && simDesc) {
        simBanner.hidden = false;
        const diff = newScore - baselineData.score;
        simTitle.textContent = `Skill Acquisition Simulation (+${diff}% match)`;
        simDesc.textContent = `Simulating career phase if you master: ${Array.from(simulatedSet).join(", ")}. Readiness score increased to ${newScore}%.`;
      }

      renderAnalyzerResults(simulatedData, false);
      showToast(`Simulated acquiring ${skill}! Match score is now ${newScore}%.`, "success");
    }

    // Reset Simulation
    if (resetSimBtn) {
      resetSimBtn.addEventListener("click", () => {
        if (!baselineData) return;
        simulatedSet.clear();
        if (simBanner) simBanner.hidden = true;
        renderAnalyzerResults(baselineData, false);
        showToast("Simulation reset to original baseline");
      });
    }

    // Render Analysis Results on Analyzer Page
    function renderAnalyzerResults(data, isNewBaseline = true) {
      const resultsSection = $("results");
      if (!resultsSection) return;

      if (isNewBaseline) {
        baselineData = data;
        simulatedSet.clear();
        if (simBanner) simBanner.hidden = true;
      }

      resultsSection.hidden = false;

      // Result summary text
      const summaryElem = $("result-summary");
      if (summaryElem) {
        summaryElem.textContent = `${data.role}: ${data.summary}`;
      }

      // Circular Radial Score Gauge
      const scoreValElem = $("score-value");
      const scoreLabelElem = $("score-label");
      const scoreBarCircle = $("score-circle-bar");
      const scoreNoteElem = $("score-note");

      const score = Math.max(0, Math.min(100, data.score || 0));
      if (scoreValElem) scoreValElem.textContent = `${score}%`;

      if (scoreLabelElem) {
        if (score >= 80) scoreLabelElem.textContent = "Interview Ready";
        else if (score >= 60) scoreLabelElem.textContent = "Competitive Match";
        else if (score >= 40) scoreLabelElem.textContent = "Solid Foundation";
        else scoreLabelElem.textContent = "Gaps Identified";
      }

      if (scoreBarCircle) {
        const circumference = 314;
        const offset = circumference - (circumference * score) / 100;
        scoreBarCircle.style.strokeDashoffset = offset;
        scoreBarCircle.style.stroke =
          score >= 70 ? "var(--success)" : score >= 45 ? "var(--primary)" : "var(--warning)";
      }

      if (scoreNoteElem) {
        const matchedLen = (data.matched && data.matched.length) || 0;
        const jobLen = (data.job_skills && data.job_skills.length) || 0;
        scoreNoteElem.textContent = `${matchedLen} of ${jobLen} detected job skills matched`;
      }

      // Metric Counts
      const matchedCountElem = $("matched-count");
      const missingCountElem = $("missing-count");
      const extraCountElem = $("additional-count");

      if (matchedCountElem) matchedCountElem.textContent = (data.matched && data.matched.length) || 0;
      if (missingCountElem) missingCountElem.textContent = (data.missing && data.missing.length) || 0;
      if (extraCountElem) extraCountElem.textContent = (data.additional && data.additional.length) || 0;

      // Chips
      renderChips("matched-chips", data.matched || [], "good", "None detected");
      renderMissingChipsWithSimulation(data.missing || []);
      renderChips("additional-chips", data.additional || [], "more", "None detected");

      // Gateway Banner Preview Skills
      const previewPillsContainer = $("gateway-preview-skills");
      if (previewPillsContainer) {
        previewPillsContainer.replaceChildren();
        const topGaps = (data.missing && data.missing.slice(0, 4)) || [];
        if (topGaps.length > 0) {
          topGaps.forEach((skill) => {
            const pill = document.createElement("span");
            pill.className = "skill-chip gap";
            pill.textContent = `⚡ Build: ${skill}`;
            previewPillsContainer.appendChild(pill);
          });
        } else {
          const pill = document.createElement("span");
          pill.className = "skill-chip good";
          pill.textContent = "All core skills matched!";
          previewPillsContainer.appendChild(pill);
        }
      }

      // Quick Priorities Grid Preview
      const quickGrid = $("quick-priorities-grid");
      if (quickGrid) {
        quickGrid.replaceChildren();
        const topRecs = (data.recommendations && data.recommendations.slice(0, 3)) || [];
        if (topRecs.length > 0) {
          topRecs.forEach((rec) => {
            const card = document.createElement("div");
            card.className = "rec-card";
            card.innerHTML = `
              <div class="rec-card-top">
                <span class="rec-category-badge">${rec.category}</span>
                <span class="rec-priority-badge ${rec.priority.toLowerCase()}">${rec.priority} Priority</span>
              </div>
              <h4 class="rec-card-title">${rec.skill}</h4>
              <p class="rec-card-why">${rec.why}</p>
              <div class="rec-mini-project">
                <span class="mini-project-label">🛠️ MINI-PROJECT</span>
                <p class="mini-project-desc">${rec.project}</p>
              </div>
              <div class="rec-card-footer">
                <span class="rec-duration">⏱️ ${rec.duration}</span>
                <a href="${rec.url}" target="_blank" rel="noopener noreferrer" class="rec-resource-link">
                  ${rec.resource} ↗
                </a>
              </div>
            `;
            quickGrid.appendChild(card);
          });
        } else {
          quickGrid.innerHTML = `
            <div class="empty-matrix-card">
              <div class="empty-matrix-title">No gaps detected! 🎉</div>
              <p class="empty-matrix-desc">Your profile matches all detected job requirements. Explore advanced portfolio extensions on the roadmap page.</p>
            </div>
          `;
        }
      }

      // Update sidebar session widget
      updateSidebarWidget(data);

      if (isNewBaseline) {
        resultsSection.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start"
        });
      }
    }

    // Form Submission: Send to Flask API
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorAlert) errorAlert.hidden = true;

      const resumeText = resumeTextarea.value.trim();
      const jobText = jobTextarea.value.trim();
      const role = roleSelect.value;

      if (!resumeText) {
        if (errorAlert) {
          errorAlert.textContent = "Please paste your resume text or select a candidate phase above.";
          errorAlert.hidden = false;
        }
        resumeTextarea.focus();
        return;
      }

      if (!jobText) {
        if (errorAlert) {
          errorAlert.textContent = "Please add a target job description or click 'Load Role Sample'.";
          errorAlert.hidden = false;
        }
        jobTextarea.focus();
        return;
      }

      analyzeBtn.disabled = true;
      const originalBtnHTML = analyzeBtn.innerHTML;
      analyzeBtn.innerHTML = `
        <span class="btn-icon">◌</span>
        <span class="btn-label">Analyzing Skills & Gaps...</span>
      `;

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: resumeText,
            job_description: jobText,
            role: role
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Analysis failed. Please check inputs and try again.");
        }

        // Store analysis in localStorage so Roadmap page accesses it immediately!
        localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(data));

        renderAnalyzerResults(data, true);
        showToast("Analysis complete! Roadmap ready.", "success");
      } catch (err) {
        if (errorAlert) {
          errorAlert.textContent = err.message || "Failed to analyze. Please ensure the Flask server is running.";
          errorAlert.hidden = false;
        }
        showToast(err.message, "error");
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalBtnHTML;
      }
    });

    // Check if prior analysis exists in localStorage or initialize with sample
    const cachedAnalysis = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
    if (cachedAnalysis) {
      try {
        const parsed = JSON.parse(cachedAnalysis);
        renderAnalyzerResults(parsed, true);
      } catch (e) {
        console.error("Could not parse cached analysis", e);
      }
    }

    // Default initial setup
    if (!resumeTextarea.value.trim()) {
      const firstPersona = Object.values(PERSONAS)[0];
      if (firstPersona) {
        resumeTextarea.value = firstPersona.resume;
        const firstBtn = $$(".persona-chip-btn")[0];
        if (firstBtn) firstBtn.classList.add("active");
      }
    }
    if (!jobTextarea.value.trim()) {
      setRoleSample(roleSelect.value);
    }
    updateCounters();
  }

  // ==========================================================================
  // PAGE 2: DEDICATED ROADMAP & SKILL PRIORITIES LOGIC (roadmap.html)
  // ==========================================================================
  function initRoadmapPage() {
    const roleSelect = $("roadmap-role-select");
    const recsContainer = $("recommendations-container");
    const timelineContainer = $("roadmap-timeline-grid");
    const searchInput = $("skill-search-input");
    const clearSearchBtn = $("clear-search-btn");
    const categorySelect = $("category-filter-select");
    const priorityPills = $$("#priority-filter-group .filter-pill");

    const copyMarkdownBtn = $("copy-markdown-btn");
    const printRoadmapBtn = $("print-roadmap-btn");
    const resetTasksBtn = $("reset-tasks-btn");
    const checkAllRoadmapBtn = $("check-all-roadmap");
    const uncheckAllRoadmapBtn = $("uncheck-all-roadmap");

    if (!recsContainer || !timelineContainer) return; // Not on the roadmap page

    // Load Task Checks & Mastered Skills from localStorage
    let taskChecks = {};
    try {
      taskChecks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASK_CHECKS)) || {};
    } catch (e) {
      taskChecks = {};
    }

    let masteredSkills = {};
    try {
      masteredSkills = JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERED)) || {};
    } catch (e) {
      masteredSkills = {};
    }

    let currentData = null;
    const storedAnalysis = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
    if (storedAnalysis) {
      try {
        currentData = JSON.parse(storedAnalysis);
      } catch (e) {
        console.error(e);
      }
    }

    if (!currentData || !currentData.roadmap) {
      currentData = window.INITIAL_ROADMAP_DATA || null;
    }

    function saveTaskCheck(taskId, isChecked) {
      taskChecks[taskId] = isChecked;
      localStorage.setItem(STORAGE_KEYS.TASK_CHECKS, JSON.stringify(taskChecks));
      updateProgressCalculations();
    }

    function toggleMasteredSkill(skillName) {
      masteredSkills[skillName] = !masteredSkills[skillName];
      localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(masteredSkills));
      renderRecommendations();
      showToast(
        masteredSkills[skillName] ? `Marked ${skillName} as mastered!` : `Unmarked ${skillName}`,
        "success"
      );
    }

    function updateProgressCalculations() {
      if (!currentData || !currentData.roadmap) return;

      let totalTasks = 0;
      let checkedTasks = 0;

      currentData.roadmap.forEach((stage, stageIdx) => {
        if (stage.tasks && stage.tasks.length) {
          stage.tasks.forEach((_, taskIdx) => {
            totalTasks++;
            const taskId = `task-${currentData.role}-${stageIdx}-${taskIdx}`;
            if (taskChecks[taskId]) checkedTasks++;
          });
        }
      });

      const percentage = totalTasks > 0 ? Math.round((checkedTasks / totalTasks) * 100) : 0;
      const progressCounter = $("progress-tasks-counter");
      const progressFill = $("master-progress-fill");

      if (progressCounter) {
        progressCounter.textContent = `${checkedTasks} of ${totalTasks} Tasks Completed (${percentage}%)`;
      }
      if (progressFill) {
        progressFill.style.width = `${percentage}%`;
      }
    }

    function updateOverviewBanner() {
      if (!currentData) return;

      const roleElem = $("overview-role-name");
      const scoreElem = $("overview-score-value");
      const badgeElem = $("overview-score-badge");
      const sourceElem = $("overview-analysis-source");
      const prioritiesBadge = $("priorities-count-badge");

      if (roleElem) roleElem.textContent = currentData.role || "Target Role";
      if (scoreElem) scoreElem.textContent = `${currentData.score || 0}%`;

      if (badgeElem) {
        const s = currentData.score || 0;
        badgeElem.textContent = s >= 80 ? "High Match" : s >= 50 ? "Solid Base" : "Gaps Found";
      }

      if (sourceElem) {
        const stored = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
        sourceElem.textContent = stored ? "Personalized from your resume" : "Curated role standard";
      }

      if (prioritiesBadge) {
        const count = (currentData.recommendations && currentData.recommendations.length) || 0;
        prioritiesBadge.textContent = count;
      }

      updateSidebarWidget(currentData);
      updateProgressCalculations();
    }

    function populateCategories() {
      if (!categorySelect || !currentData || !currentData.recommendations) return;
      const categories = new Set();
      currentData.recommendations.forEach((r) => {
        if (r.category) categories.add(r.category);
      });

      categorySelect.replaceChildren();
      const allOpt = document.createElement("option");
      allOpt.value = "all";
      allOpt.textContent = "All Categories";
      categorySelect.appendChild(allOpt);

      categories.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat.toLowerCase();
        opt.textContent = cat;
        categorySelect.appendChild(opt);
      });
    }

    function renderRecommendations() {
      if (!recsContainer || !currentData) return;
      recsContainer.replaceChildren();

      const searchQuery = (searchInput ? searchInput.value : "").trim().toLowerCase();
      const activePriorityFilter =
        ($$(".priority-filter-pills .filter-pill.active")[0] &&
          $$(".priority-filter-pills .filter-pill.active")[0].dataset.filter) ||
        "all";
      const activeCategory = (categorySelect ? categorySelect.value : "all").toLowerCase();

      const recs = currentData.recommendations || [];

      const filtered = recs.filter((rec) => {
        const matchesSearch =
          !searchQuery ||
          rec.skill.toLowerCase().includes(searchQuery) ||
          rec.why.toLowerCase().includes(searchQuery) ||
          rec.category.toLowerCase().includes(searchQuery);

        const matchesPriority =
          activePriorityFilter === "all" ||
          rec.priority.toLowerCase() === activePriorityFilter.toLowerCase();

        const matchesCategory =
          activeCategory === "all" || rec.category.toLowerCase() === activeCategory;

        return matchesSearch && matchesPriority && matchesCategory;
      });

      if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-matrix-card";
        empty.innerHTML = `
          <div class="empty-matrix-icon">🔍</div>
          <div class="empty-matrix-title">No matching skills found</div>
          <p class="empty-matrix-desc">Try clearing your search query or switching your priority/category filters.</p>
        `;
        recsContainer.appendChild(empty);
        return;
      }

      filtered.forEach((rec) => {
        const isMastered = !!masteredSkills[rec.skill];
        const card = document.createElement("article");
        card.className = `rec-card ${isMastered ? "mastered" : ""}`;

        card.innerHTML = `
          <div class="rec-card-top">
            <span class="rec-category-badge">${rec.category}</span>
            <span class="rec-priority-badge ${rec.priority.toLowerCase()}">${rec.priority} Priority</span>
          </div>
          <h3 class="rec-card-title">${rec.skill}</h3>
          <p class="rec-card-why">${rec.why}</p>
          <div class="rec-mini-project">
            <div class="mini-project-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              <span>MINI-PROJECT BLUEPRINT</span>
            </div>
            <p class="mini-project-desc">${rec.project}</p>
          </div>
          <div class="rec-card-footer">
            <span class="rec-duration">⏱️ ${rec.duration}</span>
            <div class="rec-links-group">
              <button type="button" class="btn-master-toggle" data-skill="${rec.skill}">
                ${isMastered ? "✓ Mastered" : "Mark Mastered"}
              </button>
              <a href="${rec.url}" target="_blank" rel="noopener noreferrer" class="rec-resource-link">
                ${rec.resource} ↗
              </a>
            </div>
          </div>
        `;

        const toggleBtn = card.querySelector(".btn-master-toggle");
        if (toggleBtn) {
          toggleBtn.addEventListener("click", () => toggleMasteredSkill(rec.skill));
        }

        recsContainer.appendChild(card);
      });
    }

    function renderTimeline() {
      if (!timelineContainer || !currentData || !currentData.roadmap) return;
      timelineContainer.replaceChildren();

      currentData.roadmap.forEach((stage, stageIdx) => {
        const card = document.createElement("article");
        card.className = "timeline-stage-card";

        const accentBar = document.createElement("div");
        accentBar.className = "stage-accent-bar";

        const topMeta = document.createElement("div");
        topMeta.className = "stage-top-meta";

        const indexNum = document.createElement("span");
        indexNum.className = "stage-index-num";
        indexNum.textContent = `0${stageIdx + 1}`;

        const tagBadge = document.createElement("span");
        tagBadge.className = "stage-tag-badge";
        tagBadge.textContent = stage.tag || `STAGE ${stageIdx + 1}`;

        topMeta.appendChild(indexNum);
        topMeta.appendChild(tagBadge);

        const title = document.createElement("h3");
        title.className = "stage-card-title";
        title.textContent = stage.name;

        const desc = document.createElement("p");
        desc.className = "stage-card-desc";
        desc.textContent = stage.description;

        const taskList = document.createElement("div");
        taskList.className = "stage-task-list";

        if (stage.tasks && stage.tasks.length) {
          stage.tasks.forEach((task, taskIdx) => {
            const taskId = `task-${currentData.role}-${stageIdx}-${taskIdx}`;
            const isChecked = !!taskChecks[taskId];

            const taskItem = document.createElement("label");
            taskItem.className = `stage-task-item ${isChecked ? "completed" : ""}`;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = isChecked;
            checkbox.setAttribute("data-task-id", taskId);

            const textSpan = document.createElement("span");
            textSpan.className = "stage-task-text";
            textSpan.textContent = task;

            checkbox.addEventListener("change", (e) => {
              const checked = e.target.checked;
              taskItem.classList.toggle("completed", checked);
              saveTaskCheck(taskId, checked);
            });

            taskItem.appendChild(checkbox);
            taskItem.appendChild(textSpan);
            taskList.appendChild(taskItem);
          });
        }

        card.appendChild(accentBar);
        card.appendChild(topMeta);
        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(taskList);

        timelineContainer.appendChild(card);
      });

      updateProgressCalculations();
    }

    if (roleSelect) {
      roleSelect.addEventListener("change", async () => {
        const newRole = roleSelect.value;
        try {
          const res = await fetch(`/api/roadmap/${encodeURIComponent(newRole)}`);
          if (!res.ok) throw new Error("Could not load role roadmap");
          const roleData = await res.json();
          currentData = roleData;
          populateCategories();
          renderRecommendations();
          renderTimeline();
          updateOverviewBanner();
          showToast(`Loaded blueprint for ${newRole}`, "success");
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        if (clearSearchBtn) clearSearchBtn.hidden = !searchInput.value.trim();
        renderRecommendations();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchBtn.hidden = true;
        renderRecommendations();
      });
    }

    priorityPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        priorityPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        renderRecommendations();
      });
    });

    if (categorySelect) {
      categorySelect.addEventListener("change", renderRecommendations);
    }

    $$(".view-tab-btn").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        $$(".view-tab-btn").forEach((b) => b.classList.remove("active"));
        tabBtn.classList.add("active");

        const target = tabBtn.dataset.target;
        const prioritiesSection = $("priorities-section");
        const roadmapSection = $("roadmap-section");

        if (target === "priorities-section") {
          if (prioritiesSection) prioritiesSection.classList.remove("hidden-view");
          if (roadmapSection) roadmapSection.classList.add("hidden-view");
        } else if (target === "roadmap-section") {
          if (prioritiesSection) prioritiesSection.classList.add("hidden-view");
          if (roadmapSection) roadmapSection.classList.remove("hidden-view");
        } else {
          if (prioritiesSection) prioritiesSection.classList.remove("hidden-view");
          if (roadmapSection) roadmapSection.classList.remove("hidden-view");
        }
      });
    });

    if (checkAllRoadmapBtn) {
      checkAllRoadmapBtn.addEventListener("click", () => {
        $$(".stage-task-item input[type='checkbox']").forEach((cb) => {
          cb.checked = true;
          const id = cb.getAttribute("data-task-id");
          taskChecks[id] = true;
          cb.closest(".stage-task-item").classList.add("completed");
        });
        localStorage.setItem(STORAGE_KEYS.TASK_CHECKS, JSON.stringify(taskChecks));
        updateProgressCalculations();
        showToast("All tasks checked!", "success");
      });
    }

    if (uncheckAllRoadmapBtn) {
      uncheckAllRoadmapBtn.addEventListener("click", () => {
        $$(".stage-task-item input[type='checkbox']").forEach((cb) => {
          cb.checked = false;
          const id = cb.getAttribute("data-task-id");
          taskChecks[id] = false;
          cb.closest(".stage-task-item").classList.remove("completed");
        });
        localStorage.setItem(STORAGE_KEYS.TASK_CHECKS, JSON.stringify(taskChecks));
        updateProgressCalculations();
        showToast("All tasks unchecked");
      });
    }

    if (resetTasksBtn) {
      resetTasksBtn.addEventListener("click", () => {
        if (confirm("Reset all roadmap task checkmarks?")) {
          taskChecks = {};
          localStorage.removeItem(STORAGE_KEYS.TASK_CHECKS);
          renderTimeline();
          showToast("Roadmap progress reset");
        }
      });
    }

    if (copyMarkdownBtn) {
      copyMarkdownBtn.addEventListener("click", () => {
        if (!currentData) return;
        let md = `# SkillSync Career Acceleration Roadmap: ${currentData.role}\n`;
        md += `**Match Overlap Score**: ${currentData.score}%\n\n`;

        md += `## 3-Stage Milestone Learning Roadmap\n\n`;
        (currentData.roadmap || []).forEach((stage, sIdx) => {
          md += `### Stage 0${sIdx + 1}: ${stage.name} (${stage.tag})\n`;
          md += `> ${stage.description}\n\n`;
          (stage.tasks || []).forEach((task, tIdx) => {
            const taskId = `task-${currentData.role}-${sIdx}-${tIdx}`;
            const checked = taskChecks[taskId] ? "[x]" : "[ ]";
            md += `- ${checked} ${task}\n`;
          });
          md += `\n`;
        });

        md += `## Prioritized Skill Gaps & Action Items\n\n`;
        (currentData.recommendations || []).forEach((rec) => {
          md += `### ${rec.skill} (${rec.priority} Priority | ${rec.category})\n`;
          md += `- **Why It Matters**: ${rec.why}\n`;
          md += `- **Mini-Project Challenge**: ${rec.project}\n`;
          md += `- **Estimated Time**: ${rec.duration}\n`;
          md += `- **Learning Resource**: [${rec.resource}](${rec.url})\n\n`;
        });

        md += `---\n*Generated by SkillSync Career Coach*\n`;

        navigator.clipboard.writeText(md).then(
          () => showToast("Roadmap checklist copied to clipboard as Markdown! 📋", "success"),
          () => showToast("Failed to copy to clipboard", "error")
        );
      });
    }

    if (printRoadmapBtn) {
      printRoadmapBtn.addEventListener("click", () => window.print());
    }

    populateCategories();
    renderRecommendations();
    renderTimeline();
    updateOverviewBanner();
  }

  function initPrintButtons() {
    const topbarPrint = $("topbar-print");
    if (topbarPrint) topbarPrint.addEventListener("click", () => window.print());
    const reportPrint = $("print-report");
    if (reportPrint) reportPrint.addEventListener("click", () => window.print());
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMobileMenu();
    initPrintButtons();
    initAnalyzerPage();
    initRoadmapPage();
  });
})();
