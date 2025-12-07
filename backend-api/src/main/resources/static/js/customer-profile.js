// Initialize page when DOM loads
document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const isGuest = params.get('guest') === '1';
    
    // Clear localStorage when in guest mode to prevent showing old login
    if (isGuest) {
        localStorage.clear();
    }
    
    const storedCustomerId = localStorage.getItem('customerId');
    const customerId = isGuest ? null : storedCustomerId;

    if (isGuest) {
        appendGuestParam(['navDashboard', 'navProperties', 'navProfile']);
        hideElement('navSubscriptions');
        hideElement('navBookings');
        hideElement('navLogout');
        showGuestCTA();
        return;
    }

    // Redirect if not logged in
    if (!customerId) {
        window.location.href = 'customer-login.html';
        return;
    }

    try {
        await loadProfile(customerId);
        await loadRecentReviews(customerId);
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
            updateProfileHeader(customer);

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

function updateProfileHeader(customer) {
    const avatar = document.getElementById('profileAvatar');
    const nameEl = document.getElementById('profileNameDisplay');
    const emailEl = document.getElementById('profileEmailDisplay');
    if (nameEl) {
        nameEl.textContent = customer.name || 'Your Name';
    }
    if (emailEl) {
        emailEl.textContent = customer.email || '';
    }
    if (avatar) {
        const initials = (customer.name || customer.email || 'CC')
            .split(/\s+/)
            .filter(Boolean)
            .map(part => part[0].toUpperCase())
            .slice(0, 2)
            .join('');
        avatar.textContent = initials || 'CC';
    }
}

async function loadRecentReviews(customerId) {
    const target = document.getElementById('recentReviews');
    if (!target) return;

    try {
        const resp = await fetch(`/api/reviews/customer/${customerId}`);
        if (!resp.ok) throw new Error('Failed to fetch reviews');
        const reviews = await resp.json();
        renderRecentReviews(target, reviews);
    } catch (e) {
        target.innerHTML = '<div style="color:#666;">No recent reviews available.</div>';
    }
}

function renderRecentReviews(container, reviews) {
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<div style="color:#666;">No recent reviews yet.</div>';
        return;
    }

    const top = reviews.slice(0, 3);
    container.innerHTML = top.map(r => `
        <div style="padding:12px; border:1px solid #e5e7eb; border-radius:8px; background:#f9fafb;">
            <div style="font-weight:700; color:#111;">${r.property && r.property.title ? r.property.title : 'Property #' + (r.propertyId || '')}</div>
            <div style="color:#f59e0b; font-size:0.95rem;">${'⭐'.repeat(Math.max(1, Math.min(5, r.rating || 1)))} (${r.rating || 0}/5)</div>
            ${r.comment ? `<div style=\"color:#333; margin-top:6px;\">${r.comment}</div>` : ''}
            <div style="color:#6b7280; font-size:0.85rem; margin-top:6px;">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</div>
        </div>
    `).join('');
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

            updateProfileHeader(updatedCustomer);

            showSuccess('Profile updated successfully!');

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

// Guest call-to-action replacing profile content
function showGuestCTA() {
    const profileSection = document.getElementById('profileContent');
    if (!profileSection) return;

    profileSection.innerHTML = `
        <div style="background: rgba(255,255,255,0.95); padding: 32px; border-radius: 16px; box-shadow: 0 10px 24px rgba(0,0,0,0.2); text-align: center; max-width: 700px; margin: 0 auto;">
            <h3 style="margin-bottom: 10px; color: #111;">Create your profile</h3>
            <p style="margin-bottom: 24px; color: #444;">Sign up or log in to save favorites, manage bookings, and keep your info handy.</p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <a href="customer-signup.html" class="button" style="background:#111; color:#fff; padding: 12px 18px; border-radius: 8px; text-decoration:none;">Sign Up</a>
                <a href="customer-login.html" class="button" style="background:#fff; color:#111; padding: 12px 18px; border-radius: 8px; border:1px solid #111; text-decoration:none;">Log In</a>
            </div>
        </div>
    `;
}

// Append ?guest=1 to nav links when in guest mode
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