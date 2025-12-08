// Customer Bookings JavaScript - Pure Backend Data

document.addEventListener('DOMContentLoaded', async function() {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
        window.location.href = 'customer-login.html';
        return;
    }
    
    await loadCustomerBookings(customerId);
});

async function loadCustomerBookings(customerId) {
    try {
        const response = await fetch(`/api/bookings/customer/${customerId}`);
        if (response.ok) {
            const bookings = await response.json();
            displayBookings(bookings);
        } else {
            document.getElementById('upcomingBookings').innerHTML = 'Error loading bookings';
            document.getElementById('pastBookings').innerHTML = 'Error loading bookings';
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('upcomingBookings').innerHTML = 'Network error';
        document.getElementById('pastBookings').innerHTML = 'Network error';
    }
}

function displayBookings(bookings) {
    const now = new Date();
    const upcoming = bookings.filter(booking => new Date(booking.checkIn) >= now);
    const past = bookings.filter(booking => new Date(booking.checkOut) < now);
    
    displayBookingGroup(upcoming, 'upcomingBookings', true);
    displayBookingGroup(past, 'pastBookings', false);
}

function displayBookingGroup(bookings, containerId, isUpcoming) {
    const container = document.getElementById(containerId);
    
    if (bookings.length === 0) {
        container.innerHTML = `<p style="color:#6b7280; text-align:center; padding:30px;">No ${isUpcoming ? 'upcoming' : 'past'} bookings</p>`;
        return;
    }
    
    container.innerHTML = bookings.map(booking => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const status = getBookingStatus(booking.checkIn, booking.checkOut);
        const statusColor = getStatusColor(booking.checkIn, booking.checkOut);
        
        return `
        <div class="booking-card" style="
            border: 2px solid ${isUpcoming ? '#007bff' : '#d1d5db'}; 
            padding: 24px; 
            margin: 20px 0; 
            border-radius: 12px; 
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'" onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
            
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:16px; border-bottom:2px solid #f3f4f6; padding-bottom:12px;">
                <div style="flex:1;">
                    <h3 style="margin:0 0 8px 0; color:#0b1220; font-size:1.3rem;">${booking.property ? booking.property.title : 'Property'}</h3>
                    <div style="display:inline-block; background:#e3f2fd; padding:6px 12px; border-radius:6px; border:1px solid #90caf9;">
                        <span style="color:#1565c0; font-weight:600; font-size:0.95rem;">📍 ${booking.property ? booking.property.location : 'N/A'}</span>
                    </div>
                </div>
                <span style="
                    padding:6px 14px; 
                    border-radius:20px; 
                    font-weight:600; 
                    font-size:0.85rem;
                    background:${statusColor}20;
                    color:${statusColor};
                    border:1px solid ${statusColor};
                ">${status}</span>
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:20px;">
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Check-in</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">📅 ${checkIn.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                </div>
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Check-out</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">📅 ${checkOut.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                </div>
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Duration</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">🌙 ${nights} night${nights !== 1 ? 's' : ''}</div>
                </div>
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Guests</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">👥 ${booking.numberOfGuests} guest${booking.numberOfGuests !== 1 ? 's' : ''}</div>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
                <div style="font-size:1.4rem; font-weight:700; color:#28a745;">💰 $${Number(booking.totalPrice).toFixed(2)}</div>
                <div style="display:flex; gap:10px;">
                    ${isUpcoming ? `
                        <button onclick="editBooking(${booking.id})" class="button" style="padding:10px 20px; background:#007bff; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Edit</button>
                        <button onclick="cancelBooking(${booking.id})" class="button" style="padding:10px 20px; background:#dc3545; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Cancel</button>
                    ` : `
                        <button onclick="reviewProperty(${booking.property ? booking.property.id : booking.propertyId}, ${booking.id})" class="button" style="padding:10px 20px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Write Review</button>
                        <button onclick="viewBookingDetails(${booking.id})" class="button" style="padding:10px 20px; background:#6c757d; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Details</button>
                    `}
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function getBookingStatus(checkIn, checkOut) {
    const now = new Date();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (now < checkInDate) return 'Upcoming';
    if (now >= checkInDate && now <= checkOutDate) return 'Active';
    return 'Completed';
}

function getStatusColor(checkIn, checkOut) {
    const status = getBookingStatus(checkIn, checkOut);
    switch (status) {
        case 'Upcoming': return '#007bff';
        case 'Active': return '#28a745';
        case 'Completed': return '#6c757d';
        default: return '#000';
    }
}

async function editBooking(bookingId) {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
            alert('Error loading booking details');
            return;
        }
        
        const booking = await response.json();
        const property = booking.property;
        
        // Create modal
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;">
                <div style="background:white; padding:30px; border-radius:12px; max-width:500px; width:90%; box-shadow:0 4px 20px rgba(0,0,0,0.3);">
                    <h3 style="margin-top:0; color:#0b1220;">Edit Booking #${bookingId}</h3>
                    <p style="color:#6b7280; margin-bottom:20px;"><strong>${property.title}</strong> - ${property.location}</p>
                    <form id="editBookingForm" style="display:flex; flex-direction:column; gap:15px;">
                        <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
                            Check-in date
                            <input type="date" id="editCheckIn" value="${booking.checkIn.split('T')[0]}" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px; margin-top:5px;">
                        </label>
                        <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
                            Check-out date
                            <input type="date" id="editCheckOut" value="${booking.checkOut.split('T')[0]}" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px; margin-top:5px;">
                        </label>
                        <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
                            Guests (max ${property.maxGuests || 'unlimited'})
                            <input type="number" id="editGuests" value="${booking.numberOfGuests}" min="1" max="${property.maxGuests || ''}" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px; margin-top:5px;">
                        </label>
                        <div id="editError" style="color:#b91c1c; font-weight:600;"></div>
                        <div id="editTotal" style="font-weight:700; color:#0b1220; padding:10px; background:#f3f4f6; border-radius:6px;"></div>
                        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:10px;">
                            <button type="button" id="editCancel" style="padding:10px 20px; border:1px solid #d1d5db; background:white; border-radius:6px; cursor:pointer;">Cancel</button>
                            <button type="submit" style="padding:10px 20px; background:#007bff; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Update Booking</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        modal.className = 'modal';
        document.body.appendChild(modal);
        
        const form = modal.querySelector('#editBookingForm');
        const checkInEl = modal.querySelector('#editCheckIn');
        const checkOutEl = modal.querySelector('#editCheckOut');
        const guestsEl = modal.querySelector('#editGuests');
        const errorEl = modal.querySelector('#editError');
        const totalEl = modal.querySelector('#editTotal');
        
        const today = new Date().toISOString().split('T')[0];
        checkInEl.min = today;
        checkOutEl.min = today;
        
        const closeModal = () => document.body.removeChild(modal);
        modal.addEventListener('click', (e) => { if (e.target.closest('.modal') === modal && e.target === modal.firstElementChild) closeModal(); });
        modal.querySelector('#editCancel').addEventListener('click', closeModal);
        
        const updateTotal = () => {
            const ci = new Date(checkInEl.value);
            const co = new Date(checkOutEl.value);
            if (checkInEl.value && checkOutEl.value && co > ci && property.pricePerNight !== null) {
                const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
                totalEl.textContent = `New Total: $${(property.pricePerNight * nights).toFixed(2)} for ${nights} night(s)`;
            } else {
                totalEl.textContent = '';
            }
        };
        
        updateTotal();
        checkInEl.addEventListener('change', updateTotal);
        checkOutEl.addEventListener('change', updateTotal);
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.textContent = '';
            
            const newCheckIn = checkInEl.value;
            const newCheckOut = checkOutEl.value;
            const newGuests = parseInt(guestsEl.value, 10);
            
            if (!newCheckIn || !newCheckOut || !newGuests) {
                errorEl.textContent = 'Please fill all fields.';
                return;
            }
            
            const ciDate = new Date(newCheckIn);
            const coDate = new Date(newCheckOut);
            const nights = Math.ceil((coDate - ciDate) / (1000 * 60 * 60 * 24));
            
            if (nights <= 0) {
                errorEl.textContent = 'Check-out must be after check-in.';
                return;
            }
            
            if (property.maxGuests && newGuests > property.maxGuests) {
                errorEl.textContent = `Max guests is ${property.maxGuests}.`;
                return;
            }
            
            const newTotalPrice = property.pricePerNight * nights;
            const updatedBooking = {
                ...booking,
                checkIn: newCheckIn,
                checkOut: newCheckOut,
                numberOfGuests: newGuests,
                totalPrice: newTotalPrice
            };
            
            try {
                const updateResponse = await fetch(`/api/bookings/${bookingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedBooking)
                });
                
                if (updateResponse.ok) {
                    totalEl.textContent = '✓ Booking updated successfully!';
                    totalEl.style.color = '#28a745';
                    setTimeout(() => {
                        closeModal();
                        location.reload();
                    }, 1000);
                } else {
                    const errorText = await updateResponse.text();
                    errorEl.textContent = 'Error: ' + errorText;
                }
            } catch (error) {
                console.error('Error updating booking:', error);
                errorEl.textContent = 'Network error. Please try again.';
            }
        });
        
    } catch (error) {
        console.error('Error loading booking:', error);
        alert('Error loading booking details.');
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Booking cancelled successfully!');
            location.reload();
        } else {
            alert('Error cancelling booking');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Network error. Please try again.');
    }
}

