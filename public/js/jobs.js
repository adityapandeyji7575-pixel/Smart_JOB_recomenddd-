// ==========================================
// SMARTHIRE JOBS & APPLICATIONS JAVASCRIPT
// Handles Job listings, Search, Filters & Applications
// ==========================================

let currentJobs = SAMPLE_JOBS;

document.addEventListener('DOMContentLoaded', () => {
    // 1. If on Jobs page
    const jobsGrid = document.getElementById('jobs-grid');
    if (jobsGrid) {
        initJobsPage();
    }

    // 2. If on Job Details page
    const jobDetailsContainer = document.getElementById('job-details-container');
    if (jobDetailsContainer) {
        initJobDetailsPage();
    }

    // 3. If on Dashboard
    const dashboardJobsGrid = document.getElementById('dashboard-jobs-grid');
    if (dashboardJobsGrid) {
        initDashboardPage();
    }
});

async function fetchJobsFromApi() {
    try {
        const response = await fetch('/api/jobs');
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        const result = await response.json();
        if (result?.jobs?.length) {
            currentJobs = result.jobs;
            return currentJobs;
        }
    } catch (error) {
        console.warn('Could not load jobs from backend, using fallback jobs.', error);
    }

    currentJobs = SAMPLE_JOBS;
    return currentJobs;
}

// Initialize Jobs Page with Search and Filters
async function initJobsPage() {
    await fetchJobsFromApi();
    renderJobListings(currentJobs);

    const searchInput = document.getElementById('search-input');
    const locationFilter = document.getElementById('location-filter');
    const roleFilter = document.getElementById('role-filter');
    const experienceFilter = document.getElementById('experience-filter');

    const filterHandler = () => {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const loc = locationFilter ? locationFilter.value.toLowerCase() : '';
        const role = roleFilter ? roleFilter.value.toLowerCase() : '';
        const exp = experienceFilter ? experienceFilter.value.toLowerCase() : '';

        const filtered = currentJobs.filter(job => {
            const matchesQuery = !query ||
                job.title.toLowerCase().includes(query) ||
                job.company.toLowerCase().includes(query) ||
                job.skills.toLowerCase().includes(query);

            const matchesLoc = !loc || job.location.toLowerCase().includes(loc);
            const matchesRole = !role || job.title.toLowerCase().includes(role);
            const matchesExp = !exp || job.experience.toLowerCase().includes(exp);

            return matchesQuery && matchesLoc && matchesRole && matchesExp;
        });

        renderJobListings(filtered);
    };

    if (searchInput) searchInput.addEventListener('input', filterHandler);
    if (locationFilter) locationFilter.addEventListener('change', filterHandler);
    if (roleFilter) roleFilter.addEventListener('change', filterHandler);
    if (experienceFilter) experienceFilter.addEventListener('change', filterHandler);
}

