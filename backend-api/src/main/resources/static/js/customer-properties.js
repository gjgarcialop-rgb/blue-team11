// Customer Properties JavaScript - Pure Backend Data
let allProperties = [];
let filteredProperties = [];

document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const isGuest = params.get('guest') === '1';
    
    // Clear localStorage when in guest mode to prevent showing old login
    if (isGuest) {
        localStorage.clear();
    }

    if (isGuest) {
        appendGuestParam(['navDashboard', 'navProperties', 'navProfile']);
        hideElement('navSubscriptions');
        hideElement('navBookings');
        hideElement('navLogout');
    }

    await loadAllProperties();
});

async function loadAllProperties() {
    try {
        const response = await fetch('/api/properties');
        if (response.ok) {
            allProperties = await response.json();
            filteredProperties = [...allProperties];
            displayProperties(filteredProperties);
        } else {
            document.getElementById('propertiesContainer').innerHTML = 
                '<p>Error loading properties. Please try again later.</p>';
        }
    } catch (error) {
        console.error('Error loading properties:', error);
        document.getElementById('propertiesContainer').innerHTML = 
            '<p>Network error. Please check your connection.</p>';
    }
}

function displayProperties(properties) {
    const container = document.getElementById('propertiesContainer');
    
    if (properties.length === 0) {
        container.innerHTML = '<p>No properties match your criteria.</p>';
        return;
    }
    
    container.innerHTML = properties.map(property => `
        <div class="property-card" style="border: 1px solid #ddd; padding: 20px; margin: 15px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3>${property.title}</h3>
            <div class="property-details">
                <p><strong>📍 Location:</strong> ${property.location}</p>
                <p><strong>💰 Price:</strong> $${property.pricePerNight}/night</p>
                <p><strong>👥 Max Guests:</strong> ${property.maxGuests}</p>
                <p><strong>🏠 Provider:</strong> ${property.provider ? property.provider.firstName + ' ' + property.provider.lastName : 'Unknown'}</p>
                ${property.amenities ? `<p><strong>🎯 Amenities:</strong> ${property.amenities}</p>` : ''}
                ${property.description ? `<p><strong>📝 Description:</strong> ${property.description}</p>` : ''}
            </div>
            <div class="property-actions">
                <button onclick="viewPropertyDetails(${property.id})" class="button">View Details</button>
                <button onclick="bookProperty(${property.id})" class="button" style="background-color: #28a745;">Book Now</button>
            </div>
        </div>
    `).join('');
}

function filterProperties() {
    const locationFilter = document.getElementById('locationFilter').value.toLowerCase();
    const maxPrice = parseFloat(document.getElementById('maxPriceFilter').value) || Infinity;
    const minGuests = parseInt(document.getElementById('guestsFilter').value) || 0;
    
    filteredProperties = allProperties.filter(property => {
        const locationMatch = !locationFilter || property.location.toLowerCase().includes(locationFilter);
        const priceMatch = property.pricePerNight <= maxPrice;
        const guestsMatch = property.maxGuests >= minGuests;
        
        return locationMatch && priceMatch && guestsMatch;
    });
    
    displayProperties(filteredProperties);
}

function clearFilters() {
    document.getElementById('locationFilter').value = '';
    document.getElementById('maxPriceFilter').value = '';
    document.getElementById('guestsFilter').value = '';
    filteredProperties = [...allProperties];
    displayProperties(filteredProperties);
}

async function viewPropertyDetails(propertyId) {
    try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (response.ok) {
            const property = await response.json();
            
            // Fetch reviews for this property
            const reviewsResponse = await fetch(`/api/reviews/property/${propertyId}`);
            let reviews = [];
            if (reviewsResponse.ok) {
                reviews = await reviewsResponse.json();
            }
            
            showPropertyModal(property, reviews);
        }
    } catch (error) {
        console.error('Error loading property details:', error);
        alert('Error loading property details');
    }
}

function showPropertyModal(property, reviews) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); display: flex; align-items: center; 
        justify-content: center; z-index: 1000;
    `;
    
    const avgRating = reviews.length > 0 ? 
        (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 'No ratings';
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <h2>${property.title}</h2>
            <p><strong>Location:</strong> ${property.location}</p>
            <p><strong>Price per night:</strong> $${property.pricePerNight}</p>
            <p><strong>Max guests:</strong> ${property.maxGuests}</p>
            <p><strong>Provider:</strong> ${property.provider ? property.provider.firstName + ' ' + property.provider.lastName : 'Unknown'}</p>
            ${property.amenities ? `<p><strong>Amenities:</strong> ${property.amenities}</p>` : ''}
            ${property.description ? `<p><strong>Description:</strong> ${property.description}</p>` : ''}
            
            <h3>Reviews (${reviews.length}) - Average Rating: ${avgRating}</h3>
            <div style="max-height: 200px; overflow-y: auto;">
                ${reviews.length > 0 ? reviews.map(review => `
                    <div style="border: 1px solid #eee; padding: 10px; margin: 5px 0; border-radius: 5px;">
                        <p><strong>Rating:</strong> ${'⭐'.repeat(review.rating)} (${review.rating}/5)</p>
                        ${review.comment ? `<p><strong>Comment:</strong> ${review.comment}</p>` : ''}
                        <p><small>By: ${review.customer ? review.customer.firstName + ' ' + review.customer.lastName : 'Anonymous'}</small></p>
                    </div>
                `).join('') : '<p>No reviews yet.</p>'}
            </div>
            
            <div style="margin-top: 20px;">
                <button onclick="bookProperty(${property.id}); document.body.removeChild(this.closest('.modal'))" class="button" style="background-color: #28a745; margin-right: 10px;">Book This Property</button>
                <button onclick="document.body.removeChild(this.closest('.modal'))" class="button">Close</button>
            </div>
        </div>
    `;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

async function bookProperty(propertyId) {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
        alert('Please log in to book a property');
        window.location.href = 'customer-login.html';
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
        console.error('Error fetching property:', error);
        alert('Error loading property details');
        return;
    }
    
    const checkIn = prompt('Enter check-in date (YYYY-MM-DD):');
    const checkOut = prompt('Enter check-out date (YYYY-MM-DD):');
    const guests = parseInt(prompt('Number of guests:'));
    
    if (!checkIn || !checkOut || !guests) {
        alert('Please provide all booking details');
        return;
    }
    
    // Validate guest count
    if (guests > property.maxGuests) {
        alert(`This property can accommodate maximum ${property.maxGuests} guests`);
        return;
    }
    
    // Calculate total price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = property.pricePerNight * nights;
    
    if (nights <= 0) {
        alert('Check-out date must be after check-in date');
        return;
    }
    
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
            alert(`Booking created successfully! 
                   Property: ${property.title}
                   Dates: ${checkIn} to ${checkOut} (${nights} nights)
                   Total: $${totalPrice}`);
        } else {
            const errorText = await response.text();
            alert('Error creating booking: ' + errorText);
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('Network error. Please try again.');
    }
}

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

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'none';
    }
}