// Customer Dashboard Management

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const isGuest = params.get('guest') === '1';
    
    // Clear localStorage when in guest mode to prevent showing old login
    if (isGuest) {
        localStorage.clear();
    }
    
    const storedCustomerId = localStorage.getItem('customerId');
    const customerId = isGuest ? null : storedCustomerId;

    // Adjust nav links to keep guest context where appropriate
    if (isGuest) {
        appendGuestParam(['navDashboard', 'navProperties', 'navProfile']);
        hideElement('navSubscriptions');
        hideElement('navBookings');
        hideElement('navLogout');
        hideElement('subscriptionCard');
        // Show friendly guest message
        const welcome = document.getElementById('welcomeMessage');
        if (welcome) {
            welcome.textContent = 'Welcome! Browse cribs as a guest';
        }
        const bookingsList = document.getElementById('upcomingBookings');
        if (bookingsList) {
            bookingsList.innerHTML = '<li>Log in to see your upcoming trips.</li>';
        }
        // Skip personalized data
        return;
    }

    // Redirect if not logged in
    if (!customerId) {
        window.location.href = 'customer-login.html';
        return;
    }
    
    await loadCustomerInfo(customerId);
    await loadCustomerData(customerId);
});

// Load customer info and update welcome message
async function loadCustomerInfo(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();
            document.getElementById('welcomeMessage').textContent = `Welcome back, ${customer.name}!`;
            localStorage.setItem('customerName', customer.name);
            localStorage.setItem('customerEmail', customer.email);
        } else {
            const storedName = localStorage.getItem('customerName');
            if (storedName) {
                document.getElementById('welcomeMessage').textContent = `Welcome back, ${storedName}!`;
            }
        }
    } catch (error) {
        console.error('Load customer error:', error);
        const storedName = localStorage.getItem('customerName');
        if (storedName) {
            document.getElementById('welcomeMessage').textContent = `Welcome back, ${storedName}!`;
        }
    }
}

// Load customer bookings and subscriptions
async function loadCustomerData(customerId) {
    try {
        const bookingsResponse = await fetch(`/api/bookings/customer/${customerId}`);
        if (bookingsResponse.ok) {
            const bookings = await bookingsResponse.json();
            showBookings(bookings);
        }
        
        const subscriptionsResponse = await fetch(`/api/subscriptions/customer/${customerId}`);
        if (subscriptionsResponse.ok) {
            const subscriptions = await subscriptionsResponse.json();
            showSubscriptions(subscriptions);
        }
        
    } catch (error) {
        console.error('Load data error:', error);
    }
}

// Load available properties for booking
async function loadProperties() {
    try {
        const response = await fetch('/api/properties');
        if (response.ok) {
            const properties = await response.json();
            showProperties(properties);
        }
    } catch (error) {
        console.error('Load properties error:', error);
    }
}

