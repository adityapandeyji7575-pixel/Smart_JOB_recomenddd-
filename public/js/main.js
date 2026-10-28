// ==========================================
// SMARTHIRE MAIN GLOBAL JAVASCRIPT
// Handles Supabase SDK initialization & navigation
// ==========================================

// Load the public Supabase config from the server so every visitor can use auth.
// Browser storage remains a fallback for local demos and manual setup.
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';
let supabaseClient = null;

const supabaseReady = (async () => {
    let config = {};
    try {
        const response = await fetch('/api/supabase-config', { cache: 'no-store' });
        if (response.ok) config = await response.json();
    } catch (error) {
        console.warn('Could not load Supabase config from server:', error);
    }

    SUPABASE_URL = config.supabaseUrl || localStorage.getItem('SUPABASE_URL') || '';
    SUPABASE_ANON_KEY = config.supabaseAnonKey || localStorage.getItem('SUPABASE_ANON_KEY') || '';

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        localStorage.setItem('SUPABASE_URL', SUPABASE_URL);
        localStorage.setItem('SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);
    }

    if (!window.supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully.');
        return supabaseClient;
    } catch (error) {
        console.error('Supabase client initialization failed:', error);
        return null;
    }
})();

// Config Key Handler for User UI
function setSupabaseConfig(url, key) {
    localStorage.setItem('SUPABASE_URL', url);
    localStorage.setItem('SUPABASE_ANON_KEY', key);
    location.reload();
}

// Sample Jobs Fallback Data
const SAMPLE_JOBS = [
    {
        id: "job-1",
        title: "Python Developer",
        company: "ABC Technologies",
        location: "Noida",
        salary: "4–6 LPA",
        skills: "Python, Flask, SQL, HTML, CSS",
        qualification: "B.Tech / BCA",
        experience: "Fresher",
        description: "We are looking for an enthusiastic Python Developer to build dynamic backend services and manage database queries for our tech products."
    },
    {
        id: "job-2",
        title: "Frontend Developer",
        company: "WebCraft Studio",
        location: "Delhi / Remote",
        salary: "3.5–5 LPA",
        skills: "HTML, CSS, JavaScript, React",
        qualification: "B.Tech / BCA / BSc",
        experience: "Fresher",
        description: "Responsible for building sleek visual web elements, maintaining responsive web design, and delivering seamless user experience."
    },
    {
        id: "job-3",
        title: "Backend Developer",
        company: "DataCore Systems",
        location: "Gurugram",
        salary: "5–7 LPA",
        skills: "Node.js, Express, SQL, MongoDB",
        qualification: "B.Tech / MCA",
        experience: "0–1 Years",
        description: "Develop reliable RESTful APIs, manage server-side security, and build microservice architectures for high-traffic platforms."
    },
    {
        id: "job-4",
        title: "Data Analyst",
        company: "Insight Analytics",
        location: "Noida",
        salary: "4.5–6.5 LPA",
        skills: "Python, SQL, Excel, PowerBI",
        qualification: "B.Tech / BSc Stats",
        experience: "Fresher",
        description: "Extract business insights from raw data, create analytical reports, and maintain SQL dashboards for enterprise clients."
    },
    {
        id: "job-5",
        title: "Java Developer",
        company: "Apex Solutions",
        location: "Bengaluru / Remote",
        salary: "5–8 LPA",
        skills: "Java, Spring Boot, MySQL, Git",
        qualification: "B.Tech / MCA",
        experience: "0–2 Years",
        description: "Build robust, scalable Java enterprise applications using Spring Boot microservices and object-oriented principles."
    },
    {
        id: "job-6",
        title: "Web Developer",
        company: "Digital Creations",
        location: "Delhi",
        salary: "3–4.5 LPA",
        skills: "HTML, CSS, JavaScript, PHP, MySQL",
        qualification: "BCA / Diploma",
        experience: "Fresher",
        description: "Create client websites, integrate front-end design mockups, maintain dynamic forms, and optimize cross-browser performance."
    },
    {
        id: "job-7",
        title: "Software Engineer",
        company: "InnovateX Labs",
        location: "Gurugram",
        salary: "6–9 LPA",
        skills: "Python, C++, SQL, Algorithms",
        qualification: "B.Tech CS/IT",
        experience: "Fresher",
        description: "Work directly with core product development teams to design core software architecture and optimize system speed."
    },
    {
        id: "job-8",
        title: "Database Developer",
        company: "CloudData Inc",
        location: "Noida",
        salary: "4.5–6 LPA",
        skills: "SQL, PostgreSQL, Database Optimization, Python",
        qualification: "B.Tech / MCA",
        experience: "1 Year",
        description: "Architect SQL databases, construct stored procedures, fine-tune query performance, and ensure automated database backups."
    },
    {
        id: "job-9",
        title: "UI/UX Designer",
        company: "Creative Hub",
        location: "Remote",
        salary: "4–6 LPA",
        skills: "Figma, Wireframing, Prototyping, HTML, CSS",
        qualification: "Graduation / Design Degree",
        experience: "Fresher",
        description: "Design modern user interfaces, conduct user research, build interactive wireframes, and collaborate closely with developers."
    },
    {
        id: "job-10",
        title: "Full Stack Developer",
        company: "Nexus Tech Solutions",
        location: "Noida",
        salary: "6–8.5 LPA",
        skills: "HTML, CSS, JavaScript, Node.js, Python, SQL",
        qualification: "B.Tech / MCA",
        experience: "0–1 Years",
        description: "Oversee end-to-end web engineering, from crafting responsive frontends to building efficient server-side database handlers."
    }
];

// LocalStorage Helper Keys
const LOCAL_STORAGE_KEYS = {
    USER: 'smarthire_user',
    PROFILE: 'smarthire_profile',
    APPLICATIONS: 'smarthire_applications',
    JOBS: 'smarthire_jobs'
};

if (!localStorage.getItem(LOCAL_STORAGE_KEYS.JOBS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.JOBS, JSON.stringify(SAMPLE_JOBS));
}

function getCurrentUser() {
    const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
}

function getCurrentProfile() {
    const profileStr = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILE);
    return profileStr ? JSON.parse(profileStr) : null;
}

document.addEventListener('DOMContentLoaded', async () => {
    await supabaseReady;

    // Sync session if Supabase client active
    if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            const user = {
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
            };
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
        }
    }
    updateNavbarState();
});

function updateNavbarState() {
    const user = getCurrentUser();
    const navLinksContainer = document.getElementById('nav-dynamic-links');
    if (!navLinksContainer) return;

    if (user) {
        navLinksContainer.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="dashboard.html">Dashboard</a></li>
            <li><a href="jobs.html">Jobs</a></li>
            <li><a href="recommendations.html">Recommendations</a></li>
            <li><a href="profile.html">My Profile</a></li>
            <li><a href="#" id="logout-btn" class="btn-nav-primary">Logout</a></li>
        `;

        document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (supabaseClient) {
                await supabaseClient.auth.signOut();
            }
            localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.PROFILE);
            window.location.href = 'login.html';
        });
    } else {
        navLinksContainer.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="jobs.html">Jobs</a></li>
            <li><a href="login.html">Login</a></li>
            <li><a href="register.html" class="btn-nav-primary">Register</a></li>
        `;
    }
}