// Render Job Cards Grid
function renderJobListings(jobs) {
    const container = document.getElementById('jobs-grid');
    if (!container) return;

    if (jobs.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <h3>No jobs found</h3>
                <p style="color: var(--text-muted);">Try adjusting your search query or filters.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = jobs.map(job => `
        <div class="job-card">
            <div>
                <div class="job-header">
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <p class="job-company">${job.company}</p>
                    </div>
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

// Initialize Job Details Page
async function initJobDetailsPage() {
    await fetchJobsFromApi();
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id') || 'job-1';

    const job = currentJobs.find(j => j.id === jobId) || SAMPLE_JOBS.find(j => j.id === jobId) || SAMPLE_JOBS[0];
    const container = document.getElementById('job-details-container');

    if (!container) return;

    container.innerHTML = `
        <div style="background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow-md);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1 style="font-size: 2rem; color: var(--secondary-color); font-weight: 800;">${job.title}</h1>
                    <h3 style="color: var(--primary-color); margin-top: 0.25rem;">${job.company}</h3>
                </div>
                <button id="apply-now-btn" class="btn btn-primary" style="font-size: 1.1rem;">Apply Now</button>
            </div>

            <div id="apply-status" style="display: none;"></div>

            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 1.5rem 0;" />

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div>
                    <strong style="color: var(--text-muted); display: block; font-size: 0.85rem; text-transform: uppercase;">Location</strong>
                    <span style="font-size: 1.1rem; font-weight: 600;">📍 ${job.location}</span>
                </div>
                <div>
                    <strong style="color: var(--text-muted); display: block; font-size: 0.85rem; text-transform: uppercase;">Salary Package</strong>
                    <span style="font-size: 1.1rem; font-weight: 600;">💰 ${job.salary}</span>
                </div>
                <div>
                    <strong style="color: var(--text-muted); display: block; font-size: 0.85rem; text-transform: uppercase;">Experience Required</strong>
                    <span style="font-size: 1.1rem; font-weight: 600;">⏳ ${job.experience}</span>
                </div>
                <div>
                    <strong style="color: var(--text-muted); display: block; font-size: 0.85rem; text-transform: uppercase;">Qualification</strong>
                    <span style="font-size: 1.1rem; font-weight: 600;">🎓 ${job.qualification}</span>
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 0.75rem; color: var(--secondary-color);">Required Skills</h3>
                <div class="skills-tags">
                    ${job.skills.split(',').map(s => `<span class="tag" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">${s.trim()}</span>`).join('')}
                </div>
            </div>

            <div>
                <h3 style="margin-bottom: 0.75rem; color: var(--secondary-color);">Job Description</h3>
                <p style="color: var(--text-main); font-size: 1.05rem; line-height: 1.8;">${job.description}</p>
            </div>
        </div>
    `;

    document.getElementById('apply-now-btn')?.addEventListener('click', () => {
        handleApplyJob(job);
    });
}

// Handle Job Application
function handleApplyJob(job) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login to apply for jobs.');
        window.location.href = 'login.html';
        return;
    }

    const applications = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.APPLICATIONS) || '[]');
    const alreadyApplied = applications.some(app => app.jobId === job.id);

    const statusDiv = document.getElementById('apply-status');

    if (alreadyApplied) {
        statusDiv.className = 'alert alert-error';
        statusDiv.textContent = 'You have already applied for this job.';
        statusDiv.style.display = 'block';
        return;
    }

    applications.push({
        id: 'app-' + Date.now(),
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        appliedAt: new Date().toISOString()
    });

    localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));

    statusDiv.className = 'alert alert-success';
    statusDiv.textContent = 'Application submitted successfully.';
    statusDiv.style.display = 'block';

    const applyBtn = document.getElementById('apply-now-btn');
    if (applyBtn) {
        applyBtn.textContent = 'Applied';
        applyBtn.disabled = true;
        applyBtn.style.opacity = '0.7';
    }
}

// Initialize Student Dashboard
async function initDashboardPage() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    await fetchJobsFromApi();

    const profile = getCurrentProfile() || {};
    const applications = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.APPLICATIONS) || '[]');

    document.getElementById('welcome-user').textContent = `Welcome, ${profile.full_name || user.full_name || 'Student'}`;

    // Profile Completion Percentage
    let filledFields = 0;
    const fields = ['full_name', 'email', 'qualification', 'skills', 'experience', 'preferred_location', 'preferred_role'];
    fields.forEach(f => { if (profile[f]) filledFields++; });
    const profilePercent = Math.round((filledFields / fields.length) * 100);

    document.getElementById('stat-completion').textContent = `${profilePercent}%`;
    document.getElementById('stat-applications').textContent = applications.length;

    // Render top 3 recommended jobs on Dashboard
    const recommendedJobs = computeRecommendations(profile, currentJobs).slice(0, 3);
    document.getElementById('stat-recommended-count').textContent = recommendedJobs.length;

    const dashboardContainer = document.getElementById('dashboard-jobs-grid');
    dashboardContainer.innerHTML = recommendedJobs.map(job => `
        <div class="job-card">
            <div>
                <div class="job-header">
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <p class="job-company">${job.company}</p>
                    </div>
                    <span class="match-badge">${job.matchPercentage}% Match</span>
                </div>

                <div class="job-meta">
                    <span>📍 ${job.location}</span>
                    <span>💰 ${job.salary}</span>
                </div>

                <div class="skills-tags">
                    ${job.skills.split(',').map(s => `<span class="tag">${s.trim()}</span>`).join('')}
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <a href="job-details.html?id=${job.id}" class="btn btn-secondary btn-full">View Job</a>
            </div>
        </div>
    `).join('');
}
