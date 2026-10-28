// ==========================================
// SMARTHIRE AUTHENTICATION JAVASCRIPT
// Uses official Supabase Auth (signUp, signInWithPassword)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Handle User Registration with Supabase Authentication
async function handleRegister(e) {
    e.preventDefault();
    const alertBox = document.getElementById('auth-alert');
    if (alertBox) alertBox.style.display = 'none';

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

    // Official Supabase Auth Registration
    if (supabaseClient) {
        showAlert('Creating account ', 'success');

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: fullName }
            }
        });

        if (error) {
            showAlert(`Supabase Auth Error: ${error.message}`, 'error');
            return;
        }

        if (data.user) {
            // Save initial profile row using server-side endpoint if available
            const profilePayload = {
                user_id: data.user.id,
                full_name: fullName,
                email: email,
                qualification: 'B.Tech',
                skills: 'Python, SQL, HTML, CSS',
                experience: 'Fresher',
                preferred_location: 'Noida',
                preferred_role: 'Python Developer'
            };

            let profileError = null;
            if (window.fetch) {
                try {
                    const resp = await fetch('/api/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(profilePayload)
                    });
                    const json = await resp.json();
                    if (!resp.ok) {
                        profileError = new Error(json.error || 'Profile save failed');
                    }
                } catch (e) {
                    profileError = e;
                }
            }

            if (profileError && supabaseClient) {
                const { error } = await supabaseClient
                    .from('profiles')
                    .upsert(profilePayload, { onConflict: 'user_id' });
                if (error) profileError = error;
            }

            if (profileError) {
                console.warn('Profile table insert notice:', profileError.message);
            }

            const newUser = {
                id: data.user.id,
                email: data.user.email,
                full_name: fullName
            };
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(newUser));

            const initialProfile = {
                full_name: fullName,
                email: email,
                qualification: 'B.Tech',
                skills: 'Python, SQL, HTML, CSS',
                experience: 'Fresher',
                preferred_location: 'Noida',
                preferred_role: 'Python Developer'
            };
            localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(initialProfile));

            showAlert('Account created successfully in Supabase! Redirecting to Profile...', 'success');
            setTimeout(() => { window.location.href = 'profile.html'; }, 1200);
            return;
        }
    }

    // Local Session Fallback (if Supabase credentials not set yet)
    const newUser = {
        id: 'user-' + Date.now(),
        email: email,
        full_name: fullName
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(newUser));

    const initialProfile = {
        full_name: fullName,
        email: email,
        qualification: 'B.Tech',
        skills: 'Python, SQL, HTML, CSS',
        experience: 'Fresher',
        preferred_location: 'Noida',
        preferred_role: 'Python Developer'
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(initialProfile));

    showAlert('Account created successfully! Redirecting to Profile page...', 'success');
    setTimeout(() => { window.location.href = 'profile.html'; }, 1200);
}

// Handle User Login with Supabase Authentication
async function handleLogin(e) {
    e.preventDefault();
    const alertBox = document.getElementById('auth-alert');
    if (alertBox) alertBox.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAlert('Please enter your email and password.', 'error');
        return;
    }

    // Official Supabase Auth Login
    if (supabaseClient) {
        showAlert('Authenticating with Supabase...', 'success');

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            showAlert(`Supabase Auth Error: ${error.message}`, 'error');
            return;
        }

        if (data.user) {
            const user = {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || email.split('@')[0]
            };

            localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));

            // Fetch student profile from Supabase 'profiles' table
            const { data: profileData, error: profErr } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('user_id', data.user.id)
                .single();

            if (profileData && !profErr) {
                localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
            }

            showAlert('Supabase Login successful! Redirecting to Dashboard...', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
            return;
        }
    }

    // Local Session Fallback
    const user = {
        id: 'user-' + Date.now(),
        email: email,
        full_name: email.split('@')[0] || 'Student'
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    showAlert('Login successful! Redirecting to Dashboard...', 'success');

    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
}

// Display UI Alert Message
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('auth-alert');
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
}
