document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isAdminLoggedIn) {
        // Redirect to admin login page if not logged in
        window.location.href = 'admin.html';
        return;
    }
    
    // Update dashboard statistics
    updateDashboardStats();
    
    // Load and display submissions
    displaySubmissions();
    
    // Handle logout
    const logoutButton = document.querySelector('.logout-mode a');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear admin login status
            sessionStorage.removeItem('adminLoggedIn');
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
    
    // Toggle sidebar
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('nav').classList.toggle('close');
        });
    }
    
    // Toggle dark mode
    const modeToggle = document.querySelector('.mode-toggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark');
        });
    }
});

// Function to update dashboard statistics
function updateDashboardStats() {
    // Get admin stats from localStorage or initialize with defaults
    const adminStats = JSON.parse(localStorage.getItem('adminStats') || 
                                '{"totalRequests": 0, "pendingRequests": 0}');
    
    // Get registered users count
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const registeredUsers = users.length;
    
    // Update dashboard boxes
    const totalRequestsElement = document.querySelector('.box1 .number');
    const registeredUsersElement = document.querySelector('.box2 .number');
    const pendingRequestsElement = document.querySelector('.box3 .number');
    
    if (totalRequestsElement) totalRequestsElement.textContent = adminStats.totalRequests || 0;
    if (registeredUsersElement) registeredUsersElement.textContent = registeredUsers;
    if (pendingRequestsElement) pendingRequestsElement.textContent = adminStats.pendingRequests || 0;
}

