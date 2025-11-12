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
        container.innerHTML = `<p>No ${isUpcoming ? 'upcoming' : 'past'} bookings</p>`;
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card" style="border: 1px solid #ddd; padding: 20px; margin: 15px 0; border-radius: 10px; background: ${isUpcoming ? '#f8f9fa' : '#e9ecef'};">
            <h4>Booking #${booking.id}</h4>
            <div class="booking-details">
                <p><strong>🏠 Property:</strong> ${booking.property ? booking.property.title : 'Loading...'}</p>
                <p><strong>📍 Location:</strong> ${booking.property ? booking.property.location : 'Loading...'}</p>
                <p><strong>📅 Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                <p><strong>📅 Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
                <p><strong>👥 Guests:</strong> ${booking.numberOfGuests}</p>
                <p><strong>💰 Total Price:</strong> $${booking.totalPrice}</p>
                <p><strong>📝 Status:</strong> <span style="color: ${getStatusColor(booking.checkIn, booking.checkOut)}">${getBookingStatus(booking.checkIn, booking.checkOut)}</span></p>
            </div>
            <div class="booking-actions">
                ${isUpcoming ? `
                    <button onclick="editBooking(${booking.id})" class="button">Edit Booking</button>
                    <button onclick="cancelBooking(${booking.id})" class="button" style="background-color: #dc3545;">Cancel</button>
                ` : `
                    <button onclick="reviewProperty(${booking.property ? booking.property.id : booking.propertyId}, ${booking.id})" class="button">Write Review</button>
                    <button onclick="viewBookingDetails(${booking.id})" class="button">View Details</button>
                `}
            </div>
        </div>
    `).join('');
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
    // Get current booking details
    try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
            alert('Error loading booking details');
            return;
        }
        
        const booking = await response.json();
        
        // Simple edit form
        const newCheckIn = prompt('Enter new check-in date (YYYY-MM-DD):', booking.checkIn);
        const newCheckOut = prompt('Enter new check-out date (YYYY-MM-DD):', booking.checkOut);
        const newGuests = parseInt(prompt('Enter number of guests:', booking.numberOfGuests));
        
        if (!newCheckIn || !newCheckOut || !newGuests) {
            return; // User cancelled
        }
        
        // Calculate new price
        const property = booking.property;
        const checkInDate = new Date(newCheckIn);
        const checkOutDate = new Date(newCheckOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const newTotalPrice = property.pricePerNight * nights;
        
        const updatedBooking = {
            ...booking,
            checkIn: newCheckIn,
            checkOut: newCheckOut,
            numberOfGuests: newGuests,
            totalPrice: newTotalPrice
        };
        
        const updateResponse = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedBooking)
        });
        
        if (updateResponse.ok) {
            alert('Booking updated successfully!');
            location.reload();
        } else {
            alert('Error updating booking');
        }
        
    } catch (error) {
        console.error('Error editing booking:', error);
        alert('Network error. Please try again.');
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