// Customer Profile JavaScript - Profile Management and Statistics Display

// Initialize profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', async function () {
    console.log('Profile page loaded');

    // Check if user is logged in by getting their ID
    const customerId = localStorage.getItem('customerId');
    console.log('Customer ID from localStorage:', customerId);

    if (!customerId) {
        // Redirect to login if no customer ID found
        console.log('No customer ID found, redirecting to login');
        window.location.href = 'customer-login.html';
        return;
    }

    // Load customer profile data and statistics
    try {
        await loadCustomerProfile(customerId);
        console.log('Profile loaded successfully');

        // Load customer statistics after profile is loaded
        await loadCustomerStatistics(customerId);
        console.log('Statistics loaded successfully');
    } catch (error) {
        console.error('Failed to load profile:', error);
    }

    // Test inputs to ensure they're editable
    setTimeout(() => {
        console.log('Testing inputs...');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');

        if (nameInput && emailInput) {
            console.log('Inputs found. Name value:', nameInput.value);
            console.log('Inputs found. Email value:', emailInput.value);
            console.log('Name input disabled?', nameInput.disabled);
            console.log('Email input disabled?', emailInput.disabled);

            // Make sure form inputs are editable
            nameInput.disabled = false;
            emailInput.disabled = false;
            nameInput.readOnly = false;
            emailInput.readOnly = false;

            console.log('Inputs should now be editable');
        } else {
            console.error('Could not find name or email inputs');
        }
    }, 500);
});

// Display welcome message for new users
function showWelcomeMessage() {
    const customerName = localStorage.getItem('customerName');
    if (customerName) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.style.cssText = `
            background: #d4edda; border: 1px solid #c3e6cb; color: #155724; 
            padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;
        `;
        welcomeDiv.innerHTML = `
            <h3>🎉 Welcome to ChillCrib, ${customerName}!</h3>
            <p>Your account has been created successfully. Please review and update your profile information below.</p>
        `;
        document.querySelector('.container').insertBefore(welcomeDiv, document.querySelector('.profile-section'));
    }
}

// Load customer profile data from backend
async function loadCustomerProfile(customerId) {
    try {
        // Fetch customer data from backend API
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();

            // Validate that we got complete data
            if (!customer.id || !customer.email) {
                throw new Error('Incomplete customer data from backend');
            }

            // Fill the form with customer data
            populateForm(customer);

            // Update browser storage with fresh data
            localStorage.setItem('customerName', customer.name);
            localStorage.setItem('customerEmail', customer.email);

        } else if (response.status === 404) {
            // Customer not found - redirect to signup
            alert('Customer account not found. Please contact support.');
            localStorage.clear();
            window.location.href = 'customer-signup.html';
        } else {
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading customer profile:', error);
        showErrorMessage('Error loading profile data. Please try refreshing the page.');
    }
}

// Fill form fields with customer data
function populateForm(customer) {
    // Set form values from backend customer data
    document.getElementById('name').value = customer.name || '';
    document.getElementById('email').value = customer.email || '';
    document.getElementById('phoneNumber').value = customer.phoneNumber || '';
    document.getElementById('address').value = customer.address || '';

    // Ensure all inputs are editable
    document.getElementById('name').removeAttribute('readonly');
    document.getElementById('name').removeAttribute('disabled');
    document.getElementById('email').removeAttribute('readonly');
    document.getElementById('email').removeAttribute('disabled');
    document.getElementById('phoneNumber').removeAttribute('readonly');
    document.getElementById('phoneNumber').removeAttribute('disabled');
    document.getElementById('address').removeAttribute('readonly');
    document.getElementById('address').removeAttribute('disabled');

    console.log('Form populated with customer data:', customer);
    console.log('All inputs should now be editable');

    // Update page title with customer name
    if (customer.name) {
        document.title = `${customer.name}'s Profile - ChillCrib`;
    }
}

// Load and display customer statistics
async function loadCustomerStatistics(customerId) {
    try {
        // Get customer bookings data
        const bookingsResponse = await fetch(`/api/bookings/customer/${customerId}`);
        let bookings = [];
        if (bookingsResponse.ok) {
            bookings = await bookingsResponse.json();
        }

        // Get customer reviews data
        const reviewsResponse = await fetch(`/api/reviews/customer/${customerId}`);
        let reviews = [];
        if (reviewsResponse.ok) {
            reviews = await reviewsResponse.json();
        }

        // Get customer subscriptions data
        const subscriptionsResponse = await fetch(`/api/subscriptions/customer/${customerId}`);
        let subscriptions = [];
        if (subscriptionsResponse.ok) {
            subscriptions = await subscriptionsResponse.json();
        }

        // Display the statistics
        displayStatistics(bookings, reviews, subscriptions);

    } catch (error) {
        console.error('Error loading customer statistics:', error);
        document.getElementById('customerStats').innerHTML = 'Error loading statistics';
    }
}

