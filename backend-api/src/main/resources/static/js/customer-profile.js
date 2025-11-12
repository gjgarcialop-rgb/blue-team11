// Customer Profile JavaScript - Pure Backend Data
document.addEventListener('DOMContentLoaded', async function() {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
        window.location.href = 'customer-login.html';
        return;
    }
    
    await loadCustomerProfile(customerId);
    await loadCustomerStatistics(customerId);
});

async function loadCustomerProfile(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();
            populateForm(customer);
        } else {
            alert('Error loading profile data');
        }
    } catch (error) {
        console.error('Error loading customer profile:', error);
        alert('Network error loading profile');
    }
}

function populateForm(customer) {
    document.getElementById('firstName').value = customer.firstName || '';
    document.getElementById('lastName').value = customer.lastName || '';
    document.getElementById('email').value = customer.email || '';
    document.getElementById('phone').value = customer.phone || '';
    document.getElementById('address').value = customer.address || '';
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

// Handle profile form submission
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const customerId = localStorage.getItem('customerId');
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, id: parseInt(customerId) })
        });
        
        if (response.ok) {
            const updatedCustomer = await response.json();
            localStorage.setItem('customerName', updatedCustomer.firstName + ' ' + updatedCustomer.lastName);
            alert('Profile updated successfully!');
        } else {
            const errorText = await response.text();
            alert('Error updating profile: ' + errorText);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Network error. Please try again.');
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