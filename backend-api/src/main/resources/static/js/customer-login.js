// Customer Login JavaScript - Backend Authentication with Password Verification

// Wait for form to be available and add login functionality
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    // Get login credentials from form
    const loginData = {
        email: document.getElementById('email').value.trim().toLowerCase(),
        password: document.getElementById('password').value
    };

    // Validate that both fields are filled
    if (!loginData.email || !loginData.password) {
        console.log('Email and password required');
        return;
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
        console.log('Invalid email format');
        return;
    }

    try {
        // Send login request to backend API
        const response = await fetch('/api/customers/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            // Login successful - get customer data
            const customer = await response.json();
            console.log('Customer authenticated successfully:', customer);

            // Store customer information in browser for session management
            localStorage.setItem('customerId', customer.id);
            localStorage.setItem('customerName', customer.name);
            localStorage.setItem('customerEmail', customer.email);
            localStorage.setItem('customerPhone', customer.phoneNumber || '');
            localStorage.setItem('customerAddress', customer.address || '');

            // Redirect to customer dashboard after successful login
            window.location.href = 'customer-dashboard.html';

        } else if (response.status === 401) {
            // Wrong password or email
            console.log('Invalid email or password');
        } else if (response.status === 404) {
            // Account not found - suggest signup
            console.log('No account found with this email');
            // Optional redirect to signup page
            window.location.href = 'customer-signup.html';
        } else {
            // Other login errors
            const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
            console.error('Login error:', errorData);
        }

    } catch (error) {
        // Handle network or connection errors
        console.error('Network error:', error);
        // Error is logged to console instead of showing popup
    }
});