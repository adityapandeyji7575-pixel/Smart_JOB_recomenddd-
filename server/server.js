const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
// Optional service role key for server-side privileged operations (store in .env)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const supabaseService = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Public browser config: expose only the Supabase URL and publishable/anon key.
app.get('/api/supabase-config', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({
        supabaseUrl: process.env.SUPABASE_URL || '',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
        configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
    });
});

// Simple Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Server is running smoothly!',
        appName: 'SmartHire - Smart Job Recommendation System',
        supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
    });
});

// Simple Backend Recommendation Calculation Endpoint (Server-Side Logic Option)
app.post('/api/recommendations', (req, res) => {
    const { userSkills = '', preferredRole = '', preferredLocation = '', jobs = [] } = req.body;

    const studentSkillsList = userSkills
        .toLowerCase()
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const recommendedJobs = jobs.map(job => {
        const requiredSkillsList = (job.skills || '')
            .toLowerCase()
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        let matchingSkillsCount = 0;
        studentSkillsList.forEach(skill => {
            if (requiredSkillsList.some(reqSkill => reqSkill.includes(skill) || skill.includes(reqSkill))) {
                matchingSkillsCount++;
            }
        });

        const totalSkills = Math.max(requiredSkillsList.length, 1);
        let matchPercentage = Math.round((matchingSkillsCount / totalSkills) * 100);

        // Boost match score if preferred role or location matches
        if (preferredRole && job.title.toLowerCase().includes(preferredRole.toLowerCase())) {
            matchPercentage += 15;
        }
        if (preferredLocation && job.location.toLowerCase().includes(preferredLocation.toLowerCase())) {
            matchPercentage += 10;
        }

        // Clamp percentage between 60% and 98% for realistic feel
        if (matchPercentage < 60) matchPercentage = 60 + (matchingSkillsCount * 8);
        if (matchPercentage > 98) matchPercentage = 98;

        return {
            ...job,
            matchPercentage
        };
    });

    // Sort by match percentage descending
    recommendedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({ recommendations: recommendedJobs });
});

// Jobs endpoint, served from Supabase when configured
app.get('/api/jobs', async (req, res) => {
    if (!supabaseClient) {
        return res.status(500).json({
            error: 'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env.'
        });
    }

    const { data, error } = await supabaseClient
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ jobs: data });
});

// Server-side profile save endpoint (uses service role key if configured).
// This avoids requiring the anon key to be present in the browser and works with RLS.
app.post('/api/profile', async (req, res) => {
    const profile = req.body;

    if (!supabaseService) {
        return res.status(500).json({ error: 'Supabase service role key not configured on server. Add SUPABASE_SERVICE_ROLE_KEY to .env to enable server-side profile saves.' });
    }

    try {
        const { data, error } = await supabaseService
            .from('profiles')
            .upsert(profile, { onConflict: 'user_id' });

        if (error) return res.status(500).json({ error: error.message });

        return res.json({ data });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Catch-all route to serve main page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 SmartHire Server running at: http://localhost:${PORT}`);
    console.log(`===================================================`);
});
