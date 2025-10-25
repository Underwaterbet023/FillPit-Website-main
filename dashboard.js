document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isUserLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
    
    if (!isUserLoggedIn) {
        // Redirect to login page if not logged in
        window.location.href = 'user-login.html';
        return;
    }
    
    // Get current user data
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    // Sync with localStorage to ensure latest data
    if (userIndex !== -1) {
        currentUser = users[userIndex];
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Check if user has pending submissions and update submit link visibility
    updateSubmitLinkVisibility();
    
    // Function to update submit link visibility based on user's submission status
    function updateSubmitLinkVisibility() {
        const submitLink = document.querySelector('.menu ul li a[href="submit.html"]');
        if (!submitLink) return;
        
        // Get current user
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        
        // Check if user has any pending submissions
        const hasPendingSubmission = currentUser.submissions && 
            currentUser.submissions.some(sub => sub.status === 'pending');
        
        // Enable/disable submit link based on pending submission status
        if (hasPendingSubmission) {
            submitLink.classList.add('disabled');
            submitLink.setAttribute('href', '#');
            submitLink.setAttribute('title', 'You already have a pending submission');
            submitLink.style.opacity = '0.6';
            submitLink.style.cursor = 'not-allowed';
        } else {
            submitLink.classList.remove('disabled');
            submitLink.setAttribute('href', 'submit.html');
            submitLink.removeAttribute('title');
            submitLink.style.opacity = '1';
            submitLink.style.cursor = 'pointer';
        }
    }
    
    // Profile form elements
    const profileForm = document.getElementById('profileForm');
    const profileFormContainer = document.getElementById('profileFormContainer');
    const userDetailsSection = document.getElementById('userDetailsSection');
    const submissionFormContainer = document.querySelector('.submission-form-container');
    
    // Set email in profile form
    document.getElementById('profileEmail').value = currentUser.email || '';
    
    // Check if profile is complete
    if (currentUser.profileComplete) {
        // Hide profile form and show user details
        profileFormContainer.style.display = 'none';
        userDetailsSection.style.display = 'block';
        if (submissionFormContainer) {
            submissionFormContainer.style.display = 'block';
        }
        
        // Populate user details table
        const tbody = document.querySelector('#detailTable tbody');
        tbody.innerHTML = '';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${currentUser.fullName || ''}</td>
            <td>${currentUser.age || ''}</td>
            <td>${currentUser.address || ''}</td>
            <td>${currentUser.phone || ''}</td>
            <td>${currentUser.email || ''}</td>
        `;
        tbody.appendChild(tr);
    } else {
        // Show profile form and hide user details and submission form
        profileFormContainer.style.display = 'block';
        userDetailsSection.style.display = 'none';
        if (submissionFormContainer) {
            submissionFormContainer.style.display = 'none';
        }
    }
    
    // Handle profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const fullName = document.getElementById('fullName').value.trim();
            const age = document.getElementById('age').value.trim();
            const address = document.getElementById('address').value.trim();
            const phone = document.getElementById('phone').value.trim();
            
            if (!fullName || !age || !address || !phone) {
                alert('Please fill in all fields');
                return;
            }
            
            // Update user data
            currentUser.fullName = fullName;
            currentUser.age = age;
            currentUser.address = address;
            currentUser.phone = phone;
            currentUser.profileComplete = true;
            
            // Update in localStorage
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update in sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Show success message
            alert('Profile saved successfully!');
            
            // Update UI without full page reload
            profileFormContainer.style.display = 'none';
            userDetailsSection.style.display = 'block';
            
            // Populate user details table with latest values
            const tbody = document.querySelector('#detailTable tbody');
            if (tbody) {
                tbody.innerHTML = '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${currentUser.fullName || ''}</td>
                    <td>${currentUser.age || ''}</td>
                    <td>${currentUser.address || ''}</td>
                    <td>${currentUser.phone || ''}</td>
                    <td>${currentUser.email || ''}</td>
                `;
                tbody.appendChild(tr);
            }
            
            // Show submission section if present
            if (submissionFormContainer) {
                submissionFormContainer.style.display = 'block';
            }
        });
    }
    
    // Handle logout
    const logoutButton = document.querySelector('.logout a');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear user login status
            sessionStorage.removeItem('userLoggedIn');
            sessionStorage.removeItem('currentUser');
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
    
    // Handle submission form
    const submissionForm = document.getElementById('submissionForm');
    if (submissionForm) {
        submissionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const imageInput = document.getElementById('imageUpload');
            const description = document.getElementById('description').value.trim();
            const landmark = document.getElementById('landmark').value.trim();
            const location = document.getElementById('location').value.trim();
            
            if (!imageInput.files[0] || !description || !landmark || !location) {
                alert('Please fill in all fields and select an image');
                return;
            }
            
            // Create submission object
            const submission = {
                userId: currentUser.email,
                userName: currentUser.fullName,
                description: description,
                landmark: landmark,
                location: location,
                date: new Date().toISOString(),
                // In a real app, we would upload the image to a server
                // For now, we'll just store the file name
                imageName: imageInput.files[0].name,
                status: 'pending'
            };
            
            // Get existing submissions or initialize empty array
            const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
            submissions.push(submission);
            
            // Save to localStorage
            localStorage.setItem('submissions', JSON.stringify(submissions));
            
            // Update user's submissions
            if (!currentUser.submissions) {
                currentUser.submissions = [];
            }
            currentUser.submissions.push(submission);
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update user in localStorage
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update submission count in admin dashboard
            const adminStats = JSON.parse(localStorage.getItem('adminStats') || '{"totalRequests": 0, "pendingRequests": 0}');
            adminStats.totalRequests = (adminStats.totalRequests || 0) + 1;
            adminStats.pendingRequests = (adminStats.pendingRequests || 0) + 1;
            localStorage.setItem('adminStats', JSON.stringify(adminStats));
            
            // Show success message
            alert('Submission successful!');
            
            // Clear form
            submissionForm.reset();
            document.getElementById('imageName').textContent = '';
            
            // Update submission history in the dashboard
            updateSubmissionHistory();
        });
    }
    
    // Function to update submission history in the dashboard
    function updateSubmissionHistory() {
        const submissionHistoryContainer = document.querySelector('.submission-history');
        if (!submissionHistoryContainer) return;
        
        // Get user's submissions
        const userSubmissions = currentUser.submissions || [];
        
        // Check if user has a pending submission
        const hasPendingSubmission = userSubmissions.some(sub => sub.status === 'pending');
        
        // Update the Submit button in the sidebar based on pending status
        const submitLink = document.querySelector('.menu ul li a[href="submit.html"]');
        if (submitLink) {
            if (hasPendingSubmission) {
                submitLink.classList.add('disabled');
                submitLink.setAttribute('title', 'You already have a pending submission');
                submitLink.style.opacity = '0.6';
                submitLink.style.cursor = 'not-allowed';
            } else {
                submitLink.classList.remove('disabled');
                submitLink.removeAttribute('title');
                submitLink.style.opacity = '1';
                submitLink.style.cursor = 'pointer';
            }
        }
        
        // Clear existing content
        const submissionList = submissionHistoryContainer.querySelector('.submission-list') || 
                              document.createElement('div');
        submissionList.className = 'submission-list';
        submissionList.innerHTML = '';
        
        if (userSubmissions.length === 0) {
            submissionList.innerHTML = '<p class="no-submissions">No submissions yet. Go to the Submit page to report a pothole.</p>';
        } else {
            // Sort submissions by date (newest first)
            const sortedSubmissions = [...userSubmissions].sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );
            
            // Create submission items
            sortedSubmissions.forEach((sub, index) => {
                const submissionItem = document.createElement('div');
                submissionItem.className = `submission-item ${sub.status}`;
                
                const date = new Date(sub.date);
                const formattedDate = `${date.toLocaleDateString()}`;
                
                submissionItem.innerHTML = `
                    <div class="submission-header">
                        <h4>${sub.landmark}</h4>
                        <span class="submission-status ${sub.status}">${sub.status}</span>
                    </div>
                    <div class="submission-details">
                        <p><strong>Description:</strong> ${sub.description}</p>
                        <p><strong>Location:</strong> ${sub.location}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                    </div>
                `;
                
                submissionList.appendChild(submissionItem);
            });
        }
        
        // Add to container if not already there
        if (!submissionHistoryContainer.contains(submissionList)) {
            submissionHistoryContainer.appendChild(submissionList);
        }
    }
    
    // Initialize submission history on page load
    updateSubmissionHistory();
});

// Function to show the selected image name
function showImageName() {
    const imageInput = document.getElementById('imageUpload');
    const imageNameElement = document.getElementById('imageName');
    
    if (imageInput.files.length > 0) {
        imageNameElement.textContent = `Selected: ${imageInput.files[0].name}`;
    } else {
        imageNameElement.textContent = '';
    }
}