// Display upcoming bookings
function showBookings(bookings) {
    const bookingsList = document.getElementById('upcomingBookings');
    
    const upcomingBookings = bookings.filter(booking => new Date(booking.checkIn) > new Date());
    
    if (upcomingBookings.length === 0) {
        bookingsList.innerHTML = '<div style="color:#6b7280; text-align:center; padding:20px;">No upcoming trips — start searching for your next stay!</div>';
        return;
    }
    
    bookingsList.innerHTML = upcomingBookings.map(booking => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        
        return `
        <div style="
            border: 2px solid #007bff; 
            padding: 16px; 
            margin: 12px 0; 
            border-radius: 10px; 
            background: white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        ">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                <div style="flex:1;">
                    <h4 style="margin:0 0 6px 0; color:#0b1220; font-size:1.1rem;">${booking.property ? booking.property.title : 'Property #' + booking.propertyId}</h4>
                    <div style="display:inline-block; background:#e3f2fd; padding:4px 10px; border-radius:5px; border:1px solid #90caf9;">
                        <span style="color:#1565c0; font-weight:600; font-size:0.85rem;">📍 ${booking.property && booking.property.location ? booking.property.location : 'Location TBD'}</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.2rem; font-weight:700; color:#28a745;">$${Number(booking.totalPrice).toFixed(2)}</div>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:10px; margin-top:12px;">
                <div style="background:#f9fafb; padding:10px; border-radius:6px;">
                    <div style="color:#6b7280; font-size:0.8rem; margin-bottom:3px;">Check-in</div>
                    <div style="color:#0b1220; font-weight:600; font-size:0.9rem;">📅 ${checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                <div style="background:#f9fafb; padding:10px; border-radius:6px;">
                    <div style="color:#6b7280; font-size:0.8rem; margin-bottom:3px;">Check-out</div>
                    <div style="color:#0b1220; font-weight:600; font-size:0.9rem;">📅 ${checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                <div style="background:#f9fafb; padding:10px; border-radius:6px;">
                    <div style="color:#6b7280; font-size:0.8rem; margin-bottom:3px;">Duration</div>
                    <div style="color:#0b1220; font-weight:600; font-size:0.9rem;">🌙 ${nights} night${nights !== 1 ? 's' : ''}</div>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Display customer subscriptions (local and database)
function showSubscriptions(subscriptions) {
    const subscriptionsDiv = document.getElementById('customerSubscriptions');
    
    let localSubs = {};
    try {
        localSubs = JSON.parse(localStorage.getItem('chillcrib_subscriptions') || '{}');
    } catch (e) {
        console.error('Error loading local subscriptions:', e);
    }
    
    const hasLocal = Object.keys(localSubs).length > 0;
    const hasBackend = subscriptions.length > 0;
    
    if (!hasLocal && !hasBackend) {
        subscriptionsDiv.innerHTML = `
            <div class="no-subs">
                <p>No active subscriptions</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    if (hasLocal) {
        Object.keys(localSubs).forEach(serviceId => {
            const sub = localSubs[serviceId];
            html += `
                <div class="sub-item">
                    <div class="sub-info">
                        <h4>${getServiceName(serviceId)}</h4>
                        <span class="sub-plan">${getPlanName(sub.plan)} - $${sub.price}/${getBilling(sub.plan)}</span>
                    </div>
                    <div class="sub-actions">
                        <button class="btn-small edit" onclick="editSubscription('${serviceId}')">Edit</button>
                    </div>
                </div>
            `;
        });
    } else {
        html = subscriptions.map(subscription => `
            <div class="sub-item">
                <div class="sub-info">
                    <h4>${subscription.planType}</h4>
                    <span class="sub-plan">$${subscription.price}/month</span>
                </div>
                <div class="sub-actions">
                    <button class="btn-small edit">Edit</button>
                </div>
            </div>
        `).join('');
    }
    
    subscriptionsDiv.innerHTML = `
        <div class="subs-header">
            <span class="sub-count">${hasLocal ? Object.keys(localSubs).length : subscriptions.length} Active</span>
            <a href="customer-subscription.html" class="btn-link">Manage All</a>
        </div>
        <div class="subs-list">${html}</div>
    `;
}

// Navigate to subscription edit page
function editSubscription(serviceId) {
    window.location.href = 'customer-subscription.html';
}

// Helper functions for subscription display
function getServiceName(serviceId) {
    const names = {
        'insurance': 'Insurance & Protection',
        'cleaning': 'Cleaning Service',
        'equipment': 'Rental Equipment'
    };
    return names[serviceId] || serviceId;
}

// Convert plan ID to display name
function getPlanName(plan) {
    const names = {
        'monthly': 'Monthly',
        'yearly': 'Yearly',
        'per-booking': 'Per Booking',
        'basic': 'Basic',
        'premium': 'Premium'
    };
    return names[plan] || plan;
}

// Get billing frequency for plan
function getBilling(plan) {
    const billing = {
        'monthly': 'month',
        'yearly': 'year',
        'per-booking': 'booking',
        'basic': 'booking',
        'premium': 'month'
    };
    return billing[plan] || 'month';
}

// Display available properties in cards
function showProperties(properties) {
    const propertiesDiv = document.getElementById('availableProperties');
    if (!propertiesDiv) {
        return;
    }
    // Show message if no properties available
    if (properties.length === 0) {
        propertiesDiv.innerHTML = '<p>No properties available</p>';
        return;
    }
    
    // Create property cards with booking buttons
    propertiesDiv.innerHTML = properties.map(property => `
        <div class="property-card" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
            <h4>${property.title}</h4>
            <p><strong>Location:</strong> ${property.location}</p>
            <p><strong>Price per night:</strong> $${property.pricePerNight}</p>
            <p><strong>Max guests:</strong> ${property.maxGuests}</p>
            <p><strong>Description:</strong> ${property.description || 'No description available'}</p>
            <button onclick="bookProperty(${property.id})" class="button">Book Now</button>
        </div>
    `).join('');
}

// Handle property booking with price calculation
async function bookProperty(propertyId) {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
        // alert removed
        return;
    }
    
    // Get property details for pricing
    let property = null;
    try {
        const propertyResponse = await fetch(`/api/properties/${propertyId}`);
        if (propertyResponse.ok) {
            property = await propertyResponse.json();
        }
    } catch (error) {
        console.error('Property fetch error:', error);
        // alert removed
        return;
    }
    
    // Get booking details from user
    const checkIn = prompt('Enter check-in date (YYYY-MM-DD):');
    const checkOut = prompt('Enter check-out date (YYYY-MM-DD):');
    const guests = parseInt(prompt('Number of guests:'));
    
    if (!checkIn || !checkOut || !guests) {
        // alert removed
        return;
    }
    
    // Calculate total price based on nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = property ? (property.pricePerNight * nights) : 0;
    
    // Prepare booking data for API
    const bookingData = {
        customerId: parseInt(customerId),
        propertyId: propertyId,
        checkIn: checkIn,
        checkOut: checkOut,
        numberOfGuests: guests,
        totalPrice: totalPrice
    };
    
    // Submit booking to database
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        
        if (response.ok) {
            // alert removed
            location.reload();
        } else {
            const errorText = await response.text();
            // alert removed
        }
    } catch (error) {
        console.error('Booking error:', error);
        // alert removed
    }
}

// Append ?guest=1 to allowed nav links when in guest mode
function appendGuestParam(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const url = new URL(el.getAttribute('href'), window.location.origin);
            url.searchParams.set('guest', '1');
            el.setAttribute('href', url.pathname + url.search);
        }
    });
}

// Utility hide
function hideElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'none';
    }
}

