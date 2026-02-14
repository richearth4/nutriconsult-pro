/**
 * Auth Controller
 * Handles login, logout, and session checks using Railway backend API.
 */

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', async () => {
    const session = getSession();
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('index.html') || path === '/' || path.endsWith('/');

    if (session) {
        // Verify token is still valid
        try {
            await api.verifyToken();
            if (isLoginPage) {
                // Redirect if already logged in
                redirectUser(session.role);
            }
        } catch (error) {
            // Token invalid, clear session
            logout();
            if (!isLoginPage) {
                window.location.href = 'index.html';
            }
        }
    } else {
        if (!isLoginPage) {
            // Redirect to login if not logged in
            window.location.href = 'index.html';
        }
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            handleAuthAction(async () => {
                const response = await api.login(email, password);
                if (response.success) {
                    saveSession(response.user);
                    redirectUser(response.user.role);
                } else {
                    throw new Error('Invalid credentials');
                }
            }, submitBtn, errorMsg, 'Sign In');
        });
    }

    // Sign Up Form Handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const errorMsg = document.getElementById('regErrorMsg');
            const submitBtn = signupForm.querySelector('button[type="submit"]');

            handleAuthAction(async () => {
                const response = await api.register(email, password, name);
                if (response.success) {
                    saveSession(response.user);
                    redirectUser(response.user.role);
                } else {
                    throw new Error(response.error || 'Registration failed');
                }
            }, submitBtn, errorMsg, 'Create Account');
        });
    }

    // Google Auth Placeholder
    document.querySelectorAll('.btn-google').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Google Sign-in integration coming soon!');
        });
    });
});

/**
 * Common Auth Action Handler
 */
async function handleAuthAction(action, button, errorEl, originalText) {
    button.disabled = true;
    const originalContent = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span> Processing...';
    errorEl.style.display = 'none';

    try {
        await action();
    } catch (error) {
        console.error('Auth error:', error);
        errorEl.textContent = error.message || 'Action failed. Please try again.';
        errorEl.style.display = 'block';
        button.disabled = false;
        button.innerHTML = originalContent;
    }
}

function saveSession(user) {
    localStorage.setItem('nutri_token', user.token);
    const session = {
        userId: user.userId,
        role: user.role,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier || 'free'
    };
    localStorage.setItem('nutri_session', JSON.stringify(session));
}

function toggleAuth(type) {
    const loginSec = document.getElementById('loginSection');
    const signupSec = document.getElementById('signupSection');
    const authCard = document.querySelector('.auth-card');

    authCard.classList.remove('animate-slide-up');
    void authCard.offsetWidth; // Trigger reflow
    authCard.classList.add('animate-slide-up');

    if (type === 'signup') {
        loginSec.style.display = 'none';
        signupSec.style.display = 'block';
    } else {
        loginSec.style.display = 'block';
        signupSec.style.display = 'none';
    }
}

// Logout Handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        window.location.href = 'index.html';
    });
}

function redirectUser(role) {
    if (role === 'admin') {
        window.location.href = 'dashboard-admin.html';
    } else {
        window.location.href = 'dashboard-client.html';
    }
}

function getSession() {
    const sessionData = localStorage.getItem('nutri_session');
    return sessionData ? JSON.parse(sessionData) : null;
}

function logout() {
    localStorage.removeItem('nutri_token');
    localStorage.removeItem('nutri_session');
}
