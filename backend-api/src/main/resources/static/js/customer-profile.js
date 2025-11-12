// Customer Profile JavaScript - Pure Backend Data
document.addEventListener('DOMContentLoaded', async function() {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
        alert('Please log in to access your profile');
        window.location.href = 'customer-login.html';
        return;
    }
    
    // Check if this is a new signup (no previous visit to profile)
    const isNewSignup = !localStorage.getItem('profileVisited');
    if (isNewSignup) {
        localStorage.setItem('profileVisited', 'true');
        showWelcomeMessage();
    }
    
    await loadCustomerProfile(customerId);
    await loadCustomerStatistics(customerId);
});

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

async function loadCustomerProfile(customerId) {
    try {
        // Pure backend data fetch - no localStorage fallbacks
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();
            
            // Validate backend data completeness
            if (!customer.id || !customer.email) {
                throw new Error('Incomplete customer data from backend');
            }
            
            populateForm(customer);
            
            // Update localStorage with fresh backend data - matches Customer entity
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
        console.error('Error loading customer profile:', error);
        alert('Error loading profile data. Please try refreshing the page.');
    }
}

function populateForm(customer) {
    // Populate form with backend data only - matches Customer entity structure
    document.getElementById('name').value = customer.name || '';
    document.getElementById('email').value = customer.email || '';
    document.getElementById('phoneNumber').value = customer.phoneNumber || '';
    document.getElementById('address').value = customer.address || '';
    
    // Update page title with customer name from backend
    if (customer.name) {
        document.title = `${customer.name}'s Profile - ChillCrib`;
    }
}

async function loadCustomerStatistics(customerId) {
    try {
        // Get all customer bookings
        const bookingsResponse = await fetch(`/api/bookings/customer/${customerId}`);
        let bookings = [];
        if (bookingsResponse.ok) {
            bookings = await bookingsResponse.json();
        }
        
        // Get customer reviews
        const reviewsResponse = await fetch(`/api/reviews/customer/${customerId}`);
        let reviews = [];
        if (reviewsResponse.ok) {
            reviews = await reviewsResponse.json();
        }
        
        // Get customer subscriptions
        const subscriptionsResponse = await fetch(`/api/subscriptions/customer/${customerId}`);
        let subscriptions = [];
        if (subscriptionsResponse.ok) {
            subscriptions = await subscriptionsResponse.json();
        }
        
        displayStatistics(bookings, reviews, subscriptions);
        
    } catch (error) {
        console.error('Error loading customer statistics:', error);
        document.getElementById('customerStats').innerHTML = 'Error loading statistics';
    }
}

function displayStatistics(bookings, reviews, subscriptions) {
    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const upcomingBookings = bookings.filter(booking => new Date(booking.checkIn) > new Date()).length;
    const completedBookings = bookings.filter(booking => new Date(booking.checkOut) < new Date()).length;
    const totalReviews = reviews.length;
    const activeSubscriptions = subscriptions.filter(sub => new Date(sub.startDate) <= new Date()).length;
    
    // Find favorite location (most booked location)
    const locationCounts = {};
    bookings.forEach(booking => {
        if (booking.property && booking.property.location) {
            locationCounts[booking.property.location] = (locationCounts[booking.property.location] || 0) + 1;
        }
    });
    const favoriteLocation = Object.keys(locationCounts).length > 0 ? 
        Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b) : 'None';
    
    document.getElementById('customerStats').innerHTML = `
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div class="stat-item" style="padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                <h4>Total Bookings</h4>
                <p style="font-size: 24px; color: #007bff; margin: 0;">${totalBookings}</p>
            </div>
            <div class="stat-item" style="padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                <h4>Total Spent</h4>
                <p style="font-size: 24px; color: #28a745; margin: 0;">$${totalSpent.toFixed(2)}</p>
            </div>
            <div class="stat-item" style="padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                <h4>Upcoming Trips</h4>
                <p style="font-size: 24px; color: #ffc107; margin: 0;">${upcomingBookings}</p>
            </div>
            <div class="stat-item" style="padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                <h4>Completed Trips</h4>
                <p style="font-size: 24px; color: #6c757d; margin: 0;">${completedBookings}</p>
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
        <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 5px;">
            <h4>Favorite Location</h4>
            <p style="font-size: 18px; margin: 0;">${favoriteLocation}</p>
        </div>
    `;
}

// Handle profile form submission - Pure Backend Update
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const customerId = localStorage.getItem('customerId');
    
    // Get form data with validation - matches Customer entity structure
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        address: document.getElementById('address').value.trim()
    };
    
    // Validate all required fields
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.address) {
        alert('Please fill in all fields');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Check if email is being changed and if it's already in use
    const currentEmail = localStorage.getItem('customerEmail');
    if (formData.email !== currentEmail) {
        try {
            const checkResponse = await fetch(`/api/customers/email/${encodeURIComponent(formData.email)}`);
            if (checkResponse.ok) {
                const existingCustomer = await checkResponse.json();
                if (existingCustomer && existingCustomer.id != customerId) {
                    alert('This email is already in use by another account.');
                    return;
                }
            }
        } catch (error) {
            console.error('Error checking email:', error);
            alert('Error validating email. Please try again.');
            return;
        }
    }
    
    try {
        // PUT request to update customer - backend handles all logic
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, id: parseInt(customerId) })
        });
        
        if (response.ok) {
            const updatedCustomer = await response.json();
            
            // Update localStorage with fresh backend data
            localStorage.setItem('customerName', updatedCustomer.name);
            localStorage.setItem('customerEmail', updatedCustomer.email);
            
            alert(`Profile updated successfully, ${updatedCustomer.name}!`);
            
            // Reload statistics with updated data
            await loadCustomerStatistics(customerId);
            
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Error updating profile:', errorData);
            alert('Error updating profile: ' + (errorData.message || 'Please try again'));
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Network error. Please check your connection and try again.');
    }
});

async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    
    if (!confirm('This will permanently delete all your data including bookings, reviews, and subscriptions. Continue?')) {
        return;
    }
    
    const customerId = localStorage.getItem('customerId');
    
    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
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