# Smart Job Recommendation System ("SmartHire")

A simple, clean, and professional web application for college mini-projects built with **HTML, CSS, Vanilla JavaScript, Node.js, Express.js, and Supabase**.

---

## 🌟 Key Features

1. **Home Page**: Modern landing page showcasing core platform workflow.
2. **User Authentication**: Student registration and login flows.
3. **Student Profile**: Input educational qualification, technical skills, experience, location preference, and target job role.
4. **Dashboard**: Profile completion gauge, statistics, and top job recommendations.
5. **Job Listings & Search**: Interactive search bar with filters (Location, Job Role, Experience).
6. **Job Details & One-Click Apply**: Detailed job view with instant application feedback.
7. **Smart Job Recommendations**: Dynamic skill matching algorithm calculating percentage scores (e.g. 95% Match).

---

## 📁 Project Structure

```
smart-job-recommendation/
├── server/
│   └── server.js           # Express server static file provider & API
├── public/
│   ├── index.html          # Landing Page
│   ├── login.html          # Login Page
│   ├── register.html       # Register Page
│   ├── dashboard.html      # Dashboard Page
│   ├── profile.html        # Profile Form Page
│   ├── jobs.html           # Jobs Search & List Page
│   ├── job-details.html    # Job Details & Apply Page
│   ├── recommendations.html# Recommendations Page
│   ├── css/
│   │   └── style.css       # Responsive Modern CSS
│   └── js/
│       ├── main.js         # Common Utilities & Navbar
│       ├── auth.js         # Register/Login Logic
│       ├── profile.js      # Student Profile Handlers
│       ├── jobs.js         # Jobs Search & Apply Handlers
│       └── recommendations.js # Simple Recommendation Algorithm
├── supabase-schema.sql     # SQL Schema script & 10 sample jobs
├── package.json            # NPM Dependencies
├── .env                    # Environment credentials
└── README.md
```

---

## 🚀 How to Run the Project Locally

### Step 1: Open Terminal in Project Directory
Open VS Code terminal inside `smart-job-recommendation`.

### Step 2: Install Node.js Dependencies
Run:
```bash
npm install
```

### Step 3: Start the Server
Run:
```bash
npm start
```
Or for development with auto-reload:
```bash
npm run dev
```

### Step 4: Open in Web Browser
Navigate to:
`http://localhost:3000`

---

## 🗄️ Setting Up Supabase Database (Optional / Recommended)

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project.
3. Open **SQL Editor** in Supabase dashboard.
4. Paste the entire content of `supabase-schema.sql` and click **Run**.
5. Copy your **Project URL** and **Anon API Key** from Project Settings -> API.
6. Update `.env` with your keys:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```
