// Customer Dashboard JavaScript with Fetch API
document.addEventListener('DOMContentLoaded', async function() {
    const customerId = localStorage.getItem('customerId');
    
    if (!customerId) {
        window.location.href = 'customer-login.html';
        return;
    }
    
    await loadCustomerInfo(customerId);
    await loadCustomerData(customerId);
    await loadAvailableProperties();
});

async function loadCustomerInfo(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();
            // Use the name field from Customer entity
            const customerName = customer.name;
            document.getElementById('welcomeMessage').textContent = `Welcome back, ${customerName}!`;
            
            // Update localStorage with fresh backend data
            localStorage.setItem('customerName', customerName);
            localStorage.setItem('customerEmail', customer.email);
        } else {
            console.error('Failed to load customer info:', response.status);
            // Fallback to localStorage name if backend call fails
            const storedName = localStorage.getItem('customerName');
            if (storedName) {
                document.getElementById('welcomeMessage').textContent = `Welcome back, ${storedName}!`;
            }
        }
    } catch (error) {
        console.error('Error loading customer info:', error);
        // Fallback to localStorage name if network error
        const storedName = localStorage.getItem('customerName');
        if (storedName) {
            document.getElementById('welcomeMessage').textContent = `Welcome back, ${storedName}!`;
        }
    }
}

async function loadCustomerData(customerId) {
    try {
        // Fetch customer bookings
        const bookingsResponse = await fetch(`/api/bookings/customer/${customerId}`);
        if (bookingsResponse.ok) {
            const bookings = await bookingsResponse.json();
            displayBookings(bookings);
        }
        
        // Fetch customer subscriptions
        const subscriptionsResponse = await fetch(`/api/subscriptions/customer/${customerId}`);
        if (subscriptionsResponse.ok) {
            const subscriptions = await subscriptionsResponse.json();
            displaySubscriptions(subscriptions);
        }
        
    } catch (error) {
        console.error('Error loading customer data:', error);
    }
}

async function loadAvailableProperties() {
    try {
        const response = await fetch('/api/properties');
        if (response.ok) {
            const properties = await response.json();
            displayProperties(properties);
        }
    } catch (error) {
        console.error('Error loading properties:', error);
        document.getElementById('availableProperties').innerHTML = '<p>Error loading properties</p>';
    }
}

function displayBookings(bookings) {
    const bookingsList = document.getElementById('upcomingBookings');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<li>No upcoming trips — start searching for your next stay!</li>';
        return;
    }
    
    const upcomingBookings = bookings.filter(booking => 
        new Date(booking.checkIn) > new Date()
    );
    
    if (upcomingBookings.length === 0) {
        bookingsList.innerHTML = '<li>No upcoming trips — start searching for your next stay!</li>';
        return;
    }
    
    bookingsList.innerHTML = upcomingBookings.map(booking => `
        <li>
            <strong>Property:</strong> ${booking.property ? booking.property.title : 'Property #' + booking.propertyId}<br>
            <strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}<br>
            <strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}<br>
            <strong>Total Price:</strong> $${booking.totalPrice}
        </li>
    `).join('');
}

function displaySubscriptions(subscriptions) {
    const subscriptionsDiv = document.getElementById('customerSubscriptions');
    
    if (subscriptions.length === 0) {
        subscriptionsDiv.innerHTML = 'No active subscriptions';
        return;
    }
    
    subscriptionsDiv.innerHTML = subscriptions.map(subscription => `
        <div class="subscription-item">
            <strong>Plan:</strong> ${subscription.planType}<br>
            <strong>Price:</strong> $${subscription.price}/month<br>
            <strong>Start Date:</strong> ${new Date(subscription.startDate).toLocaleDateString()}
        </div>
    `).join('');
}

function displayProperties(properties) {
    const propertiesDiv = document.getElementById('availableProperties');
    
    if (properties.length === 0) {
        propertiesDiv.innerHTML = '<p>No properties available</p>';
        return;
    }
    
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

async function bookProperty(propertyId) {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
        alert('Please log in to book a property');
        return;
    }
    
    // Get property details first to calculate price
    let property = null;
    try {
        const propertyResponse = await fetch(`/api/properties/${propertyId}`);
        if (propertyResponse.ok) {
            property = await propertyResponse.json();
        }
    } catch (error) {
        console.error('Error fetching property:', error);
        alert('Error loading property details');
        return;
    }
    
    // Create a proper booking form
    const checkIn = prompt('Enter check-in date (YYYY-MM-DD):');
    const checkOut = prompt('Enter check-out date (YYYY-MM-DD):');
    const guests = parseInt(prompt('Number of guests:'));
    
    if (!checkIn || !checkOut || !guests) {
        alert('Please provide all booking details');
        return;
    }
    
    // Calculate total price based on dates and property price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = property ? (property.pricePerNight * nights) : 0;
    
    const bookingData = {
        customerId: parseInt(customerId),
        propertyId: propertyId,
        checkIn: checkIn,
        checkOut: checkOut,
        numberOfGuests: guests,
        totalPrice: totalPrice
    };
    
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        if (response.ok) {
            const booking = await response.json();
            alert(`Booking created successfully! Total: $${totalPrice} for ${nights} nights`);
            location.reload(); // Refresh to show new booking
        } else {
            const errorText = await response.text();
            alert('Error creating booking: ' + errorText);
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('Network error. Please try again.');
    }
}