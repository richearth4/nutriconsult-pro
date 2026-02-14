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

            // Disable button during login
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';

            try {
                const response = await api.login(email, password);

                if (response.success) {
                    // Store token
                    localStorage.setItem('nutri_token', response.user.token);

                    // Store session
                    const session = {
                        userId: response.user.userId,
                        role: response.user.role,
                        name: response.user.name,
                        email: response.user.email,
                        subscriptionTier: response.user.subscriptionTier || 'free'
                    };
                    localStorage.setItem('nutri_session', JSON.stringify(session));

                    // Redirect based on role
                    redirectUser(response.user.role);
                } else {
                    errorMsg.textContent = 'Invalid credentials';
                    errorMsg.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorMsg.textContent = error.message || 'Login failed. Please try again.';
                errorMsg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        });
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
});

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