// Calculate and display customer statistics
function displayStatistics(bookings, reviews, subscriptions) {
    // Calculate statistics from data
    const totalBookings = bookings.length;
    const upcomingBookings = bookings.filter(booking => new Date(booking.checkIn) > new Date()).length;
    const totalReviews = reviews.length;
    const activeSubscriptions = subscriptions.filter(sub => new Date(sub.startDate) <= new Date()).length;

    // Create and display statistics HTML
    document.getElementById('customerStats').innerHTML = `
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div class="stat-item" style="padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                <h4>Total Bookings</h4>
                <p style="font-size: 24px; color: #007bff; margin: 0;">${totalBookings}</p>
            </div>
            <div class="stat-item" style="padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                <h4>Upcoming Trips</h4>
                <p style="font-size: 24px; color: #ffc107; margin: 0;">${upcomingBookings}</p>
            </div>
            <div class="stat-item" style="padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                <h4>Reviews Written</h4>
                <p style="font-size: 24px; color: #17a2b8; margin: 0;">${totalReviews}</p>
            </div>
            <div class="stat-item" style="padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                <h4>Active Subscriptions</h4>
                <p style="font-size: 24px; color: #e83e8c; margin: 0;">${activeSubscriptions}</p>
            </div>
        </div>
    `;
}

// Handle profile form submission and update
document.getElementById('profileForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission
    console.log('Form submitted - starting profile update');

    const customerId = localStorage.getItem('customerId');
    console.log('Customer ID:', customerId);

    // Collect form data for update
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        address: document.getElementById('address').value.trim(),
        identifier: document.getElementById('email').value.trim().toLowerCase() // Required for backend
    };

    console.log('Form data collected:', formData);

    // Validate all required fields are filled
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.address) {
        console.log('Please fill in all fields');
        return;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        console.log('Invalid email format');
        return;
    }

    // Check if email is being changed and if it's already in use by another customer
    const currentEmail = localStorage.getItem('customerEmail');
    if (formData.email !== currentEmail) {
        try {
            const checkResponse = await fetch(`/api/customers/email/${encodeURIComponent(formData.email)}`);
            if (checkResponse.ok) {
                const existingCustomer = await checkResponse.json();
                if (existingCustomer && existingCustomer.id != customerId) {
                    console.log('This email is already in use by another account');
                    return;
                }
            }
        } catch (error) {
            console.error('Error checking email:', error);
            return;
        }
    }

    try {
        console.log('Sending PUT request to update profile...');
        // Send update request to backend
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, id: parseInt(customerId) })
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            // Update successful
            const updatedCustomer = await response.json();
            console.log('Profile updated successfully:', updatedCustomer);

            // Update browser storage with new data
            localStorage.setItem('customerName', updatedCustomer.name);
            localStorage.setItem('customerEmail', updatedCustomer.email);

            // Show success notification
            showSuccessMessage('Profile updated successfully!');

            // Reload statistics with updated data
            await loadCustomerStatistics(customerId);

        } else {
            // Handle update errors
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Error updating profile:', errorData);
            showErrorMessage('Error updating profile. Please try again.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showErrorMessage('Network error. Please check your connection.');
    }
});

// Show success notification message
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        background: #d4edda; border: 1px solid #c3e6cb; color: #155724; 
        padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;
        position: fixed; top: 20px; right: 20px; z-index: 1000; max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    messageDiv.innerHTML = `✅ ${message}`;
    document.body.appendChild(messageDiv);

    // Remove notification after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Show error notification message
function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; 
        padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;
        position: fixed; top: 20px; right: 20px; z-index: 1000; max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    messageDiv.innerHTML = `❌ ${message}`;
    document.body.appendChild(messageDiv);

    // Remove notification after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Handle account deletion
async function deleteAccount() {
    // Double confirmation for account deletion
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    if (!confirm('This will permanently delete all your data including bookings, reviews, and subscriptions. Continue?')) {
        return;
    }

    const customerId = localStorage.getItem('customerId');

    try {
        // Send delete request to backend
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Account deleted successfully
            localStorage.clear();
            alert('Account deleted successfully. Sorry to see you go!');
            window.location.href = 'index.html';
        } else {
            alert('Error deleting account. Please contact support.');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Network error. Please try again.');
    }
}