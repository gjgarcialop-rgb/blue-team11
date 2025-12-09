// Customer Properties Page - Browse and book available properties
// Features: Property filtering, image carousel, booking with payment modal, reviews

let allProperties = [];
let filteredProperties = [];
window.propertyImages = {}; // Store images for each property globally

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
        hideElement('navReviews');
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

function formatValue(val, fallback = 'N/A') {
    return (val !== undefined && val !== null && val !== '') ? val : fallback;
}

function displayProperties(properties) {
    const container = document.getElementById('propertiesContainer');
    
    if (properties.length === 0) {
        container.innerHTML = '<p style="color:#6b7280; text-align:center; padding:30px;">No properties match your criteria.</p>';
        return;
    }
    
    container.innerHTML = properties.map(property => {
        const price = property.pricePerNight !== undefined && property.pricePerNight !== null
            ? Number(property.pricePerNight)
            : null;
        const maxGuests = property.maxGuests !== undefined && property.maxGuests !== null
            ? property.maxGuests
            : null;

        // Parse images
        let images = [];
        if (property.images) {
            try {
                if (property.images.startsWith('[')) {
                    images = JSON.parse(property.images);
                } else if (property.images.startsWith('data:') || property.images.startsWith('http')) {
                    images = [property.images];
                }
            } catch (e) {
                console.error('Image parse error:', e);
            }
        }
        
        window.propertyImages[property.id] = { images, index: 0 };

        return `
        <div class="property-card" style="
            border: 2px solid #28a745; 
            padding: 24px; 
            margin: 20px 0; 
            border-radius: 12px; 
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'" onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
            
            ${images.length > 0 ? `
                <div style="position:relative; margin-bottom:20px;">
                    <img id="img-${property.id}" style="width:100%; height:300px; object-fit:cover; border-radius:8px; background:#f0f0f0;">
                    ${images.length > 1 ? `
                        <button onclick="window.changeCustomerImg(${property.id}, -1)" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.7); color:white; border:none; padding:10px 15px; border-radius:50%; cursor:pointer; font-size:20px;">❮</button>
                        <button onclick="window.changeCustomerImg(${property.id}, 1)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.7); color:white; border:none; padding:10px 15px; border-radius:50%; cursor:pointer; font-size:20px;">❯</button>
                        <div id="counter-${property.id}" style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.7); color:white; padding:5px 10px; border-radius:5px;">1 / ${images.length}</div>
                    ` : ''}
                </div>
            ` : '<div style="padding:40px; background:#f5f5f5; text-align:center; color:#999; margin-bottom:20px; border-radius:8px;">No images available</div>'}
            
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:16px; border-bottom:2px solid #f3f4f6; padding-bottom:12px;">
                <div style="flex:1;">
                    <h3 style="margin:0 0 8px 0; color:#0b1220; font-size:1.4rem;">${formatValue(property.title)}</h3>
                    <div style="display:inline-block; background:#e3f2fd; padding:6px 12px; border-radius:6px; border:1px solid #90caf9;">
                        <span style="color:#1565c0; font-weight:600; font-size:0.95rem;">📍 ${formatValue(property.location)}</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.5rem; font-weight:700; color:#28a745;">${price !== null ? `$${price}` : 'N/A'}</div>
                    <div style="font-size:0.85rem; color:#6b7280;">per night</div>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Max Guests</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">👥 ${formatValue(maxGuests)}</div>
                </div>
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Provider</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">🏠 ${property.provider ? formatValue(property.provider.name || `${property.provider.firstName || ''} ${property.provider.lastName || ''}`.trim()) : 'Unknown'}</div>
                </div>
            </div>
            
            <div style="background:#f9fafb; padding:12px; border-radius:8px; margin-bottom:16px;">
                <div style="color:#6b7280; font-size:0.85rem; margin-bottom:6px;">Amenities</div>
                <div style="color:#0b1220; font-weight:500; font-size:0.95rem;">🎯 ${formatValue(property.amenities)}</div>
            </div>
            
            <div style="color:#374151; line-height:1.6; margin-bottom:20px; font-size:0.95rem;">
                ${formatValue(property.description)}
            </div>
            
            <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button onclick="viewPropertyDetails(${property.id})" class="button" style="padding:10px 20px; background:#007bff; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">View Details</button>
                <button onclick="bookProperty(${property.id})" class="button" style="padding:10px 20px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Book Now</button>
            </div>
        </div>
    `;
    }).join('');
    
    // Load images after DOM is updated
    setTimeout(() => {
        properties.forEach(property => {
            const data = window.propertyImages[property.id];
            if (data && data.images.length > 0) {
                loadPropertyImage(property.id, 0);
            }
        });
    }, 10);
}