async function reviewProperty(propertyId, bookingId) {
    const customerId = localStorage.getItem('customerId');
    
    const rating = parseInt(prompt('Rate this property (1-5 stars):'));
    const comment = prompt('Write a review (optional):');
    
    if (!rating || rating < 1 || rating > 5) {
        alert('Please provide a valid rating (1-5)');
        return;
    }
    
    const reviewData = {
        customerId: parseInt(customerId),
        propertyId: propertyId,
        rating: rating,
        comment: comment || ''
    };
    
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData)
        });
        
        if (response.ok) {
            alert('Review submitted successfully!');
        } else {
            alert('Error submitting review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Network error. Please try again.');
    }
}

async function viewBookingDetails(bookingId) {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (response.ok) {
            const booking = await response.json();
            
            alert(`Booking Details:
Property: ${booking.property ? booking.property.title : 'Unknown'}
Location: ${booking.property ? booking.property.location : 'Unknown'}
Check-in: ${new Date(booking.checkIn).toLocaleDateString()}
Check-out: ${new Date(booking.checkOut).toLocaleDateString()}
Guests: ${booking.numberOfGuests}
Total Price: $${booking.totalPrice}
Status: ${getBookingStatus(booking.checkIn, booking.checkOut)}`);
        }
    } catch (error) {
        console.error('Error loading booking details:', error);
        alert('Error loading booking details');
    }
}