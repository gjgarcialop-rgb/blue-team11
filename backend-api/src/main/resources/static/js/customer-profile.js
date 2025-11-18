// Customer Profile Management

// Initialize page when DOM loads
document.addEventListener('DOMContentLoaded', async function () {
    const customerId = localStorage.getItem('customerId');

    // Redirect if not logged in
    if (!customerId) {
        window.location.href = 'customer-login.html';
        return;
    }

    try {
        await loadProfile(customerId);
        await loadStats(customerId);
    } catch (error) {
        console.error('Profile load failed:', error);
    }
});

// Load customer profile from database
async function loadProfile(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();

            if (!customer.id || !customer.email) {
                throw new Error('Incomplete customer data');
            }

            fillForm(customer);
            localStorage.setItem('customerName', customer.name);
            localStorage.setItem('customerEmail', customer.email);

        } else if (response.status === 404) {
            alert('Customer account not found. Please contact support.');
            localStorage.clear();
            window.location.href = 'customer-signup.html';
        } else {
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error('Profile load error:', error);
        showError('Error loading profile data. Please try refreshing the page.');
    }
}

// Fill form fields with customer data
function fillForm(customer) {
    document.getElementById('name').value = customer.name || '';
    document.getElementById('email').value = customer.email || '';
    document.getElementById('phoneNumber').value = customer.phoneNumber || '';
    document.getElementById('address').value = customer.address || '';

    if (customer.name) {
        document.title = `${customer.name}'s Profile - ChillCrib`;
    }
}

// Load customer statistics (bookings, reviews, subscriptions)
async function loadStats(customerId) {
    try {
        const bookingsResponse = await fetch(`/api/bookings/customer/${customerId}`);
        const reviewsResponse = await fetch(`/api/reviews/customer/${customerId}`);
        const subscriptionsResponse = await fetch(`/api/subscriptions/customer/${customerId}`);

        const bookings = bookingsResponse.ok ? await bookingsResponse.json() : [];
        const reviews = reviewsResponse.ok ? await reviewsResponse.json() : [];
        const subscriptions = subscriptionsResponse.ok ? await subscriptionsResponse.json() : [];

        showStats(bookings, reviews, subscriptions);

    } catch (error) {
        console.error('Stats load error:', error);
        document.getElementById('customerStats').innerHTML = 'Error loading statistics';
    }
}

// Display statistics in grid format
function showStats(bookings, reviews, subscriptions) {
    const totalBookings = bookings.length;
    const upcomingBookings = bookings.filter(booking => new Date(booking.checkIn) > new Date()).length;
    const totalReviews = reviews.length;
    const activeSubscriptions = subscriptions.filter(sub => new Date(sub.startDate) <= new Date()).length;

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

// Handle profile form submission
document.getElementById('profileForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const customerId = localStorage.getItem('customerId');
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        address: document.getElementById('address').value.trim(),
        identifier: document.getElementById('email').value.trim().toLowerCase()
    };

    // Validate form fields
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.address) {
        showError('Please fill in all fields');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showError('Invalid email format');
        return;
    }

    // Check if email changed and is already in use
    const currentEmail = localStorage.getItem('customerEmail');
    if (formData.email !== currentEmail) {
        try {
            const checkResponse = await fetch(`/api/customers/email/${encodeURIComponent(formData.email)}`);
            if (checkResponse.ok) {
                const existingCustomer = await checkResponse.json();
                if (existingCustomer && existingCustomer.id != customerId) {
                    showError('This email is already in use by another account');
                    return;
                }
            }
        } catch (error) {
            console.error('Email check error:', error);
            return;
        }
    }

    // Update profile in database
    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, id: parseInt(customerId) })
        });

        if (response.ok) {
            const updatedCustomer = await response.json();

            localStorage.setItem('customerName', updatedCustomer.name);
            localStorage.setItem('customerEmail', updatedCustomer.email);

            showSuccess('Profile updated successfully!');
            await loadStats(customerId);

        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Update error:', errorData);
            showError('Error updating profile. Please try again.');
        }
    } catch (error) {
        console.error('Update error:', error);
        showError('Network error. Please check your connection.');
    }
});

// Show success message popup
function showSuccess(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        background: #d4edda; border: 1px solid #c3e6cb; color: #155724; 
        padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;
        position: fixed; top: 20px; right: 20px; z-index: 1000; max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    messageDiv.innerHTML = `✅ ${message}`;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Show error message popup
function showError(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; 
        padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;
        position: fixed; top: 20px; right: 20px; z-index: 1000; max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    messageDiv.innerHTML = `❌ ${message}`;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Delete customer account with confirmation
async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    if (!confirm('This will permanently delete all your data including bookings, reviews, and subscriptions. Continue?')) {
        return;
    }

    const customerId = localStorage.getItem('customerId');

    try {
        const response = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });

        if (response.ok) {
            localStorage.clear();
            alert('Account deleted successfully. Sorry to see you go!');
            window.location.href = 'index.html';
        } else {
            alert('Error deleting account. Please contact support.');
        }
    } catch (error) {
        console.error('Delete account error:', error);
        alert('Network error. Please try again.');
    }
}