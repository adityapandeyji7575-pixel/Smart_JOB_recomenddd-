// ==========================================
// SMARTHIRE PROFILE MANAGEMENT JAVASCRIPT
// Handles loading & saving student profile details in Supabase
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    await loadProfileData();

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleSaveProfile);
    }

    const downloadButton = document.getElementById('download-resume');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadResumePdf);
    }
});

function downloadResumePdf() {
    const form = document.getElementById('profile-form');
    if (!form.reportValidity()) return;

    if (!window.jspdf || !window.jspdf.jsPDF) {
        showAlert('PDF download is unavailable. Please check your internet connection and try again.', 'error');
        return;
    }

    const values = {
        name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        qualification: document.getElementById('qualification').value,
        experience: document.getElementById('experience').value,
        skills: document.getElementById('skills').value.trim(),
        location: document.getElementById('preferred_location').value.trim(),
        role: document.getElementById('preferred_role').value.trim()
    };

    const doc = new window.jspdf.jsPDF();
    const left = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(values.name, left, 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(90, 100, 115);
    doc.text(values.email, left, 33);
    doc.setDrawColor(203, 213, 225);
    doc.line(left, 40, pageWidth - left, 40);

    let y = 52;
    const addSection = (title, content) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text(title, left, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        const lines = doc.splitTextToSize(content || 'Not provided', pageWidth - left * 2);
        doc.text(lines, left, y);
        y += lines.length * 6 + 9;
    };

    addSection('Professional Summary', `${values.experience} candidate seeking a ${values.role} position.`);
    addSection('Education', values.qualification);
    addSection('Technical Skills', values.skills);
    addSection('Work Preferences', `Preferred role: ${values.role}\nPreferred location: ${values.location}`);

    doc.save(`${values.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'student'}-resume.pdf`);
}

// Load Profile Data from Supabase / Local Storage
async function loadProfileData() {
    const user = getCurrentUser();
    let existingProfile = getCurrentProfile();

    // Fetch latest profile from Supabase if connected
    if (supabaseClient && user && user.id) {
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data && !error) {
                existingProfile = data;
                localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(data));
            }
        } catch (e) {
            console.warn('Could not fetch Supabase profile:', e);
        }
    }

    if (document.getElementById('email') && user) {
        document.getElementById('email').value = user.email || '';
    }
    if (document.getElementById('full_name') && user) {
        document.getElementById('full_name').value = user.full_name || '';
    }

    if (existingProfile) {
        if (existingProfile.full_name) document.getElementById('full_name').value = existingProfile.full_name;
        if (existingProfile.qualification) document.getElementById('qualification').value = existingProfile.qualification;
        if (existingProfile.skills) document.getElementById('skills').value = existingProfile.skills;
        if (existingProfile.experience) document.getElementById('experience').value = existingProfile.experience;
        if (existingProfile.preferred_location) document.getElementById('preferred_location').value = existingProfile.preferred_location;
        if (existingProfile.preferred_role) document.getElementById('preferred_role').value = existingProfile.preferred_role;
    }
}

// Save Profile Data to Supabase
async function handleSaveProfile(e) {
    e.preventDefault();
    const user = getCurrentUser();

    const profileData = {
        full_name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        qualification: document.getElementById('qualification').value,
        skills: document.getElementById('skills').value.trim(),
        experience: document.getElementById('experience').value,
        preferred_location: document.getElementById('preferred_location').value.trim(),
        preferred_role: document.getElementById('preferred_role').value.trim()
    };

    // Prefer server-side profile save (uses service role key)
    if (user && user.id) {
        showAlert('Saving profile...', 'success');

        const serverResp = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, ...profileData })
        }).catch(err => ({ ok: false, error: err }));

        if (!serverResp || !serverResp.ok) {
            // Fallback to client-side upsert if server endpoint not available
            if (supabaseClient) {
                const { error } = await supabaseClient
                    .from('profiles')
                    .upsert({ user_id: user.id, ...profileData }, { onConflict: 'user_id' });

                if (error) console.warn('Supabase Profile Save Error (client):', error.message);
            } else {
                console.warn('Profile save failed: no server endpoint and no supabase client.');
            }
        } else {
            const json = await serverResp.json();
            if (json && json.error) {
                console.warn('Server profile save error:', json.error);
            }
        }
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
    showAlert('Profile saved successfully!', 'success');

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1200);
}

function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('profile-alert');
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
}
