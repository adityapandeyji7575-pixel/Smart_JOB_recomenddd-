// ==========================================
// SMARTHIRE RECOMMENDATION ENGINE JAVASCRIPT
// Simple Skill Matching System for College Mini Project
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const recGrid = document.getElementById('recommendations-grid');
    if (recGrid) {
        initRecommendationsPage();
    }
});

async function initRecommendationsPage() {
    const profile = getCurrentProfile();
    const studentSkillsSpan = document.getElementById('student-skills-display');
    const container = document.getElementById('recommendations-grid');

    if (!profile || !profile.skills) {
        if (studentSkillsSpan) studentSkillsSpan.textContent = 'No skills specified yet';
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--card-bg); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <h3>Please complete your profile</h3>
                <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">Enter your skills and preferences to unlock personalized job recommendations.</p>
                <a href="profile.html" class="btn btn-primary">Go to Profile</a>
            </div>
        `;
        return;
    }

    if (studentSkillsSpan) {
        studentSkillsSpan.textContent = profile.skills;
    }

    const jobs = await fetchJobsFromApi();
    const recommendedJobs = computeRecommendations(profile, jobs);
    renderRecommendedCards(recommendedJobs);
}

async function fetchJobsFromApi() {
    try {
        const response = await fetch('/api/jobs');
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        const result = await response.json();
        if (result?.jobs?.length) {
            return result.jobs;
        }
    } catch (error) {
        console.warn('Could not load jobs from backend for recommendations, using fallback jobs.', error);
    }

    return SAMPLE_JOBS;
}

// Compute Simple Match Percentage Logic
function computeRecommendations(profile, jobs) {
    const userSkills = (profile.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const prefRole = (profile.preferred_role || '').toLowerCase();
    const prefLoc = (profile.preferred_location || '').toLowerCase();

    const scoredJobs = jobs.map(job => {
        const jobSkills = (job.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

        let matchCount = 0;
        userSkills.forEach(uSkill => {
            if (jobSkills.some(jSkill => jSkill.includes(uSkill) || uSkill.includes(jSkill))) {
                matchCount++;
            }
        });

        // Skill ratio
        const skillRatio = jobSkills.length > 0 ? (matchCount / jobSkills.length) : 0;
        let matchPercentage = Math.round(skillRatio * 100);

        // Role preference boost
        if (prefRole && job.title.toLowerCase().includes(prefRole)) {
            matchPercentage += 15;
        }

        // Location preference boost
        if (prefLoc && job.location.toLowerCase().includes(prefLoc)) {
            matchPercentage += 10;
        }

        // Bounded range logic for beginner college demo:
        if (matchPercentage < 65) {
            matchPercentage = 65 + (matchCount * 8);
        }
        if (matchPercentage > 95) {
            matchPercentage = 95;
        }

        return {
            ...job,
            matchPercentage
        };
    });

    // Sort descending by highest match percentage
    return scoredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

function renderRecommendedCards(jobs) {
    const container = document.getElementById('recommendations-grid');
    if (!container) return;

    container.innerHTML = jobs.map(job => `
        <div class="job-card">
            <div>
                <div class="job-header">
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <p class="job-company">${job.company}</p>
                    </div>
                    <span class="match-badge">⚡ ${job.matchPercentage}% Match</span>
                </div>

                <div class="job-meta">
                    <span>📍 ${job.location}</span>
                    <span>💰 ${job.salary}</span>
                    <span>🎓 ${job.experience}</span>
                </div>

                <div class="skills-tags">
                    ${job.skills.split(',').map(s => `<span class="tag">${s.trim()}</span>`).join('')}
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <a href="job-details.html?id=${job.id}" class="btn btn-secondary btn-full">View Details</a>
            </div>
        </div>
    `).join('');
}