// Function to display submissions in the activity section
function displaySubmissions() {
    const activityContent = document.querySelector('.activity .activity-data');
    if (!activityContent) return;
    
    // Get all submissions
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    
    // Clear existing content
    activityContent.innerHTML = '';
    
    if (submissions.length === 0) {
        activityContent.innerHTML = '<p class="no-data">No submissions yet.</p>';
        return;
    }
    
    // Create table headers
    const headers = ['User', 'Description', 'Landmark', 'Location', 'Date', 'Status', 'Action'];
    
    // Create table
    const table = document.createElement('table');
    table.className = 'submissions-table';
    
    // Create header row
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    // Create table header
    const thead = document.createElement('thead');
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Sort submissions by date (newest first)
    submissions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Filter to only show pending submissions
    const pendingSubmissions = submissions.filter(submission => submission.status === 'pending');
    
    // Add submission rows
    pendingSubmissions.forEach((submission, index) => {
        const actualIndex = submissions.findIndex(s => s.id === submission.id);
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(submission.date);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        // Create cells
        const userCell = document.createElement('td');
        userCell.textContent = submission.user ? submission.user.name || submission.user.email : 'Unknown User';
        
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = submission.description;
        
        const landmarkCell = document.createElement('td');
        landmarkCell.textContent = submission.landmark;
        
        const locationCell = document.createElement('td');
        locationCell.textContent = submission.location;
        
        const dateCell = document.createElement('td');
        dateCell.textContent = formattedDate;
        
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="status ${submission.status}">${submission.status}</span>`;
        
        const actionCell = document.createElement('td');
        actionCell.innerHTML = `
            <button class="approve-btn" data-index="${actualIndex}">
                Approve
            </button>
            <button class="reject-btn" data-index="${actualIndex}">
                Reject
            </button>
            <button class="delete-btn" data-index="${actualIndex}">
                <i class="uil uil-trash-alt"></i>
            </button>
        `;
        
        // Add cells to row
        row.appendChild(userCell);
        row.appendChild(descriptionCell);
        row.appendChild(landmarkCell);
        row.appendChild(locationCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);
        
        // Add row to table body
        tbody.appendChild(row);
    });
    
    // Add table body to table
    table.appendChild(tbody);
    
    // Add table to activity content
    activityContent.appendChild(table);
    
    // Add event listeners for approve/reject/delete buttons
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            updateSubmissionStatus(index, 'approved');
        });
    });
    
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            updateSubmissionStatus(index, 'rejected');
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteSubmission(index);
        });
    });
}

// Function to update submission status
function updateSubmissionStatus(index, status) {
    // Get all submissions
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    
    if (index >= 0 && index < submissions.length) {
        const submission = submissions[index];
        
        // Update status
        submission.status = status;
        
        // If approved, save to approved submissions
        if (status === 'approved') {
            // Get approved submissions
            const approvedSubmissions = JSON.parse(localStorage.getItem('approvedSubmissions') || '[]');
            approvedSubmissions.push(submission);
            localStorage.setItem('approvedSubmissions', JSON.stringify(approvedSubmissions));
            
            // Remove from main submissions list
            submissions.splice(index, 1);
        } 
        // If rejected, save to rejected submissions
        else if (status === 'rejected') {
            // Get rejected submissions
            const rejectedSubmissions = JSON.parse(localStorage.getItem('rejectedSubmissions') || '[]');
            
            // Prompt for rejection reason
            const reason = prompt('Please provide a reason for rejection:');
            if (reason) {
                submission.rejectionReason = reason;
            }
            
            rejectedSubmissions.push(submission);
            localStorage.setItem('rejectedSubmissions', JSON.stringify(rejectedSubmissions));
            
            // Remove from main submissions list
            submissions.splice(index, 1);
        }
        
        // Update the user's submission status
        updateUserSubmissionStatus(submission, status);
        
        // Save updated submissions
        localStorage.setItem('submissions', JSON.stringify(submissions));
        
        // Update admin stats
        const adminStats = JSON.parse(localStorage.getItem('adminStats') || 
                                    '{"totalRequests": 0, "pendingRequests": 0}');
        
        // Decrease pending count
        if (adminStats.pendingRequests > 0) {
            adminStats.pendingRequests--;
        }
        
        // Save updated stats
        localStorage.setItem('adminStats', JSON.stringify(adminStats));
        
        // Refresh display
        updateDashboardStats();
        displaySubmissions();
    }
}

// Function to update user's submission status
function updateUserSubmissionStatus(submission, status) {
    // Get all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find the user who made the submission
    const userEmail = submission.user ? submission.user.email : null;
    if (!userEmail) return;
    
    const userIndex = users.findIndex(user => user.email === userEmail);
    if (userIndex === -1) return;
    
    const user = users[userIndex];
    
    // Find the submission in the user's submissions
    if (user.submissions) {
        const submissionIndex = user.submissions.findIndex(s => 
            s.id === submission.id || 
            (s.landmark === submission.landmark && 
             s.description === submission.description && 
             s.date === submission.date)
        );
        
        if (submissionIndex !== -1) {
            // Update status
            user.submissions[submissionIndex].status = status;
            
            // If approved or rejected, remove the submission to allow user to submit again
            if (status === 'approved' || status === 'rejected') {
                // We keep the submission in history with updated status
                user.submissions[submissionIndex].status = status;
                if (status === 'rejected' && submission.rejectionReason) {
                    user.submissions[submissionIndex].rejectionReason = submission.rejectionReason;
                }
            }
            
            // Save updated user
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update session storage if this is the current user
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (currentUser && currentUser.email === userEmail) {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
            }
        }
    }
}

// Function to delete a submission
function deleteSubmission(index) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this submission?')) {
        return;
    }
    
    // Get all submissions
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    
    if (index >= 0 && index < submissions.length) {
        // Remove the submission
        submissions.splice(index, 1);
        
        // Save updated submissions
        localStorage.setItem('submissions', JSON.stringify(submissions));
        
        // Update admin stats
        const adminStats = JSON.parse(localStorage.getItem('adminStats') || 
                                    '{"totalRequests": 0, "pendingRequests": 0}');
        
        // Decrease pending count
        if (adminStats.pendingRequests > 0) {
            adminStats.pendingRequests--;
        }
        
        // Save updated stats
        localStorage.setItem('adminStats', JSON.stringify(adminStats));
        
        // Refresh display
        updateDashboardStats();
        displaySubmissions();
    }
}