function loadPropertyImage(propId, index) {
    const data = window.propertyImages[propId];
    if (!data || !data.images.length) return;
    
    const img = document.getElementById(`img-${propId}`);
    if (!img) return;
    
    const imageData = data.images[index];
    
    if (imageData.startsWith('data:image')) {
        try {
            const parts = imageData.split(',');
            const mimeType = parts[0].match(/:(.*?);/)[1];
            const base64 = parts[1];
            
            const byteChars = atob(base64);
            const byteArray = new Uint8Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
                byteArray[i] = byteChars.charCodeAt(i);
            }
            const blob = new Blob([byteArray], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);
            
            img.src = blobUrl;
        } catch (err) {
            console.error(`Error loading image for property ${propId}:`, err);
        }
    } else {
        img.src = imageData;
    }
}

window.changeCustomerImg = function(propId, dir) {
    const data = window.propertyImages[propId];
    if (!data || !data.images.length) return;
    
    data.index = (data.index + dir + data.images.length) % data.images.length;
    
    loadPropertyImage(propId, data.index);
    
    const counter = document.getElementById(`counter-${propId}`);
    if (counter) counter.textContent = `${data.index + 1} / ${data.images.length}`;
}

// Filter properties by location, price, and number of guests
function filterProperties() {
    const locationFilter = document.getElementById('locationFilter').value.toLowerCase();
    const maxPrice = parseFloat(document.getElementById('maxPriceFilter').value) || Infinity;
    const minGuests = parseInt(document.getElementById('guestsFilter').value) || 0;
    
    filteredProperties = allProperties.filter(property => {
        // Location filter
        const locationMatch = !locationFilter || 
            (property.location && property.location.toLowerCase().includes(locationFilter));
        
        // Price filter - handle null/undefined values
        const propertyPrice = property.pricePerNight !== undefined && property.pricePerNight !== null 
            ? Number(property.pricePerNight) 
            : Infinity;
        const priceMatch = propertyPrice <= maxPrice;
        
        // Guests filter - handle null/undefined values
        const propertyMaxGuests = property.maxGuests !== undefined && property.maxGuests !== null 
            ? Number(property.maxGuests) 
            : 0;
        const guestsMatch = propertyMaxGuests >= minGuests;
        
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
        // alert removed
    }
}

function showPropertyModal(property, reviews) {
    const price = property.pricePerNight !== undefined && property.pricePerNight !== null
        ? Number(property.pricePerNight)
        : null;

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
            <p><strong>Location:</strong> ${formatValue(property.location)}</p>
            <p><strong>Price per night:</strong> ${price !== null ? `$${price}` : 'N/A'}</p>
            <p><strong>Max guests:</strong> ${formatValue(property.maxGuests)}</p>
            <p><strong>Provider:</strong> ${property.provider ? formatValue(property.provider.name || `${property.provider.firstName || ''} ${property.provider.lastName || ''}`.trim()) : 'Unknown'}</p>
            <p><strong>Amenities:</strong> ${formatValue(property.amenities)}</p>
            <p><strong>Description:</strong> ${formatValue(property.description)}</p>
            
            <h3>Reviews (${reviews.length}) - Average Rating: ${avgRating}</h3>
            <div style="max-height: 200px; overflow-y: auto;">
                ${reviews.length > 0 ? reviews.map(review => `
                    <div style="border: 1px solid #eee; padding: 10px; margin: 5px 0; border-radius: 5px;">
                        <p><strong>Rating:</strong> ${'⭐'.repeat(review.rating)} (${review.rating}/5)</p>
                        ${review.comment ? `<p><strong>Comment:</strong> ${review.comment}</p>` : ''}
                        <p><small>By: ${review.customer ? (review.customer.name || review.customer.firstName + ' ' + review.customer.lastName || review.customer.email) : review.guestName || 'Anonymous'}</small></p>
                        ${review.providerReply ? `<div style="background:#f0f9ff; padding:10px; margin-top:8px; border-radius:5px; border-left:3px solid #007bff;"><p style="margin:0; font-weight:600; color:#0b1220; font-size:0.85rem;">Provider Response:</p><p style="margin:5px 0 0 0; color:#374151; font-size:0.9rem;">${review.providerReply}</p></div>` : ''}
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
        // alert removed
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
        // alert removed
        return;
    }

    renderBookingModal(property, customerId);
}

function renderBookingModal(property, customerId) {
    const price = property.pricePerNight !== undefined && property.pricePerNight !== null
        ? Number(property.pricePerNight)
        : null;

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; align-items: center;
        justify-content: center; z-index: 1000;
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 28px; border-radius: 12px; max-width: 540px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.25);">
        <h2 style="margin-top:0;">Book ${formatValue(property.title)}</h2>
        <p><strong>Location:</strong> ${formatValue(property.location)}</p>
        <p><strong>Price per night:</strong> ${price !== null ? `$${price}` : 'N/A'}</p>
        <p><strong>Max guests:</strong> ${formatValue(property.maxGuests)}</p>
        <p><strong>Amenities:</strong> ${formatValue(property.amenities)}</p>
        <p><strong>Description:</strong> ${formatValue(property.description)}</p>

        <form id="bookingForm" style="margin-top: 15px; display: grid; gap: 12px;">
          <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
            Check-in date
            <input type="date" id="bookingCheckIn" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px;">
          </label>
          <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
            Check-out date
            <input type="date" id="bookingCheckOut" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px;">
          </label>
          <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
            Guests (max ${formatValue(property.maxGuests)})
            <input type="number" id="bookingGuests" min="1" max="${property.maxGuests || ''}" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px;">
          </label>
          <div id="bookingError" style="color:#b91c1c; font-weight:600;"></div>
          <div id="bookingTotal" style="font-weight:700; color:#0b1220;"></div>
          <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:6px;">
            <button type="button" id="bookingCancel" class="button" style="padding:10px 14px;">Cancel</button>
            <button type="submit" class="button" style="background:#28a745; color:white; padding:10px 14px;">Confirm Booking</button>
          </div>
        </form>
      </div>
    `;

    modal.className = 'modal';
    document.body.appendChild(modal);

    const form = modal.querySelector('#bookingForm');
    const checkInEl = modal.querySelector('#bookingCheckIn');
    const checkOutEl = modal.querySelector('#bookingCheckOut');
    const guestsEl = modal.querySelector('#bookingGuests');
    const errorEl = modal.querySelector('#bookingError');
    const totalEl = modal.querySelector('#bookingTotal');

    const today = new Date().toISOString().split('T')[0];
    checkInEl.min = today;
    checkOutEl.min = today;

    const closeModal = () => document.body.removeChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    modal.querySelector('#bookingCancel').addEventListener('click', closeModal);

    const updateTotal = () => {
        const ci = new Date(checkInEl.value);
        const co = new Date(checkOutEl.value);
        if (checkInEl.value && checkOutEl.value && co > ci && price !== null) {
            const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
            totalEl.textContent = `Total for ${nights} night(s): $${(price * nights).toFixed(2)}`;
        } else {
            totalEl.textContent = '';
        }
    };

    checkInEl.addEventListener('change', updateTotal);
    checkOutEl.addEventListener('change', updateTotal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.textContent = '';
        totalEl.textContent = '';

        const checkIn = checkInEl.value;
        const checkOut = checkOutEl.value;
        const guests = parseInt(guestsEl.value, 10);

        if (!checkIn || !checkOut || !guests) {
            errorEl.textContent = 'Please fill all booking details.';
            return;
        }

        const ciDate = new Date(checkIn);
        const coDate = new Date(checkOut);
        const nights = Math.ceil((coDate - ciDate) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            errorEl.textContent = 'Check-out must be after check-in.';
            return;
        }

        if (property.maxGuests && guests > property.maxGuests) {
            errorEl.textContent = `Max guests for this property is ${property.maxGuests}.`;
            return;
        }

        const totalPrice = price !== null ? price * nights : 0;

        // Show payment modal
        showPaymentModal(property, customerId, checkIn, checkOut, guests, totalPrice, closeModal);
    });
}

function showPaymentModal(property, customerId, checkIn, checkOut, guests, totalPrice, closeBookingModal) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white; padding:30px; border-radius:12px; width:90%; max-width:400px; box-shadow:0 10px 40px rgba(0,0,0,0.3);';
    
    content.innerHTML = `
        <h2 style="margin-top:0; color:#0b1220;">Payment Information</h2>
        <form id="paymentForm" style="display:grid; gap:15px;">
            <div>
                <label style="font-weight:600; color:#0b1220; display:block; margin-bottom:5px;">Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" style="padding:10px; border:1px solid #d1d5db; border-radius:8px; width:100%; box-sizing:border-box;">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div>
                    <label style="font-weight:600; color:#0b1220; display:block; margin-bottom:5px;">Expiry</label>
                    <input type="text" placeholder="MM/YY" maxlength="5" style="padding:10px; border:1px solid #d1d5db; border-radius:8px; width:100%; box-sizing:border-box;">
                </div>
                <div>
                    <label style="font-weight:600; color:#0b1220; display:block; margin-bottom:5px;">CVV</label>
                    <input type="text" placeholder="123" maxlength="3" style="padding:10px; border:1px solid #d1d5db; border-radius:8px; width:100%; box-sizing:border-box;">
                </div>
            </div>
            <div>
                <label style="font-weight:600; color:#0b1220; display:block; margin-bottom:5px;">Name on Card</label>
                <input type="text" placeholder="John Doe" style="padding:10px; border:1px solid #d1d5db; border-radius:8px; width:100%; box-sizing:border-box;">
            </div>
            <div style="font-size:1.1rem; font-weight:700; color:#0b1220; padding:10px 0;">
                Total: $${totalPrice.toFixed(2)}
            </div>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button type="button" id="paymentCancel" style="flex:1; padding:12px; background:#e5e7eb; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Cancel</button>
                <button type="submit" style="flex:1; padding:12px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Pay Now</button>
            </div>
        </form>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    const closePaymentModal = () => document.body.removeChild(modal);
    
    modal.addEventListener('click', (e) => { 
        if (e.target === modal) closePaymentModal(); 
    });
    
    content.querySelector('#paymentCancel').addEventListener('click', closePaymentModal);
    
    content.querySelector('#paymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const bookingData = {
            customerId: parseInt(customerId),
            propertyId: property.id,
            checkIn: checkIn,
            checkOut: checkOut,
            numberOfGuests: guests,
            totalPrice: totalPrice
        };

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                closePaymentModal();
                closeBookingModal();
                window.location.href = 'customer-bookings.html';
            } else {
                alert('Booking failed. Please try again.');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
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

