document.addEventListener('DOMContentLoaded', function() {
    // Toggle between login and signup forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    // Show/hide password functionality
    const togglePasswordVisibility = function(e) {
        const passwordInput = e.target.previousElementSibling;
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            e.target.setAttribute('name', 'eye-off-outline');
        } else {
            passwordInput.type = 'password';
            e.target.setAttribute('name', 'eye-outline');
        }
    };

    // Add event listeners to all show/hide password icons
    document.querySelectorAll('.show-hide').forEach(icon => {
        icon.addEventListener('click', togglePasswordVisibility);
    });

    // Toggle between forms
    showSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Handle sign in
    document.getElementById('signin-btn').addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Store login status
            sessionStorage.setItem('userLoggedIn', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid email or password. Please try again.');
        }
    });

    // Handle sign up
    document.getElementById('signup-btn').addEventListener('click', function(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();

        if (!username || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Get existing users or initialize empty array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        if (users.some(user => user.email === email)) {
            alert('Email already registered. Please use a different email.');
            return;
        }

        // Add new user
        const newUser = { username, email, password, profileComplete: false };
        users.push(newUser);
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login after signup
        sessionStorage.setItem('userLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(newUser));
        
        alert('Account created successfully!');
        window.location.href = 'dashboard.html';
    });
});
