document.addEventListener('DOMContentLoaded', function() {
    // Admin credentials
    const validCredentials = [
        { email: 'adminfillpit55@gmail.com', password: 'admin55@55fill' },
        { email: 'administrator55fillpit', password: 'administrator55pit' }
    ];

    // Get form elements
    const loginForm = document.querySelector('.screen-1');
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const loginButton = document.querySelector('.login');
    
    // Show/hide password functionality
    const showHideBtn = document.querySelector('.show-hide');
    if (showHideBtn) {
        showHideBtn.addEventListener('click', function() {
            const passwordInput = document.querySelector('.pas');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                showHideBtn.setAttribute('name', 'eye-off-outline');
            } else {
                passwordInput.type = 'password';
                showHideBtn.setAttribute('name', 'eye-outline');
            }
        });
    }

    // Handle login
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Check if credentials match any valid admin
        const isValidAdmin = validCredentials.some(admin => 
            admin.email === email && admin.password === password
        );
        
        if (isValidAdmin) {
            // Store login status in session storage
            sessionStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'panel.html';
        } else {
            alert('Invalid admin credentials. Access denied.');
        }
    });
});