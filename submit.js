// Check user login status and redirect if not logged in
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'user-login.html';
        return;
    }

    // Check if user has pending submissions
    checkSubmissionStatus();
    
    // Initialize map
    initMap();
    
    // Add event listeners
    document.getElementById('getLocationBtn').addEventListener('click', getLocation);
    document.getElementById('submissionForm').addEventListener('submit', handleSubmission);
});

// Initialize the map
let map;
let userMarker;

function initMap() {
    map = L.map('map').setView([20.5937, 78.9629], 5); // Default view of India
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Check if user has pending submissions
function checkSubmissionStatus() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const statusContainer = document.getElementById('statusMessage');
    const submissionForm = document.getElementById('submissionFormContainer');
    
    // If user has submissions, check their status
    if (currentUser.submissions && currentUser.submissions.length > 0) {
        // Filter out approved submissions
        currentUser.submissions = currentUser.submissions.filter(sub => sub.status !== 'approved');
        
        // Update user data in session and local storage
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // If there are still submissions after filtering
        if (currentUser.submissions.length > 0) {
            // Get the most recent submission
            const latestSubmission = currentUser.submissions[currentUser.submissions.length - 1];
            
            if (latestSubmission.status === 'pending') {
                // Disable submission form if there's a pending submission
                submissionForm.style.display = 'none';
                statusContainer.innerHTML = `
                    <div class="status-card pending">
                        <h4>You have a pending submission</h4>
                        <p>Please wait for admin approval before submitting a new request.</p>
                        <p>Submission date: ${new Date(latestSubmission.date).toLocaleDateString()}</p>
                    </div>
                `;
            } else if (latestSubmission.status === 'rejected') {
                // Show rejection message with option to create new submission
                submissionForm.style.display = 'none';
                statusContainer.innerHTML = `
                    <div class="status-card rejected">
                        <h4>Your submission was rejected</h4>
                        <p>Reason: ${latestSubmission.rejectionReason || 'No reason provided'}</p>
                        <button id="newSubmissionBtn" class="submit-btn">Create New Submission</button>
                    </div>
                `;
                
                // Add event listener to the new submission button
                setTimeout(() => {
                    const newSubmissionBtn = document.getElementById('newSubmissionBtn');
                    if (newSubmissionBtn) {
                        newSubmissionBtn.addEventListener('click', function() {
                            // Remove the rejected submission
                            currentUser.submissions = currentUser.submissions.filter(sub => sub.status !== 'rejected');
                            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                            
                            // Update localStorage
                            const users = JSON.parse(localStorage.getItem('users')) || [];
                            const userIndex = users.findIndex(user => user.email === currentUser.email);
                            if (userIndex !== -1) {
                                users[userIndex] = currentUser;
                                localStorage.setItem('users', JSON.stringify(users));
                            }
                            
                            // Show the submission form
                            submissionForm.style.display = 'block';
                            statusContainer.innerHTML = '';
                        });
                    }
                }, 0);
            }
        } else {
            // Show submission form if there are no pending or rejected submissions
            submissionForm.style.display = 'block';
            statusContainer.innerHTML = '';
        }
    } else {
        // Show submission form if user has no submissions
        submissionForm.style.display = 'block';
        statusContainer.innerHTML = '';
    }
}

// Show the image name after selection
function showImageName() {
    const imageInput = document.getElementById('imageUpload');
    const imageName = document.getElementById('imageName');
    
    if (imageInput.files && imageInput.files[0]) {
        imageName.textContent = `Selected Image: ${imageInput.files[0].name}`;
    }
}

// Get user's current location and update the map
function getLocation() {
    const locationInput = document.getElementById('location');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Update the location input
            locationInput.value = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
            
            // Update the map with the user's location
            map.setView([lat, lng], 15);
            
            // Add or update the marker for user's location
            if (userMarker) {
                userMarker.setLatLng([lat, lng]);
            } else {
                userMarker = L.marker([lat, lng]).addTo(map);
            }
            
            userMarker.bindPopup("Your current location").openPopup();
            
        }, function(error) {
            alert("Unable to retrieve your location. Error: " + error.message);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Handle form submission
function handleSubmission(event) {
    event.preventDefault();
    
    // Get form values
    const imageInput = document.getElementById('imageUpload');
    const description = document.getElementById('description').value;
    const landmark = document.getElementById('landmark').value;
    const location = document.getElementById('location').value;
    
    // Validate form
    if (!imageInput.files[0] || !description || !landmark || !location) {
        alert("Please fill in all fields and select an image.");
        return;
    }
    
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Create a submission object
    const submission = {
        id: Date.now().toString(),
        image: imageInput.files[0].name, // In a real app, you'd upload the image to a server
        description: description,
        landmark: landmark,
        location: location,
        date: new Date().toISOString(),
        status: 'pending',
        user: {
            name: currentUser.fullName || currentUser.email,
            email: currentUser.email
        }
    };
    
    // Add submission to user's submissions
    if (!currentUser.submissions) {
        currentUser.submissions = [];
    }
    
    currentUser.submissions.push(submission);
    
    // Update sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update localStorage for the user
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.email === currentUser.email);
    
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Add submission to all submissions in localStorage
    const allSubmissions = JSON.parse(localStorage.getItem('submissions')) || [];
    allSubmissions.push(submission);
    localStorage.setItem('submissions', JSON.stringify(allSubmissions));
    
    // Update admin stats
    const adminStats = JSON.parse(localStorage.getItem('adminStats')) || {
        totalRequests: 0,
        pendingRequests: 0,
        registeredUsers: users.length
    };
    
    adminStats.totalRequests++;
    adminStats.pendingRequests++;
    localStorage.setItem('adminStats', JSON.stringify(adminStats));
    
    // Show success message and redirect
    alert("Your submission has been received and is pending approval.");
    window.location.href = 'dashboard.html';
}

// Add a popup when clicking on the map
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);
