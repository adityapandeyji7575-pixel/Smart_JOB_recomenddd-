// ==========================================
// SMARTHIRE AUTHENTICATION JAVASCRIPT
// Uses Supabase Auth for real online accounts.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
});

async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('full_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (!fullName || !email || !password) {
        showAlert('Please fill in all required fields.', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showAlert('Passwords do not match. Please re-enter.', 'error');
        return;
    }
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'error');
        return;
    }

    await supabaseReady;
    if (!supabaseClient) {
        showAlert('Supabase is not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY in Vercel.', 'error');
        return;
    }

    showAlert('Creating account...', 'success');
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
    });

    if (error) {
        showAlert(`Supabase Auth Error: ${error.message}`, 'error');
        return;
    }
    if (!data.user) {
        showAlert('Supabase did not return a user. Please try again.', 'error');
        return;
    }

    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        showAlert('An account with this email may already exist. Try signing in with its password.', 'error');
        return;
    }

    if (!data.session) {
        showAlert('Account created. Check your email and confirm the address before signing in.', 'success');
        return;
    }

    const profilePayload = {
        user_id: data.user.id,
        full_name: fullName,
        email,
        qualification: 'B.Tech',
        skills: 'Python, SQL, HTML, CSS',
        experience: 'Fresher',
        preferred_location: 'Noida',
        preferred_role: 'Python Developer'
    };

    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profilePayload)
        });
        if (!response.ok) {
            const { error: serverError } = await response.json().catch(() => ({}));
            const { error: clientError } = await supabaseClient
                .from('profiles')
                .upsert(profilePayload, { onConflict: 'user_id' });
            if (clientError) console.warn('Profile save notice:', serverError || clientError.message);
        }
    } catch (profileError) {
        console.warn('Profile save notice:', profileError.message);
    }

    const user = {
        id: data.user.id,
        email: data.user.email,
        full_name: fullName
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify({
        full_name: fullName,
        email,
        qualification: profilePayload.qualification,
        skills: profilePayload.skills,
        experience: profilePayload.experience,
        preferred_location: profilePayload.preferred_location,
        preferred_role: profilePayload.preferred_role
    }));

    showAlert('Account created with Supabase. Check your email if confirmation is required.', 'success');
    setTimeout(() => { window.location.href = 'profile.html'; }, 1500);
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAlert('Please enter your email and password.', 'error');
        return;
    }

    await supabaseReady;
    if (!supabaseClient) {
        showAlert('Supabase is not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY in Vercel.', 'error');
        return;
    }

    showAlert('Authenticating with Supabase...', 'success');
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        showAlert(`Supabase Auth Error: ${error.message}`, 'error');
        return;
    }
    if (!data.user) {
        showAlert('Supabase did not return a user. Please try again.', 'error');
        return;
    }

    const user = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || email.split('@')[0]
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));

    const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

    if (profileData && !profileError) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
    }

    showAlert('Supabase login successful! Redirecting to Dashboard...', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
}

function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('auth-alert');
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
}